export const ipfs2http = (ipfs: string) => {
  const rootCid = ipfs.split("ipfs://")[1]?.split("/")[0];
  const domain = process.env.NEXT_PUBLIC_PINATA_GATEWAY || `${rootCid}.ipfs.w3s.link`
  const fileName = ipfs.split("ipfs://")[1]?.split("/")[1];
  return `https://${domain}/ipfs/${rootCid}/${fileName}`;
};
