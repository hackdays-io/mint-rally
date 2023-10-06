import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, upgrades } from "hardhat";
import {
  EventManager,
  MintNFT,
  OperationController,
  SecretPhraseVerifier,
  // eslint-disable-next-line node/no-missing-import
} from "../typechain";
// eslint-disable-next-line node/no-missing-import
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
  let operationController: OperationController;
  let organizer: SignerWithAddress;
  let participant1: SignerWithAddress;
  let participant2: SignerWithAddress;
  let relayer: SignerWithAddress;

  before(async () => {
    [organizer, participant1, participant2, relayer] =
      await ethers.getSigners();
    const SecretPhraseVerifierFactory = await ethers.getContractFactory(
      "SecretPhraseVerifier"
    );
    secretPhraseVerifier = await SecretPhraseVerifierFactory.deploy();
    const OperationControllerFactory = await ethers.getContractFactory(
      "OperationController"
    );
    const deployedOperationController: any = await upgrades.deployProxy(
      OperationControllerFactory,
      { initializer: "initialize" }
    );
    operationController = deployedOperationController;
    await operationController.deployed();
    const MintNFTFactory = await ethers.getContractFactory("MintNFT");
    const deployedMintNFT: any = await upgrades.deployProxy(
      MintNFTFactory,
      [
        "0xdCb93093424447bF4FE9Df869750950922F1E30B",
        secretPhraseVerifier.address,
        operationController.address,
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
        [relayer.address, 250000, 1000000, operationController.address],
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

      // revert if paused
      await operationController.connect(organizer).pause();
      await expect(eventManager.createGroup("group1")).to.be.revertedWith(
        "Paused"
      );
      await operationController.connect(organizer).unpause();

      const txn1 = await eventManager.createGroup("group1");
      await txn1.wait();
      const groupsAfterCreate = await eventManager.getGroups();
      expect(groupsAfterCreate.length).to.equal(1);
      expect(groupsAfterCreate[0].name).to.equal("group1");

      const eventRecordsBeforeCreate = await eventManager.getEventRecords(0, 0);
      expect(eventRecordsBeforeCreate.length).to.equal(0);

      // revert if paused
      await operationController.connect(organizer).pause();
      await expect(
        eventManager.createEventRecord(
          groupsAfterCreate[0].groupId.toNumber(),
          "event-1",
          "event-1 description",
          "2022-07-3O",
          100,
          false,
          publicInputCalldata[0],
          attributes
        )
      ).to.be.revertedWith("Paused");

      await operationController.connect(organizer).unpause();

      const txn2 = await eventManager.createEventRecord(
        groupsAfterCreate[0].groupId.toNumber(),
        "event-1",
        "event-1 description",
        "2022-07-3O",
        100,
        false,
        publicInputCalldata[0],
        attributes
      );
      await txn2.wait();
      const eventRecordsAfterCreate = await eventManager.getEventRecords(0, 0);
      expect(eventRecordsAfterCreate.length).to.equal(1);
      expect(eventRecordsAfterCreate[0].groupId).to.equal(
        groupsAfterCreate[0].groupId.toNumber()
      );
      expect(eventRecordsAfterCreate[0].name).to.equal("event-1");
      expect(eventRecordsAfterCreate[0].description).to.equal(
        "event-1 description"
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
        await eventManager.getEventRecords(0, 0);
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
    describe("Create 500 events for testing pagenation", () => {
      it("Should create 500 events", async () => {
        const txn1 = await eventManager.createGroup("group2");
        await txn1.wait();
        const groupsAfterCreate = await eventManager.getGroups();
        for (let i = 0; i < 500; i++) {
          const txn = await eventManager.createEventRecord(
            groupsAfterCreate[1].groupId.toNumber(),
            `event${i}`,
            `event${i} description`,
            "2022-07-3O",
            11 + i,
            true,
            publicInputCalldata[0],
            attributes,
            {
              value: ethers.utils.parseUnits(
                String(25000000 * 10 * 1.33),
                "gwei"
              ),
            }
          );
          await txn.wait();
        }
      });
      it("should return total record count", async () => {
        expect(await eventManager.getEventRecordCount()).to.equal(502);
      });
      it("should throw error when offset is too lerge", async () => {
        await expect(eventManager.getEventRecords(100, 600)).to.be.revertedWith(
          "offset is too large"
        );
      });
      it("should throw error when limit is too lerge", async () => {
        await expect(eventManager.getEventRecords(200, 0)).to.be.revertedWith(
          "limit is too large"
        );
      });
      it("should return first 100 records by pagenation", async () => {
        expect((await eventManager.getEventRecords(0, 0)).length).equal(100);
      });
      it("should return from last events", async () => {
        const _events = await eventManager.getEventRecords(0, 0);
        expect(_events[0].name).to.equal("event499");
        expect(_events[99].name).to.equal("event400");
      });
      it("should return next 100 records by pagenation", async () => {
        const _events = await eventManager.getEventRecords(100, 100);
        expect(_events[0].name).to.equal("event399");
        expect(_events[99].name).to.equal("event300");
      });
      it("should return last 2 records by pagenation", async () => {
        const _events = await eventManager.getEventRecords(100, 500);
        expect(_events.length).to.equal(2);
        expect(_events[0].name).to.equal("event1");
        expect(_events[1].name).to.equal("event-1");
      });
      it("should return last one records by pagenation", async () => {
        const _events = await eventManager.getEventRecords(100, 501);
        expect(_events.length).to.equal(1);
        expect(_events[0].name).to.equal("event-1");
      });
      it("should return specified number of records by pagenation", async () => {
        const _events = await eventManager.getEventRecords(50, 0);
        expect(_events.length).to.equal(50);
      });
    });
  });

  describe("GetOwnGroups", async () => {
    it("Should get own group", async () => {
      const eventManagerContractFactory = await ethers.getContractFactory(
        "EventManager"
      );
      const deployedEventManagerContract: any = await upgrades.deployProxy(
        eventManagerContractFactory,
        [relayer.address, 500000, 1000000, operationController.address],
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
  describe("GetOwnEvents", async () => {
    let eventManager: EventManager;
    let publicInputCalldata: any;
    before(async () => {
      const eventManagerContractFactory = await ethers.getContractFactory(
        "EventManager"
      );
      const deployedEventManagerContract: any = await upgrades.deployProxy(
        eventManagerContractFactory,
        [relayer.address, 250000, 1000000, operationController.address],
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
    it("Should return own event records", async () => {
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
      // get group by address2
      const otherGroups = await eventManager
        .connect(participant1)
        .getOwnGroups(participant1.address);
      // create events record by address1
      for (let i = 0; i < 3; i++) {
        const _txn = await eventManager.createEventRecord(
          ownGroups[0].groupId.toNumber(),
          `event${i}`,
          `event${i} description`,
          "2023-07-3O",
          100,
          false,
          publicInputCalldata[0],
          attributes,
          { value: ethers.utils.parseUnits(String(250000 * 10 * 1.33), "gwei") }
        );
        await _txn.wait();
      }
      // create event record by address2
      const txn3 = await eventManager
        .connect(participant1)
        .createEventRecord(
          otherGroups[0].groupId.toNumber(),
          `event_x`,
          `event_x description`,
          "2023-07-3O",
          100,
          false,
          publicInputCalldata[0],
          attributes,
          { value: ethers.utils.parseUnits(String(250000 * 10 * 1.33), "gwei") }
        );
      await txn3.wait();
      // get own event records by group id
      const ownEventRecords = await eventManager.getEventRecordsByGroupId(
        ownGroups[0].groupId.toNumber()
      );
      expect(ownEventRecords.length).to.equal(3);
      // should return reverse order
      expect(ownEventRecords[0].name).to.equal("event2");
      expect(ownEventRecords[1].name).to.equal("event1");
      expect(ownEventRecords[2].name).to.equal("event0");
    });
  });

  describe("Role", async () => {
    let eventManager: EventManager;

    beforeEach(async () => {
      const eventManagerContractFactory = await ethers.getContractFactory(
        "EventManager"
      );
      const deployedEventManagerContract: any = await upgrades.deployProxy(
        eventManagerContractFactory,
        [relayer.address, 250000, 1000000, operationController.address],
        {
          initializer: "initialize",
        }
      );
      eventManager = await deployedEventManagerContract.deployed();
      await eventManager.setMintNFTAddr(mintNFT.address);
      await mintNFT.setEventManagerAddr(eventManager.address);
    });

    describe("grantAdminRole", async () => {
      it("should grant if group owner", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        // In myself case
        expect(await eventManager.connect(organizer).isAdmin(groupId)).to.equal(
          false
        );

        // revert if paused
        await operationController.connect(organizer).pause();
        await expect(
          eventManager
            .connect(organizer)
            .grantAdminRole(groupId, organizer.address)
        ).to.be.revertedWith("Paused");
        await operationController.connect(organizer).unpause();

        await eventManager
          .connect(organizer)
          .grantAdminRole(groupId, organizer.address);

        expect(await eventManager.connect(organizer).isAdmin(groupId)).to.equal(
          true
        );

        // No error in duplicate grant
        await eventManager
          .connect(organizer)
          .grantAdminRole(groupId, organizer.address);

        // In other user case
        expect(
          await eventManager.connect(participant1).isAdmin(groupId)
        ).to.equal(false);

        await eventManager
          .connect(organizer)
          .grantAdminRole(groupId, participant1.address);

        expect(
          await eventManager.connect(participant1).isAdmin(groupId)
        ).to.equal(true);
      });

      it("should grant if admin member", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        // revert if not group owner and not admin
        await expect(
          eventManager
            .connect(participant1)
            .grantAdminRole(groupId, participant1.address)
        ).to.be.revertedWith("Not permitted");

        await eventManager
          .connect(organizer)
          .grantAdminRole(groupId, participant1.address);

        await eventManager
          .connect(participant1)
          .grantAdminRole(groupId, participant2.address);

        expect(
          await eventManager.connect(participant2).isAdmin(groupId)
        ).to.equal(true);
      });

      it("should revert if not permitted", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        // participant1 is other group owner and collaborator of group1
        const txn2 = await eventManager
          .connect(participant1)
          .createGroup("group2");
        await txn2.wait();
        await eventManager
          .connect(organizer)
          .grantCollaboratorRole(groupId, participant1.address);

        await expect(
          eventManager
            .connect(participant1)
            .grantAdminRole(groupId, participant1.address)
        ).to.be.revertedWith("Not permitted");
      });

      it("should revert if invalid group id", async () => {
        await expect(
          eventManager
            .connect(organizer)
            .grantAdminRole(0, participant1.address)
        ).to.revertedWith("Invalid groupId");

        await expect(
          eventManager
            .connect(organizer)
            .grantAdminRole(2, participant1.address)
        ).to.revertedWith("Invalid groupId");
      });
    });

    describe("grantCollaboratorRole", async () => {
      it("should grant", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        // In myself case
        expect(
          await eventManager.connect(organizer).isCollaborator(groupId)
        ).to.equal(false);

        // revert if paused
        await operationController.connect(organizer).pause();
        await expect(
          eventManager
            .connect(organizer)
            .grantCollaboratorRole(groupId, organizer.address)
        ).to.be.revertedWith("Paused");
        await operationController.connect(organizer).unpause();

        await eventManager
          .connect(organizer)
          .grantCollaboratorRole(groupId, organizer.address);

        expect(
          await eventManager.connect(organizer).isCollaborator(groupId)
        ).to.equal(true);

        // In other user case
        expect(
          await eventManager.connect(participant1).isCollaborator(groupId)
        ).to.equal(false);

        await eventManager
          .connect(organizer)
          .grantCollaboratorRole(groupId, participant1.address);

        expect(
          await eventManager.connect(participant1).isCollaborator(groupId)
        ).to.equal(true);
      });

      it("should revert", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        // participant1 is other group owner and collaborator of group1
        const txn2 = await eventManager
          .connect(participant1)
          .createGroup("group2");
        await txn2.wait();
        await eventManager
          .connect(organizer)
          .grantCollaboratorRole(groupId, participant1.address);

        await expect(
          eventManager
            .connect(participant1)
            .grantCollaboratorRole(groupId, participant1.address)
        ).to.be.revertedWith("Not permitted");
      });
    });

    describe("revokeAdminRole", async () => {
      it("should revoke if group owner", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        // No error in no data
        await eventManager
          .connect(organizer)
          .revokeAdminRole(groupId, organizer.address);

        // In myself case
        await eventManager
          .connect(organizer)
          .grantAdminRole(groupId, organizer.address);
        expect(await eventManager.connect(organizer).isAdmin(groupId)).to.equal(
          true
        );

        // revert if paused
        await operationController.connect(organizer).pause();
        await expect(
          eventManager
            .connect(organizer)
            .revokeAdminRole(groupId, organizer.address)
        ).to.be.revertedWith("Paused");
        await operationController.connect(organizer).unpause();

        await eventManager
          .connect(organizer)
          .revokeAdminRole(groupId, organizer.address);
        expect(await eventManager.connect(organizer).isAdmin(groupId)).to.equal(
          false
        );

        // In other user case
        await eventManager
          .connect(organizer)
          .grantAdminRole(groupId, participant1.address);
        expect(
          await eventManager.connect(participant1).isAdmin(groupId)
        ).to.equal(true);

        await eventManager
          .connect(organizer)
          .revokeAdminRole(groupId, participant1.address);
        expect(
          await eventManager.connect(participant1).isAdmin(groupId)
        ).to.equal(false);
      });

      it("should revoke if admin member", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        // revert if not group owner and not admin
        await expect(
          eventManager
            .connect(participant1)
            .revokeAdminRole(groupId, participant1.address)
        ).to.be.revertedWith("Not permitted");

        await eventManager
          .connect(organizer)
          .grantAdminRole(groupId, participant1.address);

        // revoke by myself
        await eventManager
          .connect(participant1)
          .revokeAdminRole(groupId, participant1.address);

        expect(
          await eventManager.connect(participant1).isAdmin(groupId)
        ).to.equal(false);
      });

      it("should revert if not permitted", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        // participant1 is other group owner and collaborator of group1
        const txn2 = await eventManager
          .connect(participant1)
          .createGroup("group2");
        await txn2.wait();
        await eventManager
          .connect(organizer)
          .grantCollaboratorRole(groupId, participant1.address);

        await expect(
          eventManager
            .connect(participant1)
            .revokeAdminRole(groupId, participant1.address)
        ).to.be.revertedWith("Not permitted");
      });

      it("should revert if invalid group id", async () => {
        await expect(
          eventManager
            .connect(organizer)
            .revokeAdminRole(0, participant1.address)
        ).to.revertedWith("Invalid groupId");

        await expect(
          eventManager
            .connect(organizer)
            .revokeAdminRole(2, participant1.address)
        ).to.revertedWith("Invalid groupId");
      });
    });

    describe("revokeCollaboratorRole", async () => {
      it("should revoke", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        // In myself case
        await eventManager
          .connect(organizer)
          .grantCollaboratorRole(groupId, organizer.address);
        expect(
          await eventManager.connect(organizer).isCollaborator(groupId)
        ).to.equal(true);

        // revert if paused
        await operationController.connect(organizer).pause();
        await expect(
          eventManager
            .connect(organizer)
            .revokeCollaboratorRole(groupId, organizer.address)
        ).to.be.revertedWith("Paused");
        await operationController.connect(organizer).unpause();

        await eventManager
          .connect(organizer)
          .revokeCollaboratorRole(groupId, organizer.address);
        expect(
          await eventManager.connect(organizer).isCollaborator(groupId)
        ).to.equal(false);

        // In other user case
        await eventManager
          .connect(organizer)
          .grantCollaboratorRole(groupId, participant1.address);
        expect(
          await eventManager.connect(participant1).isCollaborator(groupId)
        ).to.equal(true);

        await eventManager
          .connect(organizer)
          .revokeCollaboratorRole(groupId, participant1.address);
        expect(
          await eventManager.connect(participant1).isCollaborator(groupId)
        ).to.equal(false);
      });

      it("should revert", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        // participant1 is other group owner and collaborator of group1
        const txn2 = await eventManager
          .connect(participant1)
          .createGroup("group2");
        await txn2.wait();
        await eventManager
          .connect(organizer)
          .grantCollaboratorRole(groupId, participant1.address);

        await expect(
          eventManager
            .connect(participant1)
            .revokeCollaboratorRole(groupId, participant1.address)
        ).to.be.revertedWith("Not permitted");
      });
    });

    describe("isAdmin", async () => {
      it("should return true", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const txn2 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn2.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId1 = groups[0].groupId.toNumber();
        const groupId2 = groups[1].groupId.toNumber();

        // collaborator of group1 and admin of group2, but not admin of group1
        await eventManager
          .connect(organizer)
          .grantCollaboratorRole(groupId1, participant1.address);
        await eventManager
          .connect(organizer)
          .grantAdminRole(groupId2, participant1.address);
        expect(
          await eventManager.connect(participant1).isAdmin(groupId1)
        ).to.equal(false);

        await eventManager
          .connect(organizer)
          .grantAdminRole(groupId1, participant1.address);
        expect(
          await eventManager.connect(participant1).isAdmin(groupId1)
        ).to.equal(true);
      });

      it("should return false if unknown group id", async () => {
        expect(await eventManager.connect(organizer).isAdmin(0)).to.equal(
          false
        );
      });

      it("should return false if unknown address", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        await eventManager
          .connect(organizer)
          .grantAdminRole(groupId, organizer.address);

        expect(
          await eventManager.connect(participant1).isAdmin(groupId)
        ).to.equal(false);
      });
    });

    describe("isCollaborator", async () => {
      it("should return true", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const txn2 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn2.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId1 = groups[0].groupId.toNumber();
        const groupId2 = groups[1].groupId.toNumber();

        // admin of group1 and collaborator of group2, but not collaborator of group1
        await eventManager
          .connect(organizer)
          .grantAdminRole(groupId1, participant1.address);
        await eventManager
          .connect(organizer)
          .grantCollaboratorRole(groupId2, participant1.address);
        expect(
          await eventManager.connect(participant1).isCollaborator(groupId1)
        ).to.equal(false);

        await eventManager
          .connect(organizer)
          .grantCollaboratorRole(groupId1, participant1.address);
        expect(
          await eventManager.connect(participant1).isAdmin(groupId1)
        ).to.equal(true);
      });

      it("should return false if unknown group id", async () => {
        expect(
          await eventManager.connect(organizer).isCollaborator(0)
        ).to.equal(false);
      });

      it("should return false if unknown address", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        await eventManager
          .connect(organizer)
          .grantCollaboratorRole(groupId, organizer.address);

        expect(
          await eventManager.connect(participant1).isCollaborator(groupId)
        ).to.equal(false);
      });
    });
  });
});
