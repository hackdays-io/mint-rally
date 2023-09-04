import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { MintNFT, EventManager, SecretPhraseVerifier } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { generateProof, wrongProofCalldata } from "./helper/secret_phrase";

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
  let secretPhraseVerifier: SecretPhraseVerifier;

  let createdGroupId: number;
  const createdEventIds: number[] = [];

  let organizer: SignerWithAddress;
  let participant1: SignerWithAddress;
  let participant2: SignerWithAddress;
  let relayer: SignerWithAddress;

  before(async () => {
    [organizer, participant1, participant2, relayer] =
      await ethers.getSigners();

    // generate proof
    const { publicInputCalldata } = await generateProof();

    // Deploy secret phrase verifier
    const SecretPhraseVerifierFactory = await ethers.getContractFactory(
      "SecretPhraseVerifier"
    );
    secretPhraseVerifier = await SecretPhraseVerifierFactory.deploy();
    // Deploy mintNFT and eventManager
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

    // Create a Group and an Event
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
      publicInputCalldata[0],
      attributes
    );
    await createEventTxn.wait();
    const eventsList = await eventManager.getEventRecords(0, 0);
    createdEventIds.push(eventsList[0].eventRecordId.toNumber());
  });

  describe("mint NFT", () => {
    it("success to mint", async () => {
      const { proofCalldata } = await generateProof();
      const mintNftTxn = await mintNFT
        .connect(organizer)
        .mintParticipateNFT(createdGroupId, createdEventIds[0], proofCalldata);
      await mintNftTxn.wait();

      const nftAttribute = await mintNFT.tokenURI(0);
      expect(nftAttribute).equal("ipfs://hogehoge/count0.json");
    });

    it("fail to mint when event MintLocked", async () => {
      const { proofCalldata } = await generateProof();
      await mintNFT
        .connect(organizer)
        .changeMintLocked(createdEventIds[0], true);
      await expect(
        mintNFT
          .connect(participant1)
          .mintParticipateNFT(createdGroupId, createdEventIds[0], proofCalldata)
      ).to.be.revertedWith("mint is locked");
      await mintNFT
        .connect(organizer)
        .changeMintLocked(createdEventIds[0], false);
    });

    it("fail to mint when paused", async () => {
      const { proofCalldata } = await generateProof();
      await mintNFT.connect(organizer).pause();
      await expect(
        mintNFT
          .connect(participant1)
          .mintParticipateNFT(createdGroupId, createdEventIds[0], proofCalldata)
      ).to.be.revertedWith("Pausable: paused");
      await mintNFT.connect(organizer).unpause();
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

  describe("burn", () => {
    it("success to burn", async () => {
      const { proofCalldata } = await generateProof();
      const mintNftTxn = await mintNFT
        .connect(participant1)
        .mintParticipateNFT(createdGroupId, createdEventIds[0], proofCalldata);
      await mintNftTxn.wait();

      expect(await mintNFT.balanceOf(organizer.address)).equal(1);

      // revert if paused
      await mintNFT.connect(organizer).pause();
      await expect(mintNFT.connect(organizer).burn(0)).to.be.revertedWith(
        "Pausable: paused"
      );
      await mintNFT.connect(organizer).unpause();

      await mintNFT.connect(organizer).burn(0);
      expect(await mintNFT.balanceOf(organizer.address)).equal(0);
    });
  });
});

describe("nft revolution", () => {
  let mintNFT: MintNFT;
  let eventManager: EventManager;
  let secretPhraseVerifier: SecretPhraseVerifier;

  let createdGroupId: number;
  let createdEventIds: number[] = [];

  let organizer: SignerWithAddress;
  let participant1: SignerWithAddress;
  let participant2: SignerWithAddress;
  let relayer: SignerWithAddress;

  let usedProofCalldata!: any;

  before(async () => {
    [organizer, participant1, participant2, relayer] =
      await ethers.getSigners();

    // generate proof
    const { publicInputCalldata } = await generateProof();

    // Deploy secret phrase verifier
    const SecretPhraseVerifierFactory = await ethers.getContractFactory(
      "SecretPhraseVerifier"
    );
    secretPhraseVerifier = await SecretPhraseVerifierFactory.deploy();
    // Deploy mintNFT and eventManager
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

    // Create a Group and an Event
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
      publicInputCalldata[0],
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
      publicInputCalldata[0],
      attributes
    );
    await createEventTxn2.wait();

    const eventsList = await eventManager.getEventRecords(0, 0);
    createdEventIds = eventsList.map((event) => event.eventRecordId.toNumber());

    const { proofCalldata: proofCalldata1 } = await generateProof();
    const mintTxn1 = await mintNFT
      .connect(organizer)
      .mintParticipateNFT(createdGroupId, createdEventIds[1], proofCalldata1);
    await mintTxn1.wait();
    usedProofCalldata = proofCalldata1;

    const { proofCalldata: proofCalldata2 } = await generateProof();
    const mintTxn2 = await mintNFT
      .connect(organizer)
      .mintParticipateNFT(createdGroupId, createdEventIds[0], proofCalldata2);
    await mintTxn2.wait();
  });

  it("doesn't mint NFT if proof is already used", async () => {
    await expect(
      mintNFT
        .connect(organizer)
        .mintParticipateNFT(
          createdGroupId,
          createdEventIds[1],
          usedProofCalldata
        )
    ).to.be.revertedWith("invalid secret phrase");
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
        createdEventIds[1]
      )
    ).equal(true);
    const { proofCalldata } = await generateProof();
    await expect(
      mintNFT
        .connect(organizer)
        .mintParticipateNFT(createdGroupId, createdEventIds[1], proofCalldata)
    ).to.be.revertedWith("already minted");
  });

  it("doesn't mint NFT if there are no remaining count", async () => {
    const { proofCalldata } = await generateProof();
    await expect(
      mintNFT
        .connect(participant1)
        .mintParticipateNFT(createdGroupId, createdEventIds[0], proofCalldata)
    ).to.be.revertedWith("remaining count is zero");
  });

  it("doesn't mint NFT if wrong secret phrase", async () => {
    await expect(
      mintNFT
        .connect(participant2)
        .mintParticipateNFT(
          createdGroupId,
          createdEventIds[0],
          wrongProofCalldata
        )
    ).to.be.revertedWith("invalid secret phrase");
  });
});

describe("mint locked flag", () => {
  let mintNFT: MintNFT;
  let eventManager: EventManager;
  let secretPhraseVerifier: SecretPhraseVerifier;

  let createdGroupId: number;
  const createdEventIds: number[] = [];

  let organizer: SignerWithAddress;
  let participant1: SignerWithAddress;
  let relayer: SignerWithAddress;

  before(async () => {
    [organizer, participant1, relayer] = await ethers.getSigners();
    // Deploy secretPhraseVerifier
    const SecretPhraseVerifierFactory = await ethers.getContractFactory(
      "SecretPhraseVerifier"
    );
    secretPhraseVerifier = await SecretPhraseVerifierFactory.deploy();
    // Deploy mintNFT and eventManager
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

    // Create a Group and an Event
    const createGroupTxn = await eventManager
      .connect(organizer)
      .createGroup("First Group");
    await createGroupTxn.wait();
    const groupsList = await eventManager.getGroups();
    createdGroupId = groupsList[0].groupId.toNumber();
    const createEventTxn = await eventManager
      .connect(organizer)
      .createEventRecord(
        createdGroupId,
        "event1",
        "event1 description",
        "2022-07-3O",
        10,
        false,
        "0x10c7da1d87ac3a86d34053a76768cc39c581d469b68863a9fba17bcdaa048f98",
        attributes
      );
    await createEventTxn.wait();
    const eventsList = await eventManager.getEventRecords(0, 0);
    createdEventIds.push(eventsList[0].eventRecordId.toNumber());
  });

  it("should get mintable flag", async () => {
    const flag = await mintNFT.connect(organizer).getIsMintLocked(1);
    expect(flag).equal(false);
  });

  it("should change mintable flag by owner", async () => {
    await mintNFT.connect(organizer).changeMintLocked(1, true);
    const flag = await mintNFT.connect(organizer).getIsMintLocked(1);
    expect(flag).equal(true);
  });

  it("No one but the owner should be able to change mintable flag", async () => {
    await expect(
      mintNFT.connect(participant1).changeMintLocked(1, false)
    ).to.be.revertedWith("you are not event group owner");
  });

  it("should not change if paused", async () => {
    await mintNFT.connect(organizer).pause();
    await expect(
      mintNFT.connect(organizer).changeMintLocked(1, false)
    ).to.be.revertedWith("Pausable: paused");
    await mintNFT.connect(organizer).unpause();
  });
});

describe("reset secret phrase", () => {
  let mintNFT: MintNFT;
  let eventManager: EventManager;
  let secretPhraseVerifier: SecretPhraseVerifier;

  let createdGroupId: number;
  const createdEventIds: number[] = [];

  let organizer: SignerWithAddress;
  let participant1: SignerWithAddress;
  let relayer: SignerWithAddress;

  let correctProofCalldata!: any;

  before(async () => {
    [organizer, participant1, relayer] = await ethers.getSigners();
    // Deploy secretPhraseVerifier
    const SecretPhraseVerifierFactory = await ethers.getContractFactory(
      "SecretPhraseVerifier"
    );
    secretPhraseVerifier = await SecretPhraseVerifierFactory.deploy();
    // Deploy mintNFT and eventManager
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

    // generate proof
    const { publicInputCalldata } = await generateProof();
    correctProofCalldata = publicInputCalldata[0];

    // Create a Group and an Event
    const createGroupTxn = await eventManager
      .connect(organizer)
      .createGroup("First Group");
    await createGroupTxn.wait();
    const groupsList = await eventManager.getGroups();
    createdGroupId = groupsList[0].groupId.toNumber();
    const createEventTxn = await eventManager
      .connect(organizer)
      .createEventRecord(
        createdGroupId,
        "event1",
        "event1 description",
        "2022-07-3O",
        10,
        false,
        correctProofCalldata,
        attributes
      );
    await createEventTxn.wait();
    const eventsList = await eventManager.getEventRecords(0, 0);
    createdEventIds.push(eventsList[0].eventRecordId.toNumber());
  });

  it("should reset secret phrase", async () => {
    const newProofCalldata =
      "0x1f376ca3150d51a164c711287cff6e77e2127d635a1534b41d5624472f000000";
    await expect(
      mintNFT.connect(organizer).resetSecretPhrase(1, newProofCalldata)
    ).to.emit(mintNFT, "ResetSecretPhrase");
  });

  it("cannot change by non-owner", async () => {
    const newProofCalldata =
      "0x1f376ca3150d51a164c711287cff6e77e2127d635a1534b41d5624472f000000";
    await expect(
      mintNFT.connect(participant1).resetSecretPhrase(1, newProofCalldata)
    ).to.be.revertedWith("you are not event group owner");
  });

  it("cannot change if paused", async () => {
    const newProofCalldata =
      "0x1f376ca3150d51a164c711287cff6e77e2127d635a1534b41d5624472f000000";
    await mintNFT.connect(organizer).pause();
    await expect(
      mintNFT.connect(organizer).resetSecretPhrase(1, newProofCalldata)
    ).to.be.revertedWith("Pausable: paused");
    await mintNFT.connect(organizer).unpause();
  });
});

describe("Pause and Unpause", () => {
  let mintNFT: MintNFT;
  let eventManager: EventManager;
  let secretPhraseVerifier: SecretPhraseVerifier;

  let createdGroupId: number;
  const createdEventIds: number[] = [];

  let organizer: SignerWithAddress;
  let participant1: SignerWithAddress;
  let relayer: SignerWithAddress;

  let correctProofCalldata!: any;

  before(async () => {
    [organizer, participant1, relayer] = await ethers.getSigners();
    // Deploy secretPhraseVerifier
    const SecretPhraseVerifierFactory = await ethers.getContractFactory(
      "SecretPhraseVerifier"
    );
    secretPhraseVerifier = await SecretPhraseVerifierFactory.deploy();
    // Deploy mintNFT and eventManager
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

    // generate proof
    const { publicInputCalldata } = await generateProof();
    correctProofCalldata = publicInputCalldata[0];

    // Create a Group and an Event
    const createGroupTxn = await eventManager
      .connect(organizer)
      .createGroup("First Group");
    await createGroupTxn.wait();
    const groupsList = await eventManager.getGroups();
    createdGroupId = groupsList[0].groupId.toNumber();
    const createEventTxn = await eventManager
      .connect(organizer)
      .createEventRecord(
        createdGroupId,
        "event1",
        "event1 description",
        "2022-07-3O",
        10,
        false,
        correctProofCalldata,
        attributes
      );
    await createEventTxn.wait();
    const eventsList = await eventManager.getEventRecords();
    createdEventIds.push(eventsList[0].eventRecordId.toNumber());
  });

  it("should pause and unpause", async () => {
    expect(await eventManager.paused()).to.equal(false);

    await eventManager.connect(organizer).pause();
    expect(await eventManager.paused()).to.equal(true);

    await eventManager.connect(organizer).unpause();
    expect(await eventManager.paused()).to.equal(false);
  });

  it("should not pause if not owner", async () => {
    await expect(eventManager.connect(participant1).pause()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("should not unpause if not owner", async () => {
    await expect(
      eventManager.connect(participant1).unpause()
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
