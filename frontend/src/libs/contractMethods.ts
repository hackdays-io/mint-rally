import contract from "../contracts/MintNFT.json";
import eventContract from "../contracts//EventManager.json";
import { BigNumber, ethers } from "ethers";
import { ipfs2http } from "../../utils/ipfs2http";
import axios from "axios";
import { NFT } from "types/NFT";
import { Event } from "types/Event";
const provierRpc = process.env.NEXT_PUBLIC_PROVIDER_RPC!;
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER!;
const eventContractAddress = process.env.NEXT_PUBLIC_CONTRACT_EVENT_MANAGER!;

const getMintNFTManagerContract = () => {
  const provider = new ethers.providers.JsonRpcProvider(provierRpc);
  const _contract = new ethers.Contract(
    contractAddress,
    contract.abi,
    provider
  );
  return _contract;
}
const getEventManagerContract = () => {
  const provider = new ethers.providers.JsonRpcProvider(provierRpc);
  const _contract = new ethers.Contract(
    eventContractAddress,
    eventContract.abi,
    provider
  );
  return _contract;
}
export const getNFTDataFromTokenID = async (tokenId: BigNumber) => {
  const mintNFTManager = getMintNFTManagerContract();
  if (!mintNFTManager)
    throw new Error("Cannot find mintNFTManager contract");
  const tokenURI = await mintNFTManager.tokenURI(tokenId);
  if (tokenURI === "") throw new Error("Cannot find tokenURI");
  const path = ipfs2http(tokenURI);
  const { data } = await axios.get(path);
  return data as NFT.Metadata;
}
export const getOwnerOfTokenId = async (tokenId: BigNumber) => {
  const mintNFTManager = getMintNFTManagerContract();
  if (!mintNFTManager)
    throw new Error("Cannot find mintNFTManager contract");
  const owner = await mintNFTManager.ownerOf(tokenId);
  return owner;
}
export const getEventGroups = async () => {
  const eventManager = getEventManagerContract();
  if (!eventManager)
    throw new Error("Cannot find eventManager contract");
  const eventGroups: Array<Event.EventGroup> = await eventManager.getGroups();
  return eventGroups;
}
export const getNFTHoldersOfEvent = async (eventid: BigNumber) => {
  const mintNFTManager = getMintNFTManagerContract();
  if (!mintNFTManager)
    throw new Error("Cannot find v contract");
  const nfts: Array<NFT.Metadata> = await mintNFTManager.getNFTHoldersOfEvent(eventid);
  return nfts;
}