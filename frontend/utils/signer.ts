import { ethers } from "ethers";
import ethSignUtil from "eth-sig-util";

// definistion of domainSeparator
// https://eips.ethereum.org/EIPS/eip-712
const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

// forwarder request struct
// ref: lib/openzeppelin-contracts/contracts/metatx/MinimalForwarder.sol
const ForwardRequest = [
  { name: "from", type: "address" },
  { name: "to", type: "address" },
  { name: "value", type: "uint256" },
  { name: "gas", type: "uint256" },
  { name: "nonce", type: "uint256" },
  { name: "data", type: "bytes" },
];

const getMetaTxTypeData = (chainId: number, verifyingContract: string) => {
  // Specification of the eth_signTypedData JSON RPC
  return {
    types: {
      EIP712Domain,
      ForwardRequest,
    },
    domain: {
      name: "MintRallyForwarder",
      version: "0.0.1",
      chainId,
      verifyingContract,
    },
    primaryType: "ForwardRequest",
  };
};

// TODO: do not use any type
const signTypeData = async (signer: any, from: string, data: any) => {
  // if signer is a private key, use it to sign
  if (typeof signer === "string") {
    const privateKey = Buffer.from(signer.replace(/^0x/, ""), "hex");
    return ethSignUtil.signTypedMessage(privateKey, { data });
  }

  // Otherwise, send the signTypedData RPC call
  const [method, argData] = ["eth_signTypedData_v4", JSON.stringify(data)];
  return await signer.send(method, [from, argData]);
};

export const buildRequest = async (forwarder: ethers.Contract, input: any) => {
  // get nonce from forwarder contract
  // this nonce is used to prevent replay attack
  const nonce = await forwarder
    .getNonce(input.from)
    .then((nonce: { toString: () => any }) => nonce.toString());
  return { value: 0, gas: 1e6, nonce, ...input };
};

export const buildTypedData = async (
  forwarder: ethers.Contract,
  request: any
) => {
  const chainId = await forwarder.provider.getNetwork().then((n) => n.chainId);
  const typeData = getMetaTxTypeData(chainId, forwarder.address);
  return { ...typeData, message: request };
};

export const signMetaTxRequest = async (
  signer: any,
  forwarder: ethers.Contract,
  input: any
) => {
  const request = await buildRequest(forwarder, input);
  const toSign = await buildTypedData(forwarder, request);
  const signature = await signTypeData(signer, input.from, toSign);
  return { signature, request };
};
