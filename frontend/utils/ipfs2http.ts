export const ipfs2http = (ipfs: string) => {
  const rootCid = ipfs.split("ipfs://")[1]?.split("/")[0];
  const fileName = ipfs.split("ipfs://")[1]?.split("/")[1];
  return `https://ipfs.mintrally.xyz/ipfs/${rootCid}/${fileName}`;
};
