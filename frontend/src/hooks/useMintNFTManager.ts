import { BigNumber, ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER!;
import contract from "../contracts/MintNFT.json";
import FowarderABI from "../contracts/Fowarder.json";
import { signMetaTxRequest } from "../../utils/signer";
const provierRpc = process.env.NEXT_PUBLIC_PROVIDER_RPC!;
import axios from "axios";
import { ipfs2http } from "../../utils/ipfs2http";
import { useAddress } from "@thirdweb-dev/react";
import { IEventRecord } from "./useEventManager";
import {
  getOwnedNFTsFromAddress,
  getNFTDataFromAddress,
} from "../libs/mintManagerFunctions";
export interface IMintParticipateNFTParams {
  groupId: number;
  eventId: number;
  secretPhrase: string;
  mtx: boolean;
}

export interface INFTMetaData {
  name: string;
  description: string;
  image: string;
  traits: {
    EventName?: string;
    EventGroupId?: number;
    RequiredParticipateCount?: number;
  };
}

export interface IOwnedNFT {
  tokenId: BigNumber;
  metaData: INFTMetaData;
}

/**
 * A bridgge to the mint nft manager contract
 */
export const getMintNFTManagerContract = (config = { signin: false }) => {
  if (!config.signin) {
    const provider = new ethers.providers.JsonRpcProvider(provierRpc);
    const _contract = new ethers.Contract(
      contractAddress,
      contract.abi,
      provider
    );
    return _contract;
  } else {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum as any);
      const signer = provider.getSigner();
      if (signer) {
        const _contract = new ethers.Contract(
          contractAddress,
          contract.abi,
          signer
        );
        return _contract;
      }
    }
  }
};

export const useMintParticipateNFT = (event: IEventRecord | null) => {
  const [errors, setErrors] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(false);
  const [mintedNftImageURL, setMintedNftImageLink] = useState<string | null>(
    null
  );
  const { ownedNFTs, reload } = useGetOwnedNFTs();

  useEffect(() => {
    const polingGetNft = setInterval(async () => {
      if (loading && !mintedNftImageURL) {
        await reload();
      }
    }, 3000);

    return () => clearInterval(polingGetNft);
  }, [loading]);

  useEffect(() => {
    const nft = ownedNFTs.find(
      (nft) =>
        Number(nft.metaData.traits.EventGroupId) ===
          event?.groupId.toNumber() &&
        (nft.metaData.name === event?.name ||
          nft.metaData.traits.EventName === event?.name)
    );
    if (!nft || !status) return;
    setMintedNftImageLink(ipfs2http(nft.metaData.image));
    setLoading(false);
  }, [ownedNFTs, status]);

  const sentMetaTx = useCallback(
    async (
      mintNFTContract: ethers.Contract,
      signer: ethers.Signer,
      secretPhrase: string
    ) => {
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
        [
          event?.groupId.toNumber(),
          event?.eventRecordId.toNumber(),
          secretPhrase,
        ]
      );
      const to = mintNFTContract.address;

      if (!signer.provider) throw new Error("Provider is not set");

      const request = await signMetaTxRequest(signer.provider, forwarder, {
        to,
        from,
        data,
      });

      return fetch("/api/autotask", {
        method: "POST",
        body: JSON.stringify(request),
        headers: { "Content-Type": "application/json" },
      });
    },
    [event]
  );

  const sendNormalTx = useCallback(
    async (mintNFTContract: ethers.Contract, secretPhrase: string) => {
      const tx = await mintNFTContract.mintParticipateNFT(
        event?.groupId,
        event?.eventRecordId,
        secretPhrase
      );
      await tx.wait();
    },
    [event]
  );

  const mintParticipateNFT = useCallback(
    async ({ secretPhrase, mtx }: IMintParticipateNFTParams) => {
      try {
        setErrors(null);
        const mintNFTManager = getMintNFTManagerContract({ signin: true });
        if (!mintNFTManager)
          throw new Error("Cannot find mintNFTManager contract");

        setLoading(true);
        const provider = new ethers.providers.Web3Provider(
          window.ethereum as any
        );
        const signer = provider.getSigner();

        await mintNFTManager.canMint(
          event?.eventRecordId.toNumber(),
          secretPhrase
        );

        if (mtx) {
          await sentMetaTx(mintNFTManager, signer, secretPhrase);
        } else {
          await sendNormalTx(mintNFTManager, secretPhrase);
        }
        setStatus(true);
      } catch (e: any) {
        console.log(e);
        setErrors(e.error?.data || e.message || "error occured");
        setLoading(false);
      }
    },
    [event]
  );
  return { status, errors, loading, mintParticipateNFT, mintedNftImageURL };
};

export const useGetOwnedNFTs = () => {
  const [ownedNFTs, setOwnedNFTs] = useState<IOwnedNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [reloading, setReloading] = useState(false);
  const address = useAddress();

  useEffect(() => {
    if (address) {
      setLoading(true);
      getOwnedNFTs();
      setLoading(false);
    }
  }, [address]);

  const reload = async () => {
    setReloading(true);
    getOwnedNFTs();
    setReloading(false);
  };

  const getOwnedNFTs = async () => {
    if (!address) return;
    const mintNFTManager = getMintNFTManagerContract({ signin: true });
    if (!mintNFTManager) throw new Error("Cannot find mintNFTManager contract");
    const balanceOfNFTs = await mintNFTManager.balanceOf(address);
    const metadata: any[] = [];
    for (let index = 0; index < balanceOfNFTs.toNumber(); index++) {
      const tokenId = await mintNFTManager.tokenOfOwnerByIndex(address, index);
      const tokenURI = await mintNFTManager.tokenURI(tokenId);
      const path = ipfs2http(tokenURI);
      try {
        const { data } = await axios.get(path);
        metadata.push({ tokenId: tokenId, metaData: data });
      } catch (_) {
        continue;
      }
    }
    setOwnedNFTs(metadata);
  };

  return { ownedNFTs, loading, reload, reloading };
};

export const useGetOwnedNFTsByAddress = (address?: string) => {
  const [ownedNFTs, setOwnedNFTs] = useState<IOwnedNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    if (address) {
      setLoading(true);
      getOwnedNFTs();
      setLoading(false);
    }
  }, [address]);

  const reload = async () => {
    setReloading(true);
    getOwnedNFTs();
    setReloading(false);
  };

  const getOwnedNFTs = async () => {
    if (!address) return;
    const metadata = await getOwnedNFTsFromAddress(address);
    setOwnedNFTs(metadata);
  };

  return { ownedNFTs, loading, reload, reloading };
};

export const useTokenURI = (tokenId?: BigNumber) => {
  const [metaData, setMetaData] = useState<INFTMetaData>();
  useEffect(() => {
    const fetch = async () => {
      if (tokenId) {
        const data = await getNFTDataFromAddress(tokenId);
        setMetaData(data);
      }
    };
    fetch();
  }, [tokenId]);

  return { metaData };
};
