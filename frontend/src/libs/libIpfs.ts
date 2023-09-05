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
        ({ name, fileObject, description, requiredParticipateCount }) => ({
          name: name,
          fileObject: this.renameFile(
            fileObject!,
            `${requiredParticipateCount}.png`
          ),
          description,
          requiredParticipateCount,
        })
      );

      const rootCid = await this.ipfsClient.put(
        renamedFiles.map((f) => f.fileObject),
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
