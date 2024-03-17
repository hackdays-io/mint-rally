import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";

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

const signTypeData = async (signer: SignerWithAddress, data: any) => {
  return await signer._signTypedData(data.domain, data.types, data.message);
};

export const buildRequest = async (forwarder: Contract, input: any) => {
  // get nonce from forwarder contract
  // this nonce is used to prevent replay attack
  const nonce = await forwarder.getNonce(input.from);
  return { value: 0, gas: 2e6, nonce, ...input };
};

export const buildTypedData = async (forwarder: Contract, request: any) => {
  const chainId = 31337;
  const typeData = getMetaTxTypeData(chainId, forwarder.address);
  return { ...typeData, message: request };
};

export const signMetaTxRequest = async (
  signer: SignerWithAddress,
  forwarder: Contract,
  input: {
    from: string;
    to: string;
    data: string;
  }
) => {
  const request = await buildRequest(forwarder, input);
  const toSign = await buildTypedData(forwarder, request);
  const signature = await signTypeData(signer, toSign);
  return { signature, request };
};
