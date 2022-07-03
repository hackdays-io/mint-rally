import { ethers } from "ethers";
import { useState } from "react";
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER!;
import contract from "../contracts/MintNFT.json";

export interface IMintParticipateNFTParams {
  groupId: number;
  eventId: number;
  secretPhrase: string;
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
      const tx = await mintNFTManager.mintParticipateNFT(
        groupId,
        eventId,
        secretPhrase
      );
      await tx.wait();
      setStatus(true);
    } catch (e: any) {
      setErrors(e);
    } finally {
      setLoading(false);
    }
  };
  return { status, errors, loading, mintParticipateNFT };
};
