import { Web3Storage } from "web3.storage";
import { INFTImage } from "../hooks/useEventManager";

export const getIpfsClient = () => {
  return new Web3Storage({
    token: process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY || "",
    endpoint: new URL("https://api.web3.storage"),
  });
};

export const uploadFilesToWeb3 = () => {
  const ipfsClient = getIpfsClient();

  const renameFile = (file: File, newFilename: string) => {
    const { type, lastModified } = file;
    return new File([file], newFilename, { type, lastModified });
  };

  const uploadNFTsToIpfs = async (nfts: INFTImage[]) => {
    console.log(nfts)
    if (nfts.length === 0) return;
    const renamedFiles = nfts.map(
      ({ name, fileObject, description, requiredParticipateCount }) => ({
        name: name,
        fileObject: renameFile(fileObject!, `${requiredParticipateCount}.png`),
        description,
        requiredParticipateCount,
      })
    );
    console.log('renamedFiles', renamedFiles)

    const rootCid: string = await ipfsClient.put(
      renamedFiles.map((f) => f.fileObject),
      {
        name: `${new Date().toISOString()}`,
        maxRetries: 3,
        wrapWithDirectory: true,
        onRootCidReady: (rootCid) => {
          console.log("rood cid:", rootCid);
        },
        onStoredChunk: (size) => {
          // console.log(`stored chunk of ${size} bytes`);
        },
      }
    );
    return { rootCid, renamedFiles };
  };

  return uploadNFTsToIpfs;
};
