import { useState } from "react";
import { ipfsUploader } from "src/libs/libIpfs";
import { NFT } from "types/NFT";
import { v4 as uuid } from "uuid";

export interface NFTAttribute {
  requiredParticipateCount: number;
  metaDataURL: string;
}

export const useIpfs = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Error | null>(null);
  const [nftAttributes, setNftAttributes] = useState<NFTAttribute[]>([]);
  /**
   * @param eventGroupId
   * @param eventName
   * @param nfts
   * @returns
   */
  const saveNFTMetadataOnIPFS = async (
    groupId: string,
    eventName: string,
    nfts: NFT.NFTImage[]
  ) => {
    setLoading(true);
    setErrors(null);
    setNftAttributes([]);
    try {
      const imageUpdatedNfts = nfts.filter((nft) => nft.fileObject);
      let baseNftAttributes = nfts.filter((nft) => !nft.fileObject);
      const uploader = new ipfsUploader();

      if (imageUpdatedNfts.length !== 0) {
        const uploadResult = await uploader.uploadNFTsToIpfs(imageUpdatedNfts);
        if (uploadResult) {
          const nftAttributes: NFT.NFTImage[] = uploadResult.renamedFiles.map(
            ({ name, fileObject, description, requiredParticipateCount }) => ({
              name: name,
              image: `ipfs://${uploadResult.rootCid}/${fileObject.name}`,
              description: description,
              requiredParticipateCount,
            })
          );
          baseNftAttributes = nftAttributes.concat(baseNftAttributes);
        } else {
          throw new Error("Failed to upload NFT files to IPFS");
        }
      }

      const metadataFiles: File[] = [];
      for (const nftAttribute of baseNftAttributes) {
        const attribute: NFT.Metadata = {
          name: nftAttribute.name,
          image: nftAttribute.image,
          description: nftAttribute.description,
          external_link: "https://mintrally.xyz",
          traits: {
            EventGroupId: groupId,
            EventName: eventName,
            RequiredParticipateCount: nftAttribute.requiredParticipateCount,
          },
        };
        metadataFiles.push(
          new File(
            [JSON.stringify(attribute)],
            `${nftAttribute.requiredParticipateCount}.json`,
            { type: "text/json" }
          )
        );
      }
      const metaDataRootCid = await uploader.uploadMetadataFilesToIpfs(
        metadataFiles,
        `${groupId}-${uuid()}`
      );
      if (!metaDataRootCid) {
        throw new Error("Failed to upload metadata files to IPFS");
      }
      setLoading(false);
      setNftAttributes(
        baseNftAttributes.map((attribute) => {
          return {
            requiredParticipateCount: attribute.requiredParticipateCount,
            metaDataURL: `ipfs://${metaDataRootCid}/${attribute.requiredParticipateCount}.json`,
          };
        })
      );
    } catch (error: any) {
      setErrors(error);
      setLoading(false);
    }
  };

  return { loading, errors, nftAttributes, saveNFTMetadataOnIPFS };
};
