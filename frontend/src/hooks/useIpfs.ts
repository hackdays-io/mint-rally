import { Web3Storage } from "web3.storage";

export const useIpfsClient = () => {
  return new Web3Storage({
    token: process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY || "",
    endpoint: new URL("https://api.web3.storage"),
  });
};

export const useUploadImageToIpfs = () => {
  const ipfsClient = useIpfsClient();

  const renameFile = (file: File, newFilename: string) => {
    const { type, lastModified } = file;
    return new File([file], newFilename, { type, lastModified });
  };

  const uploadImagesToIpfs = async (
    nfts: {
      description: string;
      fileObject?: File | null;
      requiredParticipateCount: number;
    }[]
  ) => {
    if (nfts.length === 0) return;
    const renamedFiles = nfts.map(
      ({ fileObject, description, requiredParticipateCount }) => ({
        fileObject: renameFile(fileObject!, `${requiredParticipateCount}.png`),
        description,
        requiredParticipateCount,
      })
    );

    const rootCid = await ipfsClient.put(
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

  return uploadImagesToIpfs;
};
