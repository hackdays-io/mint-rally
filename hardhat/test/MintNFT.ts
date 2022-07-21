import { expect } from "chai";
import { ethers } from "hardhat";
import { MintNFT, EventManager } from "../typechain";
import base64 from "base64-js";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// ToDo requiredParticipateCountに重複がある場合エラーになってしまう。
const images = [
  {
    image: "https://i.imgur.com/TZEhCTX.png",
    description: "this is common NFT",
    requiredParticipateCount: 0,
  },
  {
    image: "https://i.imgur.com/TZEhCTXaaa.png",
    description: "this is uncommon NFT",
    requiredParticipateCount: 1,
  },
  {
    image: "https://i.imgur.com/TZEhCTXaaaaa.png",
    description: "this is special NFT",
    requiredParticipateCount: 10,
  },
];

describe("MintNFT", function () {
  let mintNFT: MintNFT;
  let eventManager: EventManager;

  let createdGroupId: number;
  let createdEventIds: number[] = [];

  before(async () => {
    //Deploy mintNFT and eventManager
    const MintNFT = await ethers.getContractFactory("MintNFT");
    mintNFT = await MintNFT.deploy();
    await mintNFT.deployed();
    const EventManager = await ethers.getContractFactory("EventManager");
    eventManager = await EventManager.deploy();
    await eventManager.deployed();
    await mintNFT.setEventManagerAddr(eventManager.address);
    await eventManager.setMintNFTAddr(mintNFT.address);

    //Create a Group and an Event
    const createGroupTxn = await eventManager.createGroup(
      "First Group",
      images
    );
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
      "hackdays"
    );
    await createEventTxn.wait();
    const eventsList = await eventManager.getEventRecords();
    createdEventIds.push(eventsList[0].eventRecordId.toNumber());
  });

  it("check nft attributes", async () => {
    const nftAttributes = await mintNFT.getGroupNFTAttributes(createdGroupId);
    expect(nftAttributes[0].image).equal("https://i.imgur.com/TZEhCTX.png");
    expect(nftAttributes[0].name).equal("First Group");
    expect(nftAttributes[0].groupId).equal(1);
  });

  it("mint NFT", async () => {
    const [owner1] = await ethers.getSigners();

    const mintNftTxn = await mintNFT
      .connect(owner1)
      .mintParticipateNFT(createdGroupId, createdEventIds[0], "hackdays");
    await mintNftTxn.wait();

    const nftAttribute = await mintNFT.tokenURI(0);
    const decodedAttribute = JSON.parse(
      new TextDecoder().decode(
        base64.toByteArray(nftAttribute.split("base64,")[1])
      )
    );

    expect(decodedAttribute.name).equal("event1");
    expect(decodedAttribute.description).equal("this is common NFT");
    expect(decodedAttribute.image).equal("https://i.imgur.com/TZEhCTX.png");
    expect(decodedAttribute.id).equal(0);

    const ownedNFT = await mintNFT.connect(owner1).getOwnedNFTs();
    expect(ownedNFT[0].groupId.toNumber()).equal(createdGroupId);
    expect(ownedNFT[0].eventId.toNumber()).equal(1);
    expect(ownedNFT[0].name).equal("event1");
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

      const txn1 = await eventManager.createGroup("AnotherGroup", images);
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
        "hackdays1secret"
      );
      await createFirstEvent.wait();

      const createAnotherEvent = await eventManager.createEventRecord(
        anotherGroupId,
        "anotherEvent2",
        "anotherEvent2description",
        "2022-08-3O",
        "18:00",
        "21:00",
        "hackdays2secret"
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
      const holdingNFTs = await mintNFT.connect(owner2).getOwnedNFTs();
      expect(holdingNFTs[0].image).equal("https://i.imgur.com/TZEhCTX.png");
      expect(holdingNFTs[0].description).equal("this is common NFT");
      expect(holdingNFTs[1].image).equal("https://i.imgur.com/TZEhCTXaaa.png");
      expect(holdingNFTs[1].description).equal("this is uncommon NFT");
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
      ).to.be.revertedWith("already minted NFT on event");
    });
  });
});
