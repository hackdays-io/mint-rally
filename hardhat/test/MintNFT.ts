import { expect } from "chai";
import { ethers } from "hardhat";
import { MintNFT, EventManager } from "../typechain";
import base64 from "base64-js";

// ToDo requiredParticipateCountに重複がある場合エラーになってしまう。
const images = [
  {
    image: "https://i.imgur.com/TZEhCTX.png",
    requiredParticipateCount: 0,
  },
  {
    image: "https://i.imgur.com/TZEhCTXaaa.png",
    requiredParticipateCount: 1,
  },
  {
    image: "https://i.imgur.com/TZEhCTXaaaaa.png",
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

    expect(decodedAttribute.name).equal("First Group: event1");
    expect(decodedAttribute.description).equal("event1 description");
    expect(decodedAttribute.image).equal("https://i.imgur.com/TZEhCTX.png");
    expect(decodedAttribute.id).equal(0);
  });

  // it("reject mint NFT when secret phrase is invalid", async () => {
  //   const [owner1] = await ethers.getSigners();
  //   const mintNftTxn = await mintNFT
  //     .connect(owner1)
  //     .mintParticipateNFT(createdGroupId, createdEventIds[0], "hackday");
  //   await mintNftTxn.wait();
  //   expect(mintNftTxn).to.throw();
  // });

  it("NFT evolution", async function () {
    const [owner1] = await ethers.getSigners();

    const txn1 = await eventManager.createGroup("group1", images);
    await txn1.wait();

    let mintTxn = await mintNFT
      .connect(owner1)
      .mintParticipateNFT(createdGroupId, createdEventIds[0], "hackdays");
    await mintTxn.wait();

    const createAnotherEvent = await eventManager.createEventRecord(
      createdGroupId,
      "event2",
      "event2 description",
      "2022-08-3O",
      "18:00",
      "21:00",
      "hackdays"
    );
    await createAnotherEvent.wait();
    const createdEventsList = await eventManager.getEventRecords();
    createdEventIds.push(createdEventsList[1].eventRecordId.toNumber());

    mintTxn = await mintNFT
      .connect(owner1)
      .mintParticipateNFT(createdGroupId, createdEventIds[1], "hackdays");
    await mintTxn.wait();

    let holdingNFTs = await mintNFT.connect(owner1).getOwnedNFTs();
    expect(holdingNFTs[1].image).equal("https://i.imgur.com/TZEhCTXaaa.png");
  });
});
