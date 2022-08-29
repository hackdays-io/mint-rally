import { BigNumber, ethers } from "ethers";
import { useState } from "react";
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER!;
import contract from "../contracts/MintNFT.json";
import forwarderContractAbi from '../contracts/MinimalForwarder.json';
import { signMetaTxRequest } from "../../utils/signer";
export interface IMintParticipateNFTParams {
  groupId: number;
  eventId: number;
  secretPhrase: string;
}

const sentMetaTx = async (
  mintNFTContract: ethers.Contract,
  signer: ethers.Signer,
  groupId: number,
  eventId: number,
  secretPhrase: string
) => {
  const url = process.env.NEXT_PUBLIC_WEBHOOK_URL;
  if (!url) throw new Error('Webhook url is required');

  if (!process.env.NEXT_PUBLIC_FORWARDER_ADDRESS) throw new Error('Forwarder address is required');

  const forwarder = new ethers.Contract(
    process.env.NEXT_PUBLIC_FORWARDER_ADDRESS,
    forwarderContractAbi.abi,
    signer
  );

  const from = await signer.getAddress();
  const data = mintNFTContract.interface.encodeFunctionData('mintParticipateNFT', [
    groupId,
    eventId,
    secretPhrase,
  ]);
  const to = mintNFTContract.address

  if (!signer.provider) throw new Error('Provider is not set');

  const request = await signMetaTxRequest(signer.provider, forwarder, { to, from, data });

  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(request),
    headers: { 'Content-Type': 'application/json' },
  });
}

export interface IOwnedNFT {
  name: string;
  description: string;
  image: string;
  groupId: BigNumber;
  eventId: BigNumber;
  requiredParticipateCount: number;
}

/**
 * A bridgge to the mint nft manager contract
 */
export const getMintNFTManagerContract = () => {
  const { ethereum } = window;
  if (ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum as any);
    const signer = provider.getSigner();
    if (signer) {
      console.log("address:", contractAddress);
      const _contract = new ethers.Contract(
        contractAddress,
        contract.abi,
        signer
      );
      console.log("Initialize payment");
      return _contract;
    }
  }
  return null;
};

export const useMintParticipateNFT = () => {
  const [errors, setErrors] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(false);
  const mintParticipateNFT = async ({
    groupId,
    eventId,
    secretPhrase,
  }: IMintParticipateNFTParams) => {
    try {
      setErrors(null);
      const mintNFTManager = getMintNFTManagerContract();
      if (!mintNFTManager)
        throw new Error("Cannot find mintNFTManager contract");

      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum as any)
      const signer = provider.getSigner()

      return await sentMetaTx(mintNFTManager, signer, groupId, eventId, secretPhrase);

    } catch (e: any) {
      setErrors(e);
    } finally {
      setLoading(false);
    }
  };
  return { status, errors, loading, mintParticipateNFT };
};

export const useGetOwnedNFTs = () => {
  const [ownedNFTs, setOwnedNFTs] = useState<IOwnedNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const getOwnedNFTs = async () => {
    const mintNFTManager = getMintNFTManagerContract();
    if (!mintNFTManager) throw new Error("Cannot find mintNFTManager contract");

    setLoading(true);
    const data = await mintNFTManager.getOwnedNFTs();
    console.log("retrieved owned nfts:", data);
    setLoading(false);
    setOwnedNFTs(data);
    return data;
  };
  return { ownedNFTs, loading, getOwnedNFTs };
};
