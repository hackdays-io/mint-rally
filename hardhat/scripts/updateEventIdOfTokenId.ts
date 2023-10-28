import { ethers } from "hardhat";
import { MintNFT, EventManager } from "../typechain";
import { BigNumber } from "ethers";

const MINT_NFT_ADDRESS = "0xC3894D90dF7EFCAe8CF34e300CF60FF29Db9a868";
const EVENT_MANAGER_ADDRESS = "0x4fe4F50B719572b3a5A33516da59eC43F51F4A45";

async function main() {
  const MintNFTFactory = await ethers.getContractFactory("MintNFT");
  const mintNFT = MintNFTFactory.attach(MINT_NFT_ADDRESS) as MintNFT;

  // EventManagerのインスタンスを作成
  const EventManagerFactory = await ethers.getContractFactory("EventManager");
  const eventManager = EventManagerFactory.attach(
    EVENT_MANAGER_ADDRESS
  ) as EventManager;

  let eventIds: number[] = [];
  let tokenIdsArr: number[][] = [];

  const eventRecordCountBigNumber = await eventManager.getEventRecordCount();
  const eventRecordCount = eventRecordCountBigNumber.toNumber();
  console.log("eventRecordCount", eventRecordCount);

  for (let i = 1; i <= eventRecordCount; i++) {
    eventIds.push(i);

    // @todo コントラクトをアップグレード後、以下のコメントアウトを外す
    // const tokenIds: BigNumber[] = await mintNFT.getTokenIdsByEvent(i);

    // tokenIdsArr.push(tokenIds.map((tokenId) => tokenId.toNumber()));
  }
  console.log("eventIds", eventIds);
  console.log("tokenIdToEventIds", tokenIdsArr);

  // @todo コントラクトをアップグレード後、以下のコメントアウトを外す
  // await (await mintNFT.setEventIdOfTokenIdsBatch(eventIds, tokenIdsArr)).wait();

  // const lastEventIdOfTokenIds = tokenIdsArr[eventIds.length - 1];

  // console.log("lastEventIdOfTokenIds", lastEventIdOfTokenIds);

  // const eventIdOfTokenId = await mintNFT.getEventIdOfTokenId(
  //   lastEventIdOfTokenIds[lastEventIdOfTokenIds.length - 1]
  // );

  // console.log("check eventIdOfTokenId", eventIdOfTokenId.toNumber());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
