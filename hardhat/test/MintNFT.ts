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

  let organizer: SignerWithAddress;
  let participant1: SignerWithAddress;
  let participant2: SignerWithAddress;
  let relayer: SignerWithAddress;

  before(async () => {
    [organizer, participant1, participant2, relayer] =
      await ethers.getSigners();
    //Deploy mintNFT and eventManager
    const MintNFTFactory = await ethers.getContractFactory("MintNFT");
    const deployedMintNFT: any = await upgrades.deployProxy(
      MintNFTFactory,
      ["0xdCb93093424447bF4FE9Df869750950922F1E30B"],
      {
        initializer: "initialize",
      }
    );
    mintNFT = deployedMintNFT;
    await mintNFT.deployed();
    const EventManager = await ethers.getContractFactory("EventManager");
    const deployedEventManager: any = await upgrades.deployProxy(
      EventManager,
      [relayer.address, 250000, 1000000],
      {
        initializer: "initialize",
      }
    );
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
      10,
      false,
      "hackdays",
      attributes
    );
    await createEventTxn.wait();
    const eventsList = await eventManager.getEventRecords();
    createdEventIds.push(eventsList[0].eventRecordId.toNumber());
  });

  describe("mint NFT", () => {
    it("success to mint", async () => {
      const mintNftTxn = await mintNFT
        .connect(organizer)
        .mintParticipateNFT(createdGroupId, createdEventIds[0], "hackdays");
      await mintNftTxn.wait();

      const nftAttribute = await mintNFT.tokenURI(0);
      expect(nftAttribute).equal("ipfs://hogehoge/count0.json");
    });

    it("fail to mint when event MintLocked", async () => {
      await eventManager
        .connect(organizer)
        .changeMintLocked(createdEventIds[0], true);
      await expect(
        mintNFT
          .connect(participant1)
          .mintParticipateNFT(createdGroupId, createdEventIds[0], "hackdays")
      ).to.be.revertedWith("mint is locked");
    });
  });

  // it("reject mint NFT when secret phrase is invalid", async () => {
  //   const [owner1] = await ethers.getSigners();
  //   const mintNftTxn = await mintNFT
  //     .connect(owner1)
  //     .mintParticipateNFT(createdGroupId, createdEventIds[0], "hackday");
  //   await mintNftTxn.wait();
  //   expect(mintNftTxn).to.throw();
  // });
});

describe("nft revolution", () => {
  let mintNFT: MintNFT;
  let eventManager: EventManager;

  let createdGroupId: number;
  let createdEventIds: number[] = [];

  let organizer: SignerWithAddress;
  let participant1: SignerWithAddress;
  let participant2: SignerWithAddress;
  let relayer: SignerWithAddress;

  before(async () => {
    [organizer, participant1, participant2, relayer] =
      await ethers.getSigners();
    //Deploy mintNFT and eventManager
    const MintNFTFactory = await ethers.getContractFactory("MintNFT");
    const deployedMintNFT: any = await upgrades.deployProxy(
      MintNFTFactory,
      ["0xdCb93093424447bF4FE9Df869750950922F1E30B"],
      {
        initializer: "initialize",
      }
    );
    mintNFT = deployedMintNFT;
    await mintNFT.deployed();
    const EventManager = await ethers.getContractFactory("EventManager");
    const deployedEventManager: any = await upgrades.deployProxy(
      EventManager,
      [relayer.address, 250000, 1000000],
      {
        initializer: "initialize",
      }
    );
    eventManager = deployedEventManager;
    await eventManager.deployed();
    await mintNFT.setEventManagerAddr(eventManager.address);
    await eventManager.setMintNFTAddr(mintNFT.address);

    //Create a Group and an Event
    const createGroupTxn = await eventManager.createGroup("First Group");
    await createGroupTxn.wait();
    const groupsList = await eventManager.getGroups();
    createdGroupId = groupsList[0].groupId.toNumber();
    const createEventTxn1 = await eventManager.createEventRecord(
      createdGroupId,
      "event1",
      "event1 description",
      "2022-07-3O",
      10,
      false,
      "hackdays",
      attributes
    );
    await createEventTxn1.wait();

    const createEventTxn2 = await eventManager.createEventRecord(
      createdGroupId,
      "event2",
      "event2 description",
      "2022-07-3O",
      1,
      false,
      "hackdays",
      attributes
    );
    await createEventTxn2.wait();

    const eventsList = await eventManager.getEventRecords();
    createdEventIds = eventsList.map((event) => event.eventRecordId.toNumber());
  });

  before(async () => {
    const mintTxn1 = await mintNFT
      .connect(organizer)
      .mintParticipateNFT(createdGroupId, createdEventIds[0], "hackdays");
    await mintTxn1.wait();

    const mintTxn2 = await mintNFT
      .connect(organizer)
      .mintParticipateNFT(createdGroupId, createdEventIds[1], "hackdays");
    await mintTxn2.wait();
  });

  it("mint different NFT by participate count", async () => {
    const holdingNFT0 = await mintNFT.tokenURI(0);
    const holdingNFT1 = await mintNFT.tokenURI(1);
    expect(holdingNFT0).equal("ipfs://hogehoge/count0.json");
    expect(holdingNFT1).equal("ipfs://hogehoge/count1.json");
  });

  it("doesn't mint NFT for an event once attended to the same person twice", async () => {
    expect(
      await mintNFT.isHoldingEventNFTByAddress(
        organizer.address,
        createdEventIds[0]
      )
    ).equal(true);
    await expect(
      mintNFT
        .connect(organizer)
        .mintParticipateNFT(createdGroupId, createdEventIds[0], "hackdays")
    ).to.be.revertedWith("already minted");
  });

  it("doesn't mint NFT if there are no remaining count", async () => {
    await expect(
      mintNFT
        .connect(participant1)
        .mintParticipateNFT(createdGroupId, createdEventIds[1], "hackdays")
    ).to.be.revertedWith("remaining count is zero");
  });

  it("doesn't mint NFT if wrong secret phrase", async () => {
    await expect(
      mintNFT
        .connect(participant2)
        .mintParticipateNFT(
          createdGroupId,
          createdEventIds[1],
          "hackdays2secrettest"
        )
    ).to.be.revertedWith("invalid secret phrase");
  });
});
