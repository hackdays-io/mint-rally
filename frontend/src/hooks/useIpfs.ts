import { useState } from "react";
import { ipfsUploader } from "src/libs/libIpfs";
import { NFT } from "types/NFT";

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
    const imageUpdatedNfts = nfts.filter((nft) => nft.fileObject);
    let baseNftAttributes = nfts.filter((nft) => !nft.fileObject);
    const uploader = new ipfsUploader();
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
      `${groupId}_${eventName}`
    );
    setLoading(false);
    setNftAttributes(
      baseNftAttributes.map((attribute) => {
        return {
          requiredParticipateCount: attribute.requiredParticipateCount,
          metaDataURL: `ipfs://${metaDataRootCid}/${attribute.requiredParticipateCount}.json`,
        };
      })
    );
  };

  return { loading, errors, nftAttributes, saveNFTMetadataOnIPFS };
};
