import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER!;
import contract from "../contracts/MintNFT.json";
import FowarderABI from "../contracts/Fowarder.json";
import { signMetaTxRequest } from "../../utils/signer";
import axios from "axios";
import { ipfs2http } from "../../utils/ipfs2http";
import { useAddress } from "@thirdweb-dev/react";
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
  if (!url) throw new Error("Webhook url is required");

  if (!process.env.NEXT_PUBLIC_FORWARDER_ADDRESS)
    throw new Error("Forwarder address is required");

  const forwarder = new ethers.Contract(
    process.env.NEXT_PUBLIC_FORWARDER_ADDRESS,
    FowarderABI.abi,
    signer
  );

  const from = await signer.getAddress();
  const data = mintNFTContract.interface.encodeFunctionData(
    "mintParticipateNFT",
    [groupId, eventId, secretPhrase]
  );
  const to = mintNFTContract.address;

  if (!signer.provider) throw new Error("Provider is not set");

  const request = await signMetaTxRequest(signer.provider, forwarder, {
    to,
    from,
    data,
  });

  return fetch(url, {
    method: "POST",
    body: JSON.stringify(request),
    headers: { "Content-Type": "application/json" },
  });
};

export interface IOwnedNFT {
  name: string;
  description: string;
  image: string;
  traits: {
    eventGroupId: number;
  };
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
  const [nftAttributeLink, setNftAttributeLink] = useState<string | null>(null);
  const [mintedNftImageURL, setMintedNftImageLink] = useState<string | null>(
    null
  );
  const address = useAddress();

  useEffect(() => {
    const mintNFTManager = getMintNFTManagerContract();
    if (!mintNFTManager) throw new Error("Cannot find mintNFTManager contract");
    const filters = mintNFTManager?.filters.MintedNFTAttributeURL(
      address,
      null
    );
    mintNFTManager.on(filters, (_, _nftAttributeLink: string) => {
      setNftAttributeLink(_nftAttributeLink);
    });
  }, []);

  useEffect(() => {
    const fetchAttribute = async (tokenURI: string) => {
      const { data } = await axios.get(ipfs2http(tokenURI));
      setMintedNftImageLink(ipfs2http(data.image));
      setLoading(false);
    };

    if (status && nftAttributeLink !== null) {
      fetchAttribute(nftAttributeLink);
    }
  }, [nftAttributeLink, status]);

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
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as any
      );
      const signer = provider.getSigner();

      return await sentMetaTx(
        mintNFTManager,
        signer,
        groupId,
        eventId,
        secretPhrase
      );
      setStatus(true);
    } catch (e: any) {
      setErrors(e.error.data);
      setLoading(false);
    }
  };
  return { status, errors, loading, mintParticipateNFT, mintedNftImageURL };
};

export const useGetOwnedNFTs = () => {
  const [ownedNFTs, setOwnedNFTs] = useState<IOwnedNFT[]>([]);
  const [loading, setLoading] = useState(false);

  const getOwnedNFTs = async (address?: string) => {
    if (!address) return;
    const mintNFTManager = getMintNFTManagerContract();
    if (!mintNFTManager) throw new Error("Cannot find mintNFTManager contract");
    setLoading(true);
    const balanceOfNFTs = await mintNFTManager.balanceOf(address);
    const metadata: any[] = [];
    for (let index = 0; index < balanceOfNFTs.toNumber(); index++) {
      const tokenId = await mintNFTManager.tokenOfOwnerByIndex(address, index);
      const tokenURI = await mintNFTManager.tokenURI(tokenId);
      const path = ipfs2http(tokenURI);
      const { data } = await axios.get(path);
      metadata.push(data);
    }
    setLoading(false);
    setOwnedNFTs(metadata);
  };

  return { ownedNFTs, loading, getOwnedNFTs };
};
