import { expect } from "chai";
import { ethers } from "hardhat";
import { MintNFT, EventManager } from "../typechain";

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

  before(async () => {
    const MintNFT = await ethers.getContractFactory("MintNFT");
    mintNFT = await MintNFT.deploy();
    await mintNFT.deployed();
    const EventManager = await ethers.getContractFactory("EventManager");
    eventManager = await EventManager.deploy(mintNFT.address);
    await eventManager.deployed();
    mintNFT.setEventManagerAddr(eventManager.address);
  });

  it("MintNFT test", async function () {
    const [owner1, owner2] = await ethers.getSigners();

    const txn1 = await eventManager.createGroup("group1", images);
    await txn1.wait();

    const groupsAfterCreate = await eventManager.getGroups();
    const group1Id = groupsAfterCreate[0].groupId.toNumber();
    const txn2 = await eventManager.createEventRecord(
      group1Id,
      "event1",
      "event1 description",
      "2022-07-3O",
      "18:00",
      "21:00",
      "hackdays"
    );
    await txn2.wait();
    const eventRecord1 = await eventManager.getEventRecords();
    const eventRecord1Id = eventRecord1[0].eventRecordId.toNumber();

    let mintTxn = await mintNFT
      .connect(owner1)
      .mintParticipateNFT(group1Id, eventRecord1Id, "hackdays");
    await mintTxn.wait();

    const txn3 = await eventManager.createEventRecord(
      group1Id,
      "event1",
      "event1 description",
      "2022-07-3O",
      "18:00",
      "21:00",
      "hackdays"
    );
    await txn3.wait();
    const eventRecord2 = await eventManager.getEventRecords();
    const eventRecord2Id = eventRecord2[0].eventRecordId.toNumber();

    mintTxn = await mintNFT
      .connect(owner1)
      .mintParticipateNFT(group1Id, eventRecord2Id, "hackdays");
    await mintTxn.wait();

    let holdingNFTs = await mintNFT.connect(owner1).getOwnedNFTs();
    expect(holdingNFTs[1].image).equal("https://i.imgur.com/TZEhCTXaaa.png");
  });
});
