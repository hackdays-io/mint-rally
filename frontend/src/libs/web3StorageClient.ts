import { Web3Storage } from "web3.storage";
import { IIpfsClient, IPFS_CLIENT_TYPE } from "./ipfsClient";


export class Web3StorageClient implements IIpfsClient {
  web3storage: Web3Storage;
  constructor() {
    this.web3storage = new Web3Storage({
      token: process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY || "",
      endpoint: new URL("https://api.web3.storage"),
    });
  }
  put(files: Iterable<File>, name: string): Promise<string | undefined> {
    return this.web3storage.put(
      files,
      {
        name: name,
        maxRetries: 3,
        wrapWithDirectory: true,
        onRootCidReady: (rootCid) => {
          console.log("rood cid:", rootCid);
        },
        onStoredChunk: (size) => {
          // console.log(`stored chunk of ${size} bytes`);
        },
      }
    ).then((value) => {
      console.log(value)
      return value
    })
  }

}