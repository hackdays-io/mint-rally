// ABOUTME: Resolves the read-only RPC endpoints used for on-chain reads.
// ABOUTME: Fails over only for endpoint availability errors and validates each endpoint's chain.

import { ethers } from "ethers";

// Chains for which a hosted RPC fallback makes sense. Local chains are excluded
// because no public endpoint can serve them.
const REMOTE_CHAIN_IDS = ["137", "80001"];

const envChainId = process.env.NEXT_PUBLIC_CHAIN_ID;

const thirdwebRpcUrl = () => {
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
  if (!clientId || !envChainId || !REMOTE_CHAIN_IDS.includes(envChainId))
    return null;
  return `https://${envChainId}.rpc.thirdweb.com/${clientId}`;
};

/**
 * Read-only RPC endpoints in priority order.
 * NEXT_PUBLIC_PROVIDER_RPC comes first, then any comma separated endpoints in
 * NEXT_PUBLIC_PROVIDER_RPC_FALLBACKS, then the thirdweb RPC derived from
 * NEXT_PUBLIC_THIRDWEB_CLIENT_ID.
 */
export const getReadonlyRpcUrls = (): string[] => {
  const configured = [
    process.env.NEXT_PUBLIC_PROVIDER_RPC,
    ...(process.env.NEXT_PUBLIC_PROVIDER_RPC_FALLBACKS?.split(",") ?? []),
    thirdwebRpcUrl(),
  ];
  const urls = configured
    .map((url) => url?.trim())
    .filter((url): url is string => !!url);
  return Array.from(new Set(urls));
};

type RpcErrorLike = {
  code?: string | number;
  status?: string | number;
  reason?: string;
  message?: string;
  error?: unknown;
  serverError?: unknown;
};

const TRANSPORT_ERROR_CODES = new Set([
  "NETWORK_ERROR",
  "TIMEOUT",
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",
]);

const SEMANTIC_ERROR_PATTERN =
  /execution reverted|revert(?:ed| reason)?|invalid (?:argument|params)|insufficient funds|nonce (?:is )?too low/i;
const AVAILABILITY_ERROR_PATTERN =
  /app is inactive|rate limit|too many requests|request limit|quota|temporar(?:y|ily) unavailable|service unavailable|gateway timeout|unauthori[sz]ed|forbidden|(?:invalid|missing) api key|project .*?(?:disabled|inactive)|missing response|failed response|failed to fetch|invalid json|socket hang up/i;

const getErrorChain = (error: unknown): RpcErrorLike[] => {
  const chain: RpcErrorLike[] = [];
  const queue: unknown[] = [error];
  const seen = new Set<unknown>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);

    const rpcError = current as RpcErrorLike;
    chain.push(rpcError);
    queue.push(rpcError.error, rpcError.serverError);
  }

  return chain;
};

/**
 * Retry transport and endpoint-availability failures only. Semantic JSON-RPC
 * errors must reach the caller so a fallback cannot turn a genuine revert into
 * a stale or otherwise different successful result.
 */
const isRetryableRpcError = (error: unknown): boolean => {
  const chain = getErrorChain(error);
  const message = chain
    .map((item) => `${item.reason ?? ""} ${item.message ?? ""}`)
    .join(" ");

  if (SEMANTIC_ERROR_PATTERN.test(message)) return false;

  if (chain.some((item) => TRANSPORT_ERROR_CODES.has(String(item.code ?? ""))))
    return true;

  if (chain.some((item) => item.serverError !== undefined)) return true;

  if (
    chain.some((item) => {
      const status = Number(item.status);
      return (
        [401, 403, 404, 405, 408, 425, 429].includes(status) || status >= 500
      );
    })
  )
    return true;

  if (chain.some((item) => ["-32002", "-32005"].includes(String(item.code))))
    return true;

  return AVAILABILITY_ERROR_PATTERN.test(message);
};

class FailoverJsonRpcProvider extends ethers.providers.StaticJsonRpcProvider {
  private readonly endpointProviders: ethers.providers.StaticJsonRpcProvider[];
  private readonly expectedChainId: number;
  private readonly networkChecks = new WeakMap<
    ethers.providers.StaticJsonRpcProvider,
    Promise<string>
  >();

  constructor(urls: string[], network: number) {
    super(urls[0], network);
    this.expectedChainId = network;
    this.endpointProviders = urls.map(
      (url) => new ethers.providers.StaticJsonRpcProvider(url, network)
    );
  }

  private verifyNetwork(
    provider: ethers.providers.StaticJsonRpcProvider
  ): Promise<string> {
    const existingCheck = this.networkChecks.get(provider);
    if (existingCheck) return existingCheck;

    const check = provider
      .send("eth_chainId", [])
      .then((rawChainId) => {
        let actualChainId: number;
        try {
          actualChainId = ethers.BigNumber.from(rawChainId).toNumber();
        } catch {
          const error: any = new Error(
            "RPC endpoint returned an invalid chain ID"
          );
          error.code = "NETWORK_ERROR";
          throw error;
        }

        if (actualChainId !== this.expectedChainId) {
          const error: any = new Error(
            `RPC endpoint chain ID ${actualChainId} does not match expected chain ID ${this.expectedChainId}`
          );
          error.code = "NETWORK_ERROR";
          error.expectedChainId = this.expectedChainId;
          error.actualChainId = actualChainId;
          throw error;
        }

        return rawChainId;
      })
      .catch((error) => {
        this.networkChecks.delete(provider);
        throw error;
      });

    this.networkChecks.set(provider, check);
    return check;
  }

  async send(method: string, params: Array<any>): Promise<any> {
    let firstError: unknown;

    for (const provider of this.endpointProviders) {
      try {
        const chainId = await this.verifyNetwork(provider);
        if (method === "eth_chainId") return chainId;
        return await provider.send(method, params);
      } catch (error) {
        firstError ??= error;
        if (!isRetryableRpcError(error)) throw error;
      }
    }

    throw firstError ?? new Error("No RPC endpoint is available.");
  }
}

let readonlyProvider: ethers.providers.BaseProvider | null = null;

export const getReadonlyProvider = () => {
  if (readonlyProvider) return readonlyProvider;

  const urls = getReadonlyRpcUrls();
  if (urls.length === 0)
    throw new Error(
      "No RPC endpoint is configured. Set NEXT_PUBLIC_PROVIDER_RPC."
    );

  const network = Number(envChainId);
  if (!Number.isSafeInteger(network) || network <= 0)
    throw new Error(
      "No valid chain ID is configured. Set NEXT_PUBLIC_CHAIN_ID."
    );

  readonlyProvider = new FailoverJsonRpcProvider(urls, network);
  return readonlyProvider;
};
