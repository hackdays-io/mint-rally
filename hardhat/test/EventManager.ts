import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { EventManager, MintNFT } from "../typechain";

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

describe("EventManager", () => {
  let mintNFT: MintNFT;
  before(async () => {
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
  });

  describe("CreateEventRecord", () => {
    it("Should create", async () => {
      const eventManagerContractFactory = await ethers.getContractFactory(
        "EventManager"
      );
      const deployedEventManagerContract: any = await upgrades.deployProxy(
        eventManagerContractFactory
      );
      const eventManager: EventManager =
        await deployedEventManagerContract.deployed();
      await eventManager.setMintNFTAddr(mintNFT.address);
      await mintNFT.setEventManagerAddr(eventManager.address);

      // does not exist any groups
      const groupsBeforeCreate = await eventManager.getGroups();
      expect(groupsBeforeCreate.length).to.equal(0);

      const txn1 = await eventManager.createGroup("group1");
      await txn1.wait();
      const groupsAfterCreate = await eventManager.getGroups();
      expect(groupsAfterCreate.length).to.equal(1);
      expect(groupsAfterCreate[0].name).to.equal("group1");

      const eventRecordsBeforeCreate = await eventManager.getEventRecords();
      expect(eventRecordsBeforeCreate.length).to.equal(0);

      const txn2 = await eventManager.createEventRecord(
        groupsAfterCreate[0].groupId.toNumber(),
        "event1",
        "event1 description",
        "2022-07-3O",
        100,
        false,
        "hackdays",
        attributes
      );
      await txn2.wait();
      const eventRecordsAfterCreate = await eventManager.getEventRecords();
      expect(eventRecordsAfterCreate.length).to.equal(1);
      expect(eventRecordsAfterCreate[0].groupId).to.equal(
        groupsAfterCreate[0].groupId.toNumber()
      );
      expect(eventRecordsAfterCreate[0].name).to.equal("event1");
      expect(eventRecordsAfterCreate[0].description).to.equal(
        "event1 description"
      );
      expect(eventRecordsAfterCreate[0].date).to.equal("2022-07-3O");

      const eventRecord = await eventManager.getEventById(
        eventRecordsAfterCreate[0].eventRecordId.toNumber()
      );
      expect(eventRecord.eventRecordId).to.equal(
        eventRecordsAfterCreate[0].eventRecordId.toNumber()
      );
      expect(eventRecord.name).to.equal(eventRecordsAfterCreate[0].name);

      // cannot create event record if you are not the group owner
      const invalidGroupId = groupsAfterCreate[0].groupId.toNumber() + 1;
      try {
        const txn3 = await eventManager.createEventRecord(
          invalidGroupId,
          "event2",
          "event2 description",
          "2022-08-01",
          100,
          false,
          "hackdays",
          attributes
        );
        await txn3.wait();
      } catch (e) {
        // nothing to do
      }
      const eventRecordsAfterCreateWithInvalidGroupId =
        await eventManager.getEventRecords();
      expect(eventRecordsAfterCreateWithInvalidGroupId.length).to.equal(1);
    });
  });

  describe("GetOwnGroups", () => {
    it("Should get own group", async () => {
      const eventManagerContractFactory = await ethers.getContractFactory(
        "EventManager"
      );

      const deployedEventManagerContract: any = await upgrades.deployProxy(
        eventManagerContractFactory
      );
      const eventManager: EventManager =
        await deployedEventManagerContract.deployed();
      await eventManager.setMintNFTAddr(mintNFT.address);
      await mintNFT.setEventManagerAddr(eventManager.address);

      const [address1, address2] = await ethers.getSigners();

      // create group by address1
      const txn1 = await eventManager.connect(address1).createGroup("group1");
      await txn1.wait();

      // create group by address2
      const txn2 = await eventManager.connect(address2).createGroup("group2");
      await txn2.wait();

      // get all groups
      const allGroups = await eventManager.getGroups();
      expect(allGroups.length).to.equal(2);

      // get group by address1
      const ownGroups = await eventManager.connect(address1).getOwnGroups();
      expect(ownGroups.length).to.equal(1);
      expect(ownGroups[0].name).to.equal("group1");

      // create group by address1
      const txn3 = await eventManager.connect(address1).createGroup("group3");
      await txn3.wait();

      const ownGroups2 = await eventManager.connect(address1).getOwnGroups();
      expect(ownGroups2.length).to.equal(2);
      expect(ownGroups2[0].name).to.equal("group1");
      expect(ownGroups2[1].name).to.equal("group3");
    });
  });
});
