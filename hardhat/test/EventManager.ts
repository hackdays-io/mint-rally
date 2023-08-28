import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, upgrades } from "hardhat";
import { EventManager, MintNFT, SecretPhraseVerifier } from "../typechain";
import { generateProof } from "./helper/secret_phrase";

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

describe("EventManager", function () {
  let mintNFT: MintNFT;
  let secretPhraseVerifier: SecretPhraseVerifier;
  let organizer: SignerWithAddress;
  let participant1: SignerWithAddress;
  let relayer: SignerWithAddress;

  before(async () => {
    [organizer, participant1, relayer] = await ethers.getSigners();
    const SecretPhraseVerifierFactory = await ethers.getContractFactory(
      "SecretPhraseVerifier"
    );
    secretPhraseVerifier = await SecretPhraseVerifierFactory.deploy();
    const MintNFTFactory = await ethers.getContractFactory("MintNFT");
    const deployedMintNFT: any = await upgrades.deployProxy(
      MintNFTFactory,
      [
        "0xdCb93093424447bF4FE9Df869750950922F1E30B",
        secretPhraseVerifier.address,
      ],
      {
        initializer: "initialize",
      }
    );
    mintNFT = deployedMintNFT;
    await mintNFT.deployed();
  });

  describe("CreateEventRecord", () => {
    let eventManager: EventManager;
    let publicInputCalldata: any;
    before(async () => {
      const eventManagerContractFactory = await ethers.getContractFactory(
        "EventManager"
      );
      const deployedEventManagerContract: any = await upgrades.deployProxy(
        eventManagerContractFactory,
        [relayer.address, 250000, 1000000],
        {
          initializer: "initialize",
        }
      );
      eventManager = await deployedEventManagerContract.deployed();
      await eventManager.setMintNFTAddr(mintNFT.address);
      await mintNFT.setEventManagerAddr(eventManager.address);

      const { publicInputCalldata: _publicInputCalldata } =
        await generateProof();
      publicInputCalldata = _publicInputCalldata;
    });

    it("Should create", async () => {
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
        publicInputCalldata[0],
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
          publicInputCalldata[0],
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

    it("Should create mtx event", async () => {
      const txn1 = await eventManager.createGroup("group2");
      await txn1.wait();
      const groupsAfterCreate = await eventManager.getGroups();

      const txn = await eventManager.createEventRecord(
        groupsAfterCreate[1].groupId.toNumber(),
        "event1",
        "event1 description",
        "2022-07-3O",
        10,
        true,
        publicInputCalldata[0],
        attributes,
        { value: ethers.utils.parseUnits(String(250000 * 10 * 1.33), "gwei") }
      );
      await txn.wait();

      expect(await relayer.getBalance()).equal(
        BigNumber.from("10000003325000000000000")
      );
    });
  });

  describe("GetOwnGroups", async () => {
    it("Should get own group", async () => {
      const eventManagerContractFactory = await ethers.getContractFactory(
        "EventManager"
      );
      const deployedEventManagerContract: any = await upgrades.deployProxy(
        eventManagerContractFactory,
        [relayer.address, 500000, 1000000],
        {
          initializer: "initialize",
        }
      );
      const eventManager: EventManager =
        await deployedEventManagerContract.deployed();
      await eventManager.setMintNFTAddr(mintNFT.address);
      await mintNFT.setEventManagerAddr(eventManager.address);
      // create group by address1
      const txn1 = await eventManager.connect(organizer).createGroup("group1");
      await txn1.wait();

      // create group by address2
      const txn2 = await eventManager
        .connect(participant1)
        .createGroup("group2");
      await txn2.wait();

      // get all groups
      const allGroups = await eventManager.getGroups();
      expect(allGroups.length).to.equal(2);

      // get group by address1
      const ownGroups = await eventManager
        .connect(organizer)
        .getOwnGroups(organizer.address);
      expect(ownGroups.length).to.equal(1);
      expect(ownGroups[0].name).to.equal("group1");

      // create group by address1
      const txn3 = await eventManager.connect(organizer).createGroup("group3");
      await txn3.wait();
      const ownGroups2 = await eventManager
        .connect(organizer)
        .getOwnGroups(organizer.address);
      expect(ownGroups2.length).to.equal(2);
      expect(ownGroups2[0].name).to.equal("group1");
      expect(ownGroups2[1].name).to.equal("group3");
    });
  });
});
