import { NextApiRequest, NextApiResponse } from "next";
import { Contract, providers, Wallet } from "ethers";
import {
  DefenderRelayProvider,
  DefenderRelaySigner,
} from "@openzeppelin/defender-relay-client/lib/ethers";
import MintRallyForwarderABI from "../../../contracts/Fowarder.json";
import { MintRallyForwarder } from "types/MintRallyForwarder";

const getOzSigner = async () => {
  if (process.env.DEV_RELAYER_PRIVATE_KEY) {
    const developmentProvider = new providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_PROVIDER_RPC!
    );
    return new Wallet(
      process.env.DEV_RELAYER_PRIVATE_KEY!,
      developmentProvider
    );
  } else {
    const apiKeys = JSON.parse(process.env.OZ_RELAYER_API_KEYS!);
    const apiSecrets = JSON.parse(process.env.OZ_RELAYER_API_SECRETS!);

    const randomIndex = Math.floor(Math.random() * apiKeys.length);
    const apiKey = apiKeys[randomIndex];
    const apiSecret = apiSecrets[randomIndex];

    const credentials = {
      apiKey,
      apiSecret,
    };

    const ozProvider = new DefenderRelayProvider(credentials);
    const ozSigner = new DefenderRelaySigner(credentials, ozProvider, {
      speed: "fast",
    });

    return ozSigner;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") res.status(404).end();

  try {
    const { request, signature } = req.body;

    const ozSigner = await getOzSigner();
    const forwarder: MintRallyForwarder = new Contract(
      process.env.NEXT_PUBLIC_FORWARDER_ADDRESS!,
      MintRallyForwarderABI.abi,
      ozSigner
    ) as any;

    const valid = await forwarder.verify(request, signature);

    if (!valid) throw new Error("invalid signature");

    const tx = await forwarder.execute(request, signature);

    console.log(tx);

    res.status(200).json({ tx: tx });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}
