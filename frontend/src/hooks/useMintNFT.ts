import {
  ContractEvent,
  useContract,
  useContractEvents,
  useContractRead,
  useContractWrite,
  useSDK,
  useSigner,
} from "@thirdweb-dev/react";
import mintNFTABI from "../contracts/MintNFT.json";
import forwarderABI from "../contracts/Fowarder.json";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NFT } from "types/NFT";
import axios from "axios";
import { ipfs2http } from "utils/ipfs2http";
import { Event } from "types/Event";
import { signMetaTxRequest } from "utils/signer";
import { BigNumber } from "ethers";
import { useCurrentBlock } from "./useBlockChain";
import { useGenerateProof } from "./useSecretPhrase";

export interface NFTAttribute {
  metaDataURL: string;
  requiredParticipateCount: BigNumber;
}

export const useMintNFTContract = () => {
  const {
    contract: mintNFTContract,
    isLoading,
    error,
  } = useContract(
    process.env.NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER!,
    mintNFTABI.abi
  );

  return { mintNFTContract, isLoading, error };
};

export const useForwarderContract = () => {
  const {
    contract: forwarderContract,
    isLoading,
    error,
  } = useContract(process.env.NEXT_PUBLIC_FORWARDER_ADDRESS!, forwarderABI.abi);

  return { forwarderContract, isLoading, error };
};

export const useGetTokenURI = (id: number | null) => {
  const { mintNFTContract } = useMintNFTContract();
  const { data } = useContractRead(mintNFTContract, "tokenURI", [id]);

  return data;
};

export const useGetOwnedNftIdsByAddress = (address?: string) => {
  const { mintNFTContract, isLoading } = useMintNFTContract();
  const [ids, setIds] = useState<number[]>();

  useEffect(() => {
    const fetch = async () => {
      if (!address || isLoading) return;
      const balance = await mintNFTContract?.call("balanceOf", [address]);
      const tokenIdsPromise = Array(balance.toNumber())
        .fill("")
        .map((_, index) => {
          return mintNFTContract?.call("tokenOfOwnerByIndex", [address, index]);
        });
      const tokenIds = await Promise.all(tokenIdsPromise);

      setIds(tokenIds.map((id) => id.toNumber()));
    };
    fetch();
  }, [address, isLoading]);

  // const { mintNFTContract } = useMintNFTContract();

  // const { data: sentLogs, error } = useContractEvents(
  //   mintNFTContract,
  //   "Transfer",
  //   {
  //     queryFilter: {
  //       filters: {
  //         from: address,
  //         to: null,
  //       },
  //     },
  //   }
  // );

  // const { data: receiveLogs } = useContractEvents(mintNFTContract, "Transfer", {
  //   queryFilter: {
  //     filters: {
  //       from: null,
  //       to: address,
  //     },
  //   },
  // });

  // const logs = useMemo(() => {
  //   if (sentLogs && receiveLogs) {
  //     return [...sentLogs, ...receiveLogs].sort(
  //       (a, b) =>
  //         a.transaction.blockNumber - b.transaction.blockNumber ||
  //         a.transaction.transactionIndex - b.transaction.transactionIndex
  //     );
  //   } else if (sentLogs) {
  //     return sentLogs;
  //   } else if (receiveLogs) {
  //     return receiveLogs;
  //   } else {
  //     return [];
  //   }
  // }, [sentLogs, receiveLogs]);

  // const ids = useMemo(() => {
  //   if (!address) return;
  //   const isAddressesEqual = (address1: string, address2: string) => {
  //     return address1.toLowerCase() === address2.toLowerCase();
  //   };
  //   const owned = new Set<number>();

  //   for (const log of logs) {
  //     if (log.data) {
  //       const { from, to, tokenId } = log.data;

  //       if (isAddressesEqual(to, address)) {
  //         owned.add(Number(tokenId));
  //       } else if (isAddressesEqual(from, address)) {
  //         owned.delete(Number(tokenId));
  //       }
  //     }
  //   }

  //   return Array.from(owned);
  // }, [logs]);

  return ids;
};

export const useGetNFTAttributeRecordsByEventId = () => {
  const { mintNFTContract } = useMintNFTContract();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const getNFTAttributeRecordsByEventId = async (
    eventId: number,
    limit: number,
    offset: number
  ): Promise<NFTAttribute[]> => {
    if (mintNFTContract === undefined) return [];
    setIsLoading(true);
    try {
      const res = await mintNFTContract.call(
        "getNFTAttributeRecordsByEventId",
        [eventId, limit, offset]
      );
      return res; // 追加: 戻り値としてresを返します
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, getNFTAttributeRecordsByEventId };
};

export const useCopyPastAttribute = () => {
  const { isLoading, error, getNFTAttributeRecordsByEventId } =
    useGetNFTAttributeRecordsByEventId();

  const copyPastAttribute = async (eventId: number) => {
    const nftAttributes = await getNFTAttributeRecordsByEventId(
      eventId,
      100,
      0
    );

    const metaDataPromises = nftAttributes.map(
      ({ metaDataURL, requiredParticipateCount }) => {
        const getMetaData = async (
          metaDataURL: string,
          requiredParticipateCount: BigNumber
        ) => {
          const { data: metaData } = await axios.get(ipfs2http(metaDataURL));

          const nftImage: NFT.NFTImage = {
            name: metaData.name,
            image: metaData.image,
            animation_url: metaData.animation_url,
            description: metaData.description,
            requiredParticipateCount: Number(requiredParticipateCount),
            fileObject: null,
          };
          return nftImage;
        };
        return getMetaData(metaDataURL, requiredParticipateCount);
      }
    );

    const metaDatas: NFT.NFTImage[] = await Promise.all(metaDataPromises);
    return metaDatas.filter((metaData) => metaData);
  };

  return { isLoading, error, copyPastAttribute };
};

export const useGetOwnedNFTByAddress = (address?: string) => {
  const { mintNFTContract } = useMintNFTContract();
  const ids = useGetOwnedNftIdsByAddress(address);
  const [nfts, setNfts] = useState<NFT.Metadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setNfts([]);
    if (!ids || !mintNFTContract) return;

    const fetch = async () => {
      setIsLoading(true);
      const tokenURIs: { tokenURI: any; tokenId: number }[] = [];
      const chunkedIds = ids.reduce<number[][]>(
        (chunkedIds, currentId, index) => {
          const chunkIndex = Math.floor(index / 25);
          chunkedIds[chunkIndex] = chunkedIds[chunkIndex] ?? [];
          chunkedIds[chunkIndex].push(currentId);
          return chunkedIds;
        },
        []
      );

      for (const chunk of chunkedIds) {
        const tokenURIPromises = chunk.map((id) => {
          const getTokenURI = async (id: number) => {
            const tokenURI = await mintNFTContract?.call("tokenURI", [id]);
            return { tokenURI, tokenId: id };
          };
          return getTokenURI(id);
        });
        const fetchedTokenURIs = await Promise.all(tokenURIPromises);
        tokenURIs.push(...fetchedTokenURIs);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const metaDataPromises = tokenURIs.map(({ tokenURI, tokenId }) => {
        const getMetaData = async (tokenURI: string, tokenId: number) => {
          try {
            const { data: metaData } = await axios.get(ipfs2http(tokenURI));
            return { ...metaData, tokenId };
          } catch (_) {}
        };
        return getMetaData(tokenURI, tokenId);
      });
      const _nfts = await Promise.all(metaDataPromises);
      setNfts(_nfts.filter((nft) => nft));
      setIsLoading(false);
    };

    fetch();
  }, [ids, address]);

  return { nfts, isLoading };
};

export const useSortNFTsByGroup = (_nfts: NFT.Metadata[]) => {
  const nfts = useMemo(() => {
    return _nfts.reduce<Record<number, NFT.Metadata[]>>((nfts, current) => {
      const { traits } = current;
      nfts[Number(traits.EventGroupId)] =
        nfts[Number(traits.EventGroupId)] ?? [];
      nfts[Number(traits.EventGroupId)].push(current);
      return nfts;
    }, {});
  }, [_nfts]);

  return nfts;
};

export const useMintParticipateNFT = (
  event: Event.EventRecord,
  address: string,
  useMTX: boolean = false
) => {
  const { mintNFTContract } = useMintNFTContract();
  const { forwarderContract } = useForwarderContract();
  const signer = useSigner();
  const sdk = useSDK();
  const {
    generateProof,
    isLoading: isPreparingProof,
    error: preparingProofError,
  } = useGenerateProof();

  const {
    mutateAsync,
    isLoading: isMinting,
    error: mintError,
    status: mintStatus,
  } = useContractWrite(mintNFTContract, "mintParticipateNFT");
  const [mtxStatus, setMtxStatus] = useState<{
    error: any;
    isLoading: boolean;
    status: "error" | "idle" | "loading" | "success";
  }>({
    error: null,
    isLoading: false,
    status: "idle",
  });
  const fromBlock = useCurrentBlock();
  const { data } = useContractEvents(mintNFTContract, "Transfer", {
    queryFilter: {
      filters: {
        from: null,
        to: address,
        fromBlock: fromBlock,
      },
    },
    subscribe: true,
  });

  const error: any = useMemo(() => {
    return mtxStatus.error || mintError || preparingProofError;
  }, [mintError, mtxStatus, preparingProofError]);
  const isLoading = useMemo(() => {
    return isPreparingProof || mtxStatus.isLoading || isMinting;
  }, [isMinting, mtxStatus, isPreparingProof]);
  const status = useMemo(() => {
    return useMTX ? mtxStatus.status : mintStatus;
  }, [mintStatus, mtxStatus]);

  const [mintedNFTId, setMintedNFTId] = useState<number | null>(null);
  const [mintedNFT, setMintedNFT] = useState<NFT.Metadata | null>(null);
  const mintedTokenURI = useGetTokenURI(mintedNFTId);
  useEffect(() => {
    const fetch = async () => {
      if (!mintedTokenURI) return;
      try {
        const { data } = await axios.get(ipfs2http(mintedTokenURI));
        data.tokenId = mintedNFTId;
        setMintedNFT(data);
      } catch (_) {
        return;
      }
    };
    fetch();
  }, [mintedTokenURI]);

  useEffect(() => {
    if (!data) return;
    const latestEvent = data.sort((a, b) => {
      return b.transaction.blockNumber - a.transaction.blockNumber;
    })[0];
    const isNewEvent = (_latestEvent: ContractEvent<Record<string, any>>) => {
      if (!fromBlock) return false;
      return (
        latestEvent.data.to === address &&
        latestEvent.transaction.blockNumber > fromBlock
      );
    };
    if (status !== "success" || !data || !isNewEvent(latestEvent)) return;
    const tokenId = latestEvent.data?.tokenId.toNumber();
    setMintedNFTId(tokenId);
  }, [data, status, fromBlock, address]);

  const checkCanMint = useCallback(
    async (eventId: number, proof: any) => {
      if (!mintNFTContract) return;
      try {
        await mintNFTContract.call("canMint", [eventId, proof]);
        return;
      } catch (error) {
        throw error;
      }
    },
    [mintNFTContract]
  );

  const mint = useCallback(
    async (secretPhrase: string) => {
      if (!event || !event.eventRecordId || !event.groupId) return;
      try {
        const proof = await generateProof(secretPhrase);

        await mutateAsync({
          args: [event.groupId, event.eventRecordId, proof?.proofCalldata],
        });
      } catch (_) {}
    },
    [event, mutateAsync]
  );

  const mintMTX = useCallback(
    async (secretPhrase: string) => {
      if (!event || !event.eventRecordId || !event.groupId || !sdk) return;
      setMtxStatus({ isLoading: true, status: "loading", error: null });
      try {
        const proof = await generateProof(secretPhrase);

        await checkCanMint(
          event.eventRecordId.toNumber(),
          proof?.proofCalldata
        );
        const to = mintNFTContract?.getAddress();
        const from = address;
        const data = mintNFTContract?.encoder.encode("mintParticipateNFT", [
          event?.groupId.toNumber(),
          event?.eventRecordId.toNumber(),
          proof?.proofCalldata,
        ]);
        const request = await signMetaTxRequest(sdk.wallet, forwarderContract, {
          from,
          to,
          data,
        });
        const { data: response } = await axios.post("/api/mtx/relay", {
          request: request.request,
          signature: request.signature.signature,
        });
        setMtxStatus({ ...mtxStatus, status: "success", isLoading: false });
        return response;
      } catch (error) {
        setMtxStatus({ ...mtxStatus, error, status: "error" });
      }
    },
    [event, forwarderContract, signer]
  );

  return {
    mint,
    mintMTX,
    isLoading,
    error,
    status,
    mintedNFT,
    isPreparingProof,
  };
};

export const useIsHoldingEventNftByAddress = (
  address?: string,
  eventId?: BigNumber
) => {
  const { mintNFTContract } = useMintNFTContract();
  const [isHoldingEventNft, setIsHoldingEventNft] = useState<boolean>();
  const { data, isLoading } = useContractRead(
    mintNFTContract,
    "isHoldingEventNFTByAddress",
    [address, eventId]
  );

  useEffect(() => {
    if (isHoldingEventNft === undefined && data !== undefined) {
      setIsHoldingEventNft(data);
    }
  }, [data, isHoldingEventNft]);

  return { isHoldingEventNft, isLoading };
};

export const useIsMintLocked = (eventId: number | BigNumber) => {
  const { mintNFTContract } = useMintNFTContract();
  const { data, isLoading, refetch } = useContractRead(
    mintNFTContract,
    "getIsMintLocked",
    [eventId]
  );

  return { isMintLocked: data, isLoading, refetch };
};

export const useIsNonTransferable = (eventId: number | BigNumber) => {
  const { mintNFTContract } = useMintNFTContract();
  const { data, isLoading, refetch } = useContractRead(
    mintNFTContract,
    "getIsNonTransferable",
    [eventId]
  );

  return { isNonTransferable: data, isLoading, refetch };
};

export const useMintLock = (eventId: number | BigNumber, locked: boolean) => {
  const { mintNFTContract } = useMintNFTContract();
  const { mutateAsync, isLoading, error, status } = useContractWrite(
    mintNFTContract,
    "changeMintLocked"
  );

  const fromBlock = useCurrentBlock();
  const { data } = useContractEvents(mintNFTContract, "MintLocked", {
    queryFilter: {
      filters: {
        eventId: eventId,
        fromBlock,
      },
    },
    subscribe: true,
  });

  const lock = useCallback(async () => {
    try {
      await mutateAsync({ args: [eventId, locked] });
    } catch (_) {}
  }, [eventId, locked, mutateAsync]);

  const isSuccess = useMemo(() => {
    const includesEvent = (data: ContractEvent<Record<string, any>>[]) => {
      if (!fromBlock) return false;
      return data.some((event) => {
        return event.transaction.blockNumber > fromBlock;
      });
    };
    if (status !== "success" || !data || !includesEvent(data)) return false;
    return true;
  }, [data, status, eventId, locked]);

  return { lock, isLoading, error, status, isSuccess };
};

export const useTransferLock = (
  eventId: number | BigNumber,
  locked: boolean
) => {
  const { mintNFTContract } = useMintNFTContract();
  const { mutateAsync, isLoading, error, status } = useContractWrite(
    mintNFTContract,
    "changeNonTransferable"
  );

  const fromBlock = useCurrentBlock();
  const { data } = useContractEvents(mintNFTContract, "NonTransferable", {
    queryFilter: {
      filters: {
        eventId: eventId,
        fromBlock,
      },
    },
    subscribe: true,
  });

  const lock = useCallback(async () => {
    try {
      await mutateAsync({ args: [eventId, locked] });
    } catch (_) {}
  }, [eventId, locked, mutateAsync]);

  const isSuccess = useMemo(() => {
    const includesEvent = (data: ContractEvent<Record<string, any>>[]) => {
      if (!fromBlock) return false;
      return data.some((event) => {
        return event.transaction.blockNumber > fromBlock;
      });
    };
    if (status !== "success" || !data || !includesEvent(data)) return false;
    return true;
  }, [data, status, eventId, locked]);

  return { lock, isLoading, error, status, isSuccess };
};

export const useResetSecretPhrase = (eventId: number | BigNumber) => {
  const { mintNFTContract } = useMintNFTContract();
  const {
    mutateAsync,
    isLoading,
    error: transactionError,
    status,
  } = useContractWrite(mintNFTContract, "resetSecretPhrase");

  const fromBlock = useCurrentBlock();
  const { data } = useContractEvents(mintNFTContract, "ResetSecretPhrase", {
    queryFilter: {
      filters: {
        eventId: eventId,
        fromBlock,
      },
    },
    subscribe: true,
  });

  const {
    isLoading: isPreparingProof,
    error: preparingProofError,
    generateProof,
  } = useGenerateProof();

  const isReseting = useMemo(() => {
    return isLoading || isPreparingProof;
  }, [isLoading, isPreparingProof]);

  const error = useMemo(() => {
    return transactionError || preparingProofError;
  }, [transactionError, preparingProofError]);

  const isSuccess = useMemo(() => {
    const includesEvent = (data: ContractEvent<Record<string, any>>[]) => {
      if (!fromBlock) return false;
      return data.some((event) => {
        return event.transaction.blockNumber > fromBlock;
      });
    };
    if (status !== "success" || !data || !includesEvent(data)) return false;
    return true;
  }, [data, status, eventId]);

  const reset = useCallback(
    async (newSecretPhrase: string) => {
      try {
        const proof = await generateProof(newSecretPhrase);
        await mutateAsync({ args: [eventId, proof?.publicInputCalldata[0]] });
      } catch (_) {}
    },
    [mutateAsync, eventId]
  );

  return { reset, isReseting, error, isSuccess };
};

export const useHoldersOfEventGroup = (groupId: number) => {
  const { mintNFTContract } = useMintNFTContract();

  const { data, isLoading } = useContractRead(
    mintNFTContract,
    "getNFTHoldersByEventGroup",
    [groupId]
  );

  return {
    holders: data as { holderAddress: string; tokenId: BigNumber }[],
    isLoading,
  };
};

export const useHoldersOfEvent = (eventId: number | BigNumber) => {
  const { mintNFTContract } = useMintNFTContract();

  const { data, isLoading } = useContractRead(
    mintNFTContract,
    "getNFTHoldersByEvent",
    [eventId]
  );

  return {
    holders: data as { holderAddress: string; tokenId: BigNumber }[],
    isLoading,
  };
};

export const useLeadersOfEventGroup = (groupId: number) => {
  const { holders, isLoading } = useHoldersOfEventGroup(groupId);

  // count duplicate addresses of holders, holders type is { holderAddress: string; tokenId: BigNumber }[]
  const leaders = useMemo(() => {
    const activeHolders = holders?.filter(
      (h) => h.holderAddress !== "0x000000000000000000000000000000000000dEaD"
    );
    const countMap = new Map();
    activeHolders?.forEach((holder) => {
      const address = holder.holderAddress;
      if (countMap.has(address)) {
        countMap.set(address, countMap.get(address) + 1);
      } else {
        countMap.set(address, 1);
      }
    });
    const sorted: [string, number][] = Array.from(countMap).sort(
      (a, b) => b[1] - a[1]
    );

    // create object {rank: number, address: string[], count: number}[], rank is 1 origin, if sorted[1] is same put in same rank
    const result: { rank: number; address: string[]; count: number }[] = [];
    let rank = 1;
    let count = 0;
    sorted.forEach((item, index) => {
      if (index === 0) {
        result.push({ rank, address: [item[0]], count: item[1] });
        count = item[1];
      } else {
        if (count === item[1]) {
          result[result.length - 1].address.push(item[0]);
        } else {
          rank = index + 1;
          result.push({ rank, address: [item[0]], count: item[1] });
          count = item[1];
        }
      }
    });

    return result;
  }, [holders]);

  return { leaders, isLoading };
};
