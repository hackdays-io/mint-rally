import contract from "../contracts/MintNFT.json";
import { BigNumber, ethers } from "ethers";
import { ipfs2http } from "../../utils/ipfs2http";
import axios from "axios";
import { INFTMetaData, IOwnedNFT } from "../hooks/useMintNFTManager";
const provierRpc = process.env.NEXT_PUBLIC_PROVIDER_RPC!;
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER!;

const getMintNFTManagerContract = () => {
  const provider = new ethers.providers.JsonRpcProvider(provierRpc);
  const _contract = new ethers.Contract(
    contractAddress,
    contract.abi,
    provider
  );
  return _contract;
}
export const getOwnedNFTsFromAddress = async (address: string) => {
  const mintNFTManager = getMintNFTManagerContract();
  if (!mintNFTManager) throw new Error("Cannot find mintNFTManager contract");
  const balanceOfNFTs = await mintNFTManager.balanceOf(address);
  const metadata: IOwnedNFT[] = [];
  for (let index = 0; index < balanceOfNFTs.toNumber(); index++) {
    const tokenId = await mintNFTManager.tokenOfOwnerByIndex(address, index);
    const tokenURI = await mintNFTManager.tokenURI(tokenId);
    const path = ipfs2http(tokenURI);
    const { data } = await axios.get(path);
    metadata.push({ tokenId: tokenId, metaData: data });
  }
  return metadata;
}
export const getNFTDataFromAddress = async (tokenId: BigNumber) => {
  const mintNFTManager = getMintNFTManagerContract();
  if (!mintNFTManager)
    throw new Error("Cannot find mintNFTManager contract");
  const tokenURI = await mintNFTManager.tokenURI(tokenId);
  const path = ipfs2http(tokenURI);
  const { data } = await axios.get(path);
  return data as INFTMetaData;
}