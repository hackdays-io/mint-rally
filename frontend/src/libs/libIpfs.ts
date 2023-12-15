import { NFT } from "types/NFT";
import { IIpfsClient } from "./ipfsClient";
import { PinataClient } from "./pinataClient";

export class ipfsUploader {
  ipfsClient: IIpfsClient;
  constructor() {
    this.ipfsClient = new PinataClient();
  }
  renameFile(file: File, newFilename: string) {
    const { type, lastModified } = file;
    return new File([file], newFilename, { type, lastModified });
  }

  async uploadNFTsToIpfs(nfts: NFT.NFTImage[]) {
    try {
      if (nfts.length === 0) return;
      const renamedFiles = nfts.map(
        ({
          name,
          fileObject,
          animationFileObject,
          description,
          requiredParticipateCount,
          image,
          animation_url,
        }) => ({
          name: name,
          image: image,
          fileObject: fileObject
            ? this.renameFile(
                fileObject!,
                `${requiredParticipateCount}.${fileObject!.name
                  .split(".")
                  .pop()}`
              )
            : undefined,
          animation_url: animation_url,
          animationFileObject: animationFileObject
            ? this.renameFile(
                animationFileObject!,
                `animation_${requiredParticipateCount}.${animationFileObject!.name
                  .split(".")
                  .pop()}`
              )
            : undefined,
          description,
          requiredParticipateCount,
        })
      );

      // create array of fileobject and animationfileobject
      const files = renamedFiles.reduce<File[]>(
        (acc, { fileObject, animationFileObject }) => {
          if (fileObject) acc.push(fileObject);
          if (animationFileObject) acc.push(animationFileObject);
          return acc;
        },
        []
      );
      const rootCid = await this.ipfsClient.put(
        files,
        new Date().toISOString()
      );
      return { rootCid, renamedFiles };
    } catch (error) {
      throw error;
    }
  }

  async uploadMetadataFilesToIpfs(files: File[], fileName: string) {
    try {
      const metaDataRootCid = await this.ipfsClient.put(files, fileName);
      return metaDataRootCid;
    } catch (error) {
      throw error;
    }
  }
}
