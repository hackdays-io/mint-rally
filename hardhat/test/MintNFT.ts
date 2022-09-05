import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { MintNFT, EventManager } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// ToDo requiredParticipateCountに重複がある場合エラーになってしまう。
const attributes = [
  {
    metaDataURL: "ipfs://hogehoge/count0.json",
    requiredParticipateCount: 0,
  },
  {
    metaDataURL: "ipfs://hogehoge/count1.json",
    requiredParticipateCount: 1,
  },
  {
    metaDataURL: "ipfs://hogehoge/count5.json",
    requiredParticipateCount: 5,
  },
];

describe("MintNFT", function () {
  let mintNFT: MintNFT;
  let eventManager: EventManager;

  let createdGroupId: number;
  let createdEventIds: number[] = [];

  before(async () => {
    //Deploy mintNFT and eventManager
    const MintNFTFactory = await ethers.getContractFactory("MintNFT");
    const deployedMintNFT: any = await upgrades.deployProxy(MintNFTFactory);
    mintNFT = deployedMintNFT;
    await mintNFT.deployed();
    const EventManager = await ethers.getContractFactory("EventManager");
    const deployedEventManager: any = await upgrades.deployProxy(EventManager);
    eventManager = deployedEventManager;
    await eventManager.deployed();
    await mintNFT.setEventManagerAddr(eventManager.address);
    await eventManager.setMintNFTAddr(mintNFT.address);

    //Create a Group and an Event
    const createGroupTxn = await eventManager.createGroup("First Group");
    await createGroupTxn.wait();
    const groupsList = await eventManager.getGroups();
    createdGroupId = groupsList[0].groupId.toNumber();
    const createEventTxn = await eventManager.createEventRecord(
      createdGroupId,
      "event1",
      "event1 description",
      "2022-07-3O",
      "18:00",
      "21:00",
      "hackdays",
      attributes
    );
    await createEventTxn.wait();
    const eventsList = await eventManager.getEventRecords();
    createdEventIds.push(eventsList[0].eventRecordId.toNumber());
  });

  it("mint NFT", async () => {
    const [owner1] = await ethers.getSigners();

    const mintNftTxn = await mintNFT
      .connect(owner1)
      .mintParticipateNFT(createdGroupId, createdEventIds[0], "hackdays");
    await mintNftTxn.wait();

    const nftAttribute = await mintNFT.tokenURI(0);
    expect(nftAttribute).equal("ipfs://hogehoge/count0.json");
  });

  // it("reject mint NFT when secret phrase is invalid", async () => {
  //   const [owner1] = await ethers.getSigners();
  //   const mintNftTxn = await mintNFT
  //     .connect(owner1)
  //     .mintParticipateNFT(createdGroupId, createdEventIds[0], "hackday");
  //   await mintNftTxn.wait();
  //   expect(mintNftTxn).to.throw();
  // });

  describe("NFT evolution", () => {
    let owner2: SignerWithAddress;
    let anotherGroupId: number;
    let createdEventIds: number[] = [];
    before(async () => {
      const signers = await ethers.getSigners();
      owner2 = signers[1];

      const txn1 = await eventManager.createGroup("AnotherGroup");
      await txn1.wait();
      const groupsList = await eventManager.getGroups();
      anotherGroupId = groupsList[1].groupId.toNumber();

      const createFirstEvent = await eventManager.createEventRecord(
        anotherGroupId,
        "anotherEvent1",
        "anotherEvent1description",
        "2022-08-3O",
        "18:00",
        "21:00",
        "hackdays1secret",
        attributes
      );
      await createFirstEvent.wait();

      const createAnotherEvent = await eventManager.createEventRecord(
        anotherGroupId,
        "anotherEvent2",
        "anotherEvent2description",
        "2022-08-3O",
        "18:00",
        "21:00",
        "hackdays2secret",
        attributes
      );
      await createAnotherEvent.wait();

      const createdEventsList = await eventManager.getEventRecords();
      createdEventIds.push(createdEventsList[1].eventRecordId.toNumber());
      createdEventIds.push(createdEventsList[2].eventRecordId.toNumber());

      const mintTxn1 = await mintNFT
        .connect(owner2)
        .mintParticipateNFT(
          anotherGroupId,
          createdEventIds[0],
          "hackdays1secret"
        );
      await mintTxn1.wait();

      const mintTxn2 = await mintNFT
        .connect(owner2)
        .mintParticipateNFT(
          anotherGroupId,
          createdEventIds[1],
          "hackdays2secret"
        );
      await mintTxn2.wait();
    });

    it("mint different NFT by participate count", async () => {
      const holdingNFTs = await mintNFT.tokenURI(2);
      expect(holdingNFTs).equal("ipfs://hogehoge/count1.json");
    });

    it("doesn't mint NFT for an event once attended to the same person twice", async () => {
      await expect(
        mintNFT
          .connect(owner2)
          .mintParticipateNFT(
            anotherGroupId,
            createdEventIds[0],
            "hackdays1secret"
          )
      ).to.be.revertedWith("already minted");
    });
  });
});
