import { ethers } from "hardhat";
import { MintNFT, EventManager } from "../typechain";
import { BigNumber } from "ethers";
import { eventManagerAddress, mintNFTAddress } from "./helper/getAddresses";

async function main() {
  const MINT_NFT_ADDRESS = mintNFTAddress();
  const EVENT_MANAGER_ADDRESS = eventManagerAddress();

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
    const tokenIds: BigNumber[] = await mintNFT.getTokenIdsByEvent(i);
    console.log(tokenIds);

    tokenIdsArr.push(tokenIds.map((tokenId) => tokenId.toNumber()));
  }

  // eventIds and tokenIdsArr length should be 100, create chunked array of eventIds and tokenIdsArr devide by 20
  const chunkedEventIds = eventIds.reduce((resultArray: any[], item, index) => {
    const chunkIndex = Math.floor(index / 20);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [];
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  const chunkedTokenIdsArr = tokenIdsArr.reduce(
    (resultArray: any[], item, index) => {
      const chunkIndex = Math.floor(index / 20);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [];
      }

      resultArray[chunkIndex].push(item);

      return resultArray;
    },
    []
  );

  console.log("chunkedEventIds", chunkedEventIds);
  console.log("chunkedTokenIdsArr", chunkedTokenIdsArr);

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
