import { Web3StorageClient } from "./web3StorageClient";

export enum IPFS_CLIENT_TYPE {
  IPFS_CLIENT_TYPE_WEB3CLIENT,
  IPFS_CLIENT_TYPE_PINATA
}
export interface IIpfsClient {
  put(files: Iterable<File>, name: string): Promise<string | undefined>
}
export const getIpfsClient = (type: IPFS_CLIENT_TYPE): IIpfsClient => {
  return new Web3StorageClient();
};
