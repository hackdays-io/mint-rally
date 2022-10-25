import { INFTImage } from "../hooks/useEventManager";
import { IIpfsClient, IPFS_CLIENT_TYPE } from "./ipfsClient";
import { PinataClient } from "./pinataClient";
import { Web3StorageClient } from "./web3StorageClient";


export const getIpfsClient = (type: IPFS_CLIENT_TYPE): IIpfsClient => {
  if (process.env.NEXT_PUBLIC_PINATA_JWT) {
    return new PinataClient()
  } else {
    return new Web3StorageClient()
  }
};

export class ipfsUploader {
  ipfsClient: IIpfsClient;
  constructor() {
    this.ipfsClient = getIpfsClient(IPFS_CLIENT_TYPE.IPFS_CLIENT_TYPE_WEB3CLIENT);
  }
  renameFile(file: File, newFilename: string) {
    const { type, lastModified } = file;
    return new File([file], newFilename, { type, lastModified });
  };

  async uploadNFTsToIpfs(nfts: INFTImage[]) {
    if (nfts.length === 0) return;
    const renamedFiles = nfts.map(
      ({ name, fileObject, description, requiredParticipateCount }) => ({
        name: name,
        fileObject: this.renameFile(fileObject!, `${requiredParticipateCount}.png`),
        description,
        requiredParticipateCount,
      })
    );

    const rootCid = await this.ipfsClient.put(
      renamedFiles.map((f) => f.fileObject), new Date().toISOString());
    return { rootCid, renamedFiles };
  };
  async uploadMetadataFilesToIpfs(files: File[], fileName: string) {
    const metaDataRootCid = await this.ipfsClient.put(files, fileName);
    return metaDataRootCid
  }
};
