import { ethers } from "hardhat";
import { MintNFT, EventManager } from "../typechain";
import { BigNumber } from "ethers";
import { eventManagerAddress, mintNFTAddress } from "./helper/getAddresses";
import { chunk } from "lodash";

async function main() {
  try {
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

    // chunk eventIds and tokenIdsArr 200
    const chunkedEventIds = chunk(eventIds, 10);
    const chunkedTokenIdsArr = chunk(tokenIdsArr, 10);

    for (let index = 0; index < chunkedEventIds.length; index++) {
      const eventIds = chunkedEventIds[index];
      const tokenIdsArr = chunkedTokenIdsArr[index];

      console.log("eventIds", eventIds);
      console.log("tokenIdsArr", tokenIdsArr);

      // @todo コントラクトをアップグレード後、以下のコメントアウトを外す
      await (
        await mintNFT.setEventIdOfTokenIdsBatch(eventIds, tokenIdsArr)
      ).wait();

      await new Promise((resolve) => setTimeout(resolve, 10000));

      console.log("ok");
    }

    const lastEventIdOfTokenIds = tokenIdsArr[eventIds.length - 1];

    console.log("lastEventIdOfTokenIds", lastEventIdOfTokenIds);

    const eventIdOfTokenId = await mintNFT.getEventIdOfTokenId(
      lastEventIdOfTokenIds[lastEventIdOfTokenIds.length - 1]
    );

    console.log("check eventIdOfTokenId", eventIdOfTokenId.toNumber());
  } catch (error) {
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
