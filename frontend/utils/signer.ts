import { BaseContract, Signer, ethers } from "ethers";
import ethSignUtil from "eth-sig-util";
import { SmartContract } from "@thirdweb-dev/sdk";

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
const signTypeData = async (signer: Signer, data: any) => {
  return await signer.signMessage(JSON.stringify(data));
};

export const buildRequest = async (
  forwarder: SmartContract<BaseContract>,
  input: any
) => {
  // get nonce from forwarder contract
  // this nonce is used to prevent replay attack
  const nonce = (await forwarder.call("getNonce", [input.from])).toString();
  return { value: 0, gas: 1e6, nonce, ...input };
};

export const buildTypedData = async (
  forwarder: SmartContract<BaseContract>,
  request: any
) => {
  const chainId = forwarder.chainId;
  const typeData = getMetaTxTypeData(chainId, forwarder.getAddress());
  return { ...typeData, message: request };
};

export const signMetaTxRequest = async (
  signer: Signer,
  forwarder: any,
  input: any
) => {
  const request = await buildRequest(forwarder, input);
  const toSign = await buildTypedData(forwarder, request);
  const signature = await signTypeData(signer, toSign.message);
  return { signature, request };
};
