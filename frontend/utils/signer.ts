import { BaseContract } from "ethers";
import { SmartContract, UserWallet } from "@thirdweb-dev/sdk";

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
const signTypeData = async (signer: UserWallet, data: any) => {
  console.log(data.message);
  return await signer.signTypedData(data.domain, data.types, data.message);
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
  signer: UserWallet,
  forwarder: any,
  input: any
) => {
  const request = await buildRequest(forwarder, input);
  const toSign = await buildTypedData(forwarder, request);
  const signature = await signTypeData(signer, toSign);
  return { signature, request };
};
