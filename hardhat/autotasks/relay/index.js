import { Contract } from "ethers";
import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "defender-relay-client/lib/ethers";

// TODO: deploy forwarder contract and copy abi
import { ForwarderAbi } from "../../src/forwarder.ts";
// TODO: deploy forwarder contract and copy address
import { MinimalForwarder as ForwarderAddress } from "../../deploy.json";

async function relay(forwarder, request, signature, whitelist) {
  // Decide if we want to relay this request based on a whitelist
  const accepts = !whitelist || whitelist.includes(request.to);
  if (!accepts) throw new Error(`Rejected request to ${request.to}`);

  // Validate request on the forwarder contract
  const valid = await forwarder.verify(request, signature);
  if (!valid) throw new Error(`Invalid request`);

  // Send meta-tx through relayer to the forwarder contract
  const gasLimit = (parseInt(request.gas) + 50000).toString();
  return await forwarder.execute(request, signature, { gasLimit });
}

async function handler(event) {
  // Parse webhook payload
  if (!event.request || !event.request.body) throw new Error(`Missing payload`);
  const { request, signature } = event.request.body;
  console.log(`Relaying`, request);

  // Initialize Relayer provider and signer, and forwarder contract
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const credentials = { ...event };
  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, {
    speed: "fast",
  });
  const forwarder = new Contract(ForwarderAddress, ForwarderAbi, signer);

  // Relay transaction!
  const tx = await relay(forwarder, request, signature);
  console.log(`Sent meta-tx: ${tx.hash}`);
  return { txHash: tx.hash };
}

export default {
  handler,
  relay,
};
