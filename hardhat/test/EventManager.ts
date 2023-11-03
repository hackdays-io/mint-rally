import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, utils } from "ethers";
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

const ADMIN_ROLE = utils.keccak256(utils.toUtf8Bytes("ADMIN"));
const COLLABORATOR_ROLE = utils.keccak256(utils.toUtf8Bytes("COLLABORATOR"));

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

    describe("RBAC", () => {
      it("should create if admin", async () => {
        const groupName1 = "AdminGroup1";
        const groupName2 = "AdminGroup2";
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup(groupName1);
        await txn1.wait();
        const txn2 = await eventManager
          .connect(organizer)
          .createGroup(groupName2);
        await txn2.wait();

        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId1 = groups
          .find((group) => group.name === groupName1)!
          .groupId.toNumber();
        const groupId2 = groups
          .find((group) => group.name === groupName2)!
          .groupId.toNumber();

        // grant roles of group2
        await eventManager
          .connect(organizer)
          .grantRole(groupId2, participant1.address, ADMIN_ROLE);
        await eventManager
          .connect(organizer)
          .grantRole(groupId2, participant1.address, COLLABORATOR_ROLE);

        const roles = await eventManager.getMemberRole(
          groupId1,
          participant1.address
        );
        expect(roles.admin).to.equal(false);
        expect(roles.collaborator).to.equal(false);

        // revert if no role of group1
        await expect(
          eventManager
            .connect(participant1)
            .createEventRecord(
              groupId1,
              "event1",
              "event1 description",
              "2022-07-3O",
              100,
              false,
              publicInputCalldata[0],
              attributes
            )
        ).to.be.revertedWith("You have no permission");

        // grant role and then create
        await eventManager
          .connect(organizer)
          .grantRole(groupId1, participant1.address, ADMIN_ROLE);

        const txn3 = await eventManager
          .connect(participant1)
          .createEventRecord(
            groupId1,
            "event1",
            "event1 description",
            "2022-07-3O",
            100,
            false,
            publicInputCalldata[0],
            attributes
          );
        await txn3.wait();
        const records = await eventManager.getEventRecordsByGroupId(groupId1);
        expect(records.length).to.equal(1);
      });

      it("should create if collaborator", async () => {
        const groupName1 = "CollaboratorGroup1";
        const groupName2 = "CollaboratorGroup2";
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup(groupName1);
        await txn1.wait();
        const txn2 = await eventManager
          .connect(organizer)
          .createGroup(groupName2);
        await txn2.wait();

        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId1 = groups
          .find((group) => group.name === groupName1)!
          .groupId.toNumber();
        const groupId2 = groups
          .find((group) => group.name === groupName2)!
          .groupId.toNumber();

        // grant roles of group2
        await eventManager
          .connect(organizer)
          .grantRole(groupId2, participant1.address, ADMIN_ROLE);
        await eventManager
          .connect(organizer)
          .grantRole(groupId2, participant1.address, COLLABORATOR_ROLE);

        const roles = await eventManager.getMemberRole(
          groupId1,
          participant1.address
        );
        expect(roles.admin).to.equal(false);
        expect(roles.collaborator).to.equal(false);

        // revert if no role of group1
        await expect(
          eventManager
            .connect(participant1)
            .createEventRecord(
              groupId1,
              "event1",
              "event1 description",
              "2022-07-3O",
              100,
              false,
              publicInputCalldata[0],
              attributes
            )
        ).to.be.revertedWith("You have no permission");

        // grant role and then create
        await eventManager
          .connect(organizer)
          .grantRole(groupId1, participant1.address, COLLABORATOR_ROLE);

        const txn3 = await eventManager
          .connect(participant1)
          .createEventRecord(
            groupId1,
            "event1",
            "event1 description",
            "2022-07-3O",
            100,
            false,
            publicInputCalldata[0],
            attributes
          );
        await txn3.wait();
        const records = await eventManager.getEventRecordsByGroupId(groupId1);
        expect(records.length).to.equal(1);
      });

      it("should revert if no role", async () => {
        const groupName = "NoRoleGroup1";
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup(groupName);
        await txn1.wait();

        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups
          .find((group) => group.name === groupName)!
          .groupId.toNumber();

        const roles = await eventManager.getMemberRole(
          groupId,
          participant1.address
        );
        expect(roles.admin).to.equal(false);
        expect(roles.collaborator).to.equal(false);

        await expect(
          eventManager
            .connect(participant1)
            .createEventRecord(
              groupId,
              "event1",
              "event1 description",
              "2022-07-3O",
              100,
              false,
              publicInputCalldata[0],
              attributes
            )
        ).to.be.revertedWith("You have no permission");
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

  describe("GetCollaboratorAccessGroups", async () => {
    it("should return groups of collaborator access", async () => {
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

      // create groups
      const ownGroupName = "OwnGroup";
      const otherGroupName = "OtherGroup";
      const adminGroupName = "AdminGroup";
      const collaboratorGroupName = "CollaboratorGroup";

      const txn1 = await eventManager
        .connect(organizer)
        .createGroup(ownGroupName);
      await txn1.wait();
      const txn2 = await eventManager
        .connect(participant1)
        .createGroup(otherGroupName);
      await txn2.wait();
      const txn3 = await eventManager
        .connect(participant1)
        .createGroup(adminGroupName);
      await txn3.wait();
      const txn4 = await eventManager
        .connect(participant1)
        .createGroup(collaboratorGroupName);
      await txn4.wait();

      const groups = await eventManager.getGroups();
      const adminGroupId = groups
        .find((group) => group.name === adminGroupName)!
        .groupId.toNumber();
      const collaboratorGroupId = groups
        .find((group) => group.name === collaboratorGroupName)!
        .groupId.toNumber();

      // grant roles
      await eventManager
        .connect(participant1)
        .grantRole(adminGroupId, organizer.address, ADMIN_ROLE);
      await eventManager
        .connect(participant1)
        .grantRole(collaboratorGroupId, organizer.address, COLLABORATOR_ROLE);

      // check
      const ownGroups = await eventManager.getCollaboratorAccessGroups(
        organizer.address
      );
      expect(ownGroups.length).to.equal(3);
      expect(ownGroups[0].name).to.equal(ownGroupName);
      expect(ownGroups[1].name).to.equal(adminGroupName);
      expect(ownGroups[2].name).to.equal(collaboratorGroupName);
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

    async function expectRoles(
      groupId: number,
      address: string,
      expected: { admin: boolean; collaborator: boolean }
    ) {
      const roles = await eventManager.getMemberRole(groupId, address);
      expect(roles.admin).to.equal(expected.admin);
      expect(roles.collaborator).to.equal(expected.collaborator);
    }

    describe("grantRole", async () => {
      it("should grant admin role if group owner", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        // revert if paused
        await operationController.connect(organizer).pause();
        await expect(
          eventManager
            .connect(organizer)
            .grantRole(groupId, organizer.address, ADMIN_ROLE)
        ).to.be.revertedWith("Paused");
        await operationController.connect(organizer).unpause();

        // In myself case
        expectRoles(groupId, organizer.address, {
          admin: false,
          collaborator: false,
        });
        await eventManager
          .connect(organizer)
          .grantRole(groupId, organizer.address, ADMIN_ROLE);
        expectRoles(groupId, organizer.address, {
          admin: true,
          collaborator: false,
        });

        // No error in duplicate grant
        await eventManager
          .connect(organizer)
          .grantRole(groupId, organizer.address, ADMIN_ROLE);

        // In other user case
        expectRoles(groupId, participant1.address, {
          admin: false,
          collaborator: false,
        });
        await eventManager
          .connect(organizer)
          .grantRole(groupId, participant1.address, ADMIN_ROLE);
        expectRoles(groupId, participant1.address, {
          admin: true,
          collaborator: false,
        });
      });

      it("should grant admin role if admin member", async () => {
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
            .grantRole(groupId, participant1.address, ADMIN_ROLE)
        ).to.be.revertedWith("Not permitted");

        await eventManager
          .connect(organizer)
          .grantRole(groupId, participant1.address, ADMIN_ROLE);

        await eventManager
          .connect(participant1)
          .grantRole(groupId, participant2.address, ADMIN_ROLE);
        expectRoles(groupId, participant2.address, {
          admin: true,
          collaborator: false,
        });
      });

      it("should grant collaborator role", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        // revert if paused
        await operationController.connect(organizer).pause();
        await expect(
          eventManager
            .connect(organizer)
            .grantRole(groupId, organizer.address, COLLABORATOR_ROLE)
        ).to.be.revertedWith("Paused");
        await operationController.connect(organizer).unpause();

        // In myself case
        expectRoles(groupId, organizer.address, {
          admin: false,
          collaborator: false,
        });
        await eventManager
          .connect(organizer)
          .grantRole(groupId, organizer.address, COLLABORATOR_ROLE);
        expectRoles(groupId, organizer.address, {
          admin: false,
          collaborator: true,
        });

        // In other user case
        expectRoles(groupId, participant1.address, {
          admin: false,
          collaborator: false,
        });
        await eventManager
          .connect(organizer)
          .grantRole(groupId, participant1.address, COLLABORATOR_ROLE);
        expectRoles(groupId, participant1.address, {
          admin: false,
          collaborator: true,
        });
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
          .grantRole(groupId, participant1.address, COLLABORATOR_ROLE);

        await expect(
          eventManager
            .connect(participant1)
            .grantRole(groupId, participant1.address, ADMIN_ROLE)
        ).to.be.revertedWith("Not permitted");
      });

      it("should revert if invalid group id", async () => {
        await expect(
          eventManager
            .connect(organizer)
            .grantRole(0, participant1.address, ADMIN_ROLE)
        ).to.revertedWith("Invalid groupId");

        await expect(
          eventManager
            .connect(organizer)
            .grantRole(2, participant1.address, ADMIN_ROLE)
        ).to.revertedWith("Invalid groupId");
      });

      it("should revert if invalid role", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        await expect(
          eventManager
            .connect(organizer)
            .grantRole(
              groupId,
              organizer.address,
              utils.keccak256(utils.toUtf8Bytes("AAA"))
            )
        ).to.be.revertedWith("Invalid role");
      });
    });

    describe("revokeRole", async () => {
      it("should revoke admin role if group owner", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        // No error in no data
        await eventManager
          .connect(organizer)
          .revokeRole(groupId, organizer.address, ADMIN_ROLE);

        // revert if paused
        await operationController.connect(organizer).pause();
        await expect(
          eventManager
            .connect(organizer)
            .revokeRole(groupId, organizer.address, ADMIN_ROLE)
        ).to.be.revertedWith("Paused");
        await operationController.connect(organizer).unpause();

        // In myself case
        await eventManager
          .connect(organizer)
          .grantRole(groupId, organizer.address, ADMIN_ROLE);
        await eventManager
          .connect(organizer)
          .grantRole(groupId, organizer.address, COLLABORATOR_ROLE);
        expectRoles(groupId, organizer.address, {
          admin: true,
          collaborator: true,
        });
        await eventManager
          .connect(organizer)
          .revokeRole(groupId, organizer.address, ADMIN_ROLE);
        expectRoles(groupId, organizer.address, {
          admin: false,
          collaborator: true,
        });

        // In other user case
        await eventManager
          .connect(organizer)
          .grantRole(groupId, participant1.address, ADMIN_ROLE);
        await eventManager
          .connect(organizer)
          .grantRole(groupId, participant1.address, COLLABORATOR_ROLE);
        expectRoles(groupId, participant1.address, {
          admin: true,
          collaborator: true,
        });
        await eventManager
          .connect(organizer)
          .revokeRole(groupId, participant1.address, ADMIN_ROLE);
        expectRoles(groupId, participant1.address, {
          admin: false,
          collaborator: true,
        });
      });

      it("should revoke admin role if admin member", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        // revert if not group owner and not admin
        expectRoles(groupId, participant1.address, {
          admin: false,
          collaborator: false,
        });
        await expect(
          eventManager
            .connect(participant1)
            .revokeRole(groupId, participant1.address, ADMIN_ROLE)
        ).to.be.revertedWith("Not permitted");

        // revoke by myself
        await eventManager
          .connect(organizer)
          .grantRole(groupId, participant1.address, ADMIN_ROLE);
        await eventManager
          .connect(participant1)
          .revokeRole(groupId, participant1.address, ADMIN_ROLE);
        expectRoles(groupId, participant1.address, {
          admin: false,
          collaborator: false,
        });
      });

      it("should revoke collaborator role", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        // revert if paused
        await operationController.connect(organizer).pause();
        await expect(
          eventManager
            .connect(organizer)
            .revokeRole(groupId, organizer.address, COLLABORATOR_ROLE)
        ).to.be.revertedWith("Paused");
        await operationController.connect(organizer).unpause();

        // In myself case
        await eventManager
          .connect(organizer)
          .grantRole(groupId, organizer.address, COLLABORATOR_ROLE);
        expectRoles(groupId, organizer.address, {
          admin: false,
          collaborator: true,
        });
        await eventManager
          .connect(organizer)
          .revokeRole(groupId, organizer.address, COLLABORATOR_ROLE);
        expectRoles(groupId, organizer.address, {
          admin: false,
          collaborator: false,
        });

        // In other user case
        await eventManager
          .connect(organizer)
          .grantRole(groupId, participant1.address, COLLABORATOR_ROLE);
        expectRoles(groupId, participant1.address, {
          admin: false,
          collaborator: true,
        });
        await eventManager
          .connect(organizer)
          .revokeRole(groupId, participant1.address, COLLABORATOR_ROLE);
        expectRoles(groupId, participant1.address, {
          admin: false,
          collaborator: false,
        });
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
          .grantRole(groupId, participant1.address, COLLABORATOR_ROLE);

        await expect(
          eventManager
            .connect(participant1)
            .revokeRole(groupId, participant1.address, ADMIN_ROLE)
        ).to.be.revertedWith("Not permitted");
      });

      it("should revert if invalid group id", async () => {
        await expect(
          eventManager
            .connect(organizer)
            .revokeRole(0, participant1.address, ADMIN_ROLE)
        ).to.revertedWith("Invalid groupId");

        await expect(
          eventManager
            .connect(organizer)
            .revokeRole(2, participant1.address, ADMIN_ROLE)
        ).to.revertedWith("Invalid groupId");
      });

      it("should revert if invalid role", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        await expect(
          eventManager
            .connect(organizer)
            .revokeRole(
              groupId,
              organizer.address,
              utils.keccak256(utils.toUtf8Bytes("AAA"))
            )
        ).to.be.revertedWith("Invalid role");
      });
    });

    describe("getMemberRole", async () => {
      it("should return collect values", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();
        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        expectRoles(groupId, participant1.address, {
          admin: false,
          collaborator: false,
        });

        await eventManager
          .connect(organizer)
          .grantRole(groupId, participant1.address, ADMIN_ROLE);
        await eventManager
          .connect(organizer)
          .grantRole(groupId, participant1.address, COLLABORATOR_ROLE);
        expectRoles(groupId, participant1.address, {
          admin: true,
          collaborator: true,
        });
      });

      it("should return false if unknown group id", async () => {
        expectRoles(0, organizer.address, {
          admin: false,
          collaborator: false,
        });
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
          .grantRole(groupId, organizer.address, COLLABORATOR_ROLE);
        expectRoles(groupId, participant1.address, {
          admin: false,
          collaborator: false,
        });
      });
    });

    describe("hasCollaboratorAccessByEventId", async () => {
      let publicInputCalldata: any;

      beforeEach(async () => {
        const { publicInputCalldata: _publicInputCalldata } =
          await generateProof();
        publicInputCalldata = _publicInputCalldata;
      });

      it("should return true if group owner", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();

        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        const txn2 = await eventManager
          .connect(organizer)
          .createEventRecord(
            groupId,
            "event1",
            "event1 description",
            "2022-07-3O",
            100,
            false,
            publicInputCalldata[0],
            attributes
          );
        await txn2.wait();
        const txn3 = await eventManager
          .connect(organizer)
          .createEventRecord(
            groupId,
            "event1",
            "event1 description",
            "2022-07-3O",
            100,
            false,
            publicInputCalldata[0],
            attributes
          );
        await txn3.wait();
        const eventRecords = await eventManager.getEventRecordsByGroupId(
          groupId
        );
        expect(eventRecords.length).to.equal(2);
        const eventId = eventRecords[1].eventRecordId.toNumber(); // 2nd event id

        expect(
          await eventManager.hasCollaboratorAccessByEventId(
            organizer.address,
            eventId
          )
        ).to.equal(true);

        // check before grant
        expect(
          await eventManager.hasCollaboratorAccessByEventId(
            participant1.address,
            eventId
          )
        ).to.equal(false);
        expect(
          await eventManager.hasCollaboratorAccessByEventId(
            participant2.address,
            eventId
          )
        ).to.equal(false);

        // check after grant
        await eventManager.grantRole(groupId, participant1.address, ADMIN_ROLE);
        await eventManager.grantRole(
          groupId,
          participant2.address,
          COLLABORATOR_ROLE
        );
        expect(
          await eventManager.hasCollaboratorAccessByEventId(
            participant1.address,
            eventId
          )
        ).to.equal(true);
        expect(
          await eventManager.hasCollaboratorAccessByEventId(
            participant2.address,
            eventId
          )
        ).to.equal(true);
      });
    });

    describe("getMemberRoles", async () => {
      it("should return empty array if no assignee", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();

        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        const roles = await eventManager.getMemberRoles(groupId);
        expect(roles.length).to.equal(0);
      });

      it("should return one value", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();

        // other data
        const txn2 = await eventManager
          .connect(organizer)
          .createGroup("group2");
        await txn2.wait();

        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId1 = groups[0].groupId.toNumber();
        const groupId2 = groups[1].groupId.toNumber();

        // other data
        await eventManager
          .connect(organizer)
          .grantRole(groupId2, participant1.address, ADMIN_ROLE);

        await eventManager
          .connect(organizer)
          .grantRole(groupId1, organizer.address, ADMIN_ROLE);

        const roles1 = await eventManager.getMemberRoles(groupId1);
        expect(roles1.length).to.equal(1);
        expect(roles1[0].assignee).to.equal(organizer.address);
        expect(roles1[0].admin).to.equal(true);
        expect(roles1[0].collaborator).to.equal(false);

        await eventManager
          .connect(organizer)
          .grantRole(groupId1, organizer.address, COLLABORATOR_ROLE);

        const roles2 = await eventManager.getMemberRoles(groupId1);
        expect(roles2.length).to.equal(1);
        expect(roles2[0].assignee).to.equal(organizer.address);
        expect(roles2[0].admin).to.equal(true);
        expect(roles2[0].collaborator).to.equal(true);

        await eventManager
          .connect(organizer)
          .revokeRole(groupId1, organizer.address, ADMIN_ROLE);

        const roles3 = await eventManager.getMemberRoles(groupId1);
        expect(roles3.length).to.equal(1);
        expect(roles3[0].assignee).to.equal(organizer.address);
        expect(roles3[0].admin).to.equal(false);
        expect(roles3[0].collaborator).to.equal(true);

        await eventManager
          .connect(organizer)
          .revokeRole(groupId1, organizer.address, COLLABORATOR_ROLE);

        const roles = await eventManager.getMemberRoles(groupId1);
        expect(roles.length).to.equal(0);
      });

      it("should return multiple values", async () => {
        const txn1 = await eventManager
          .connect(organizer)
          .createGroup("group1");
        await txn1.wait();

        const groups = await eventManager.getOwnGroups(organizer.address);
        const groupId = groups[0].groupId.toNumber();

        await eventManager
          .connect(organizer)
          .grantRole(groupId, organizer.address, ADMIN_ROLE);
        await eventManager
          .connect(organizer)
          .grantRole(groupId, participant1.address, COLLABORATOR_ROLE);

        const roles = await eventManager.getMemberRoles(groupId);
        expect(roles.length).to.equal(2);
        expect(roles[0].assignee).to.equal(organizer.address);
        expect(roles[0].admin).to.equal(true);
        expect(roles[0].collaborator).to.equal(false);
        expect(roles[1].assignee).to.equal(participant1.address);
        expect(roles[1].admin).to.equal(false);
        expect(roles[1].collaborator).to.equal(true);
      });
    });
  });
});
