import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import {
  MintNFT,
  EventManager,
  SecretPhraseVerifier,
  OperationController,
  // eslint-disable-next-line node/no-missing-import
} from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// eslint-disable-next-line node/no-missing-import
import { generateProof, wrongProofCalldata } from "./helper/secret_phrase";
import { BigNumberish, BytesLike, Signer } from "ethers";

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
// deploy functions
/**
 * deploy secretPhraseVerifier
 * @returns deployed secretPhraseVerifier
 */
const deploySecretPhraseVerifier = async () => {
  const SecretPhraseVerifierFactory = await ethers.getContractFactory(
    "SecretPhraseVerifier"
  );
  return await SecretPhraseVerifierFactory.deploy();
};
/**
 * deploy operationController
 * @returns deployed operationController
 */
const deployOperationController = async () => {
  const OperationControllerFactory = await ethers.getContractFactory(
    "OperationController"
  );
  const deployedOperationController: any = await upgrades.deployProxy(
    OperationControllerFactory,
    { initializer: "initialize" }
  );
  return deployedOperationController.deployed();
};
/**
 * deploy mintNFT
 * @param secretPhraseVerifier
 * @param operationController
 * @returns deployed mintNFT
 */
const deployMintNFT = async (
  secretPhraseVerifier: SecretPhraseVerifier,
  operationController: OperationController
) => {
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
  return deployedMintNFT.deployed();
};
/**
 * deploy eventManager
 * @param relayer address
 * @param operationController
 * @returns deployed eventManager
 */
const deployEventManager = async (
  relayer: SignerWithAddress,
  operationController: OperationController
) => {
  const EventManager = await ethers.getContractFactory("EventManager");
  const deployedEventManager: any = await upgrades.deployProxy(
    EventManager,
    [relayer.address, 250000, 1000000, operationController.address],
    {
      initializer: "initialize",
    }
  );
  return deployedEventManager.deployed();
};
/**
 * deploy all contracts
 * @param relayer address
 * @returns deployed contracts array
 */
const deployAll = async (relayer: SignerWithAddress) => {
  const secretPhraseVerifier = await deploySecretPhraseVerifier();
  const operationController = await deployOperationController();
  const mintNFT = await deployMintNFT(
    secretPhraseVerifier,
    operationController
  );
  const eventManager = await deployEventManager(relayer, operationController);
  await mintNFT.setEventManagerAddr(eventManager.address);
  await eventManager.setMintNFTAddr(mintNFT.address);
  return [secretPhraseVerifier, mintNFT, eventManager, operationController];
};
type eventGroupParams = {
  groupId: BigNumberish;
  name: string;
  description: string;
  date: string;
  mintLimit: BigNumberish;
  useMtx: boolean;
  secretPhrase: BytesLike;
  eventNFTAttributes: {
    metaDataURL: string;
    requiredParticipateCount: BigNumberish;
  }[];
};
const createGroup = async (
  eventManager: EventManager,
  groupName: string,
  signer?: string | Signer
) => {
  const createGroupTxn = signer
    ? await eventManager.connect(signer).createGroup(groupName)
    : await eventManager.createGroup(groupName);
  await createGroupTxn.wait();
};

const createEventRecord = async (
  eventManager: EventManager,
  params: eventGroupParams,
  signer?: string | Signer
) => {
  const manager = signer ? await eventManager.connect(signer) : eventManager;
  const createEventTxn = await manager.createEventRecord(
    params.groupId,
    params.name,
    params.description,
    params.date,
    params.mintLimit,
    params.useMtx,
    params.secretPhrase,
    params.eventNFTAttributes
  );
  await createEventTxn.wait();
};

describe("MintNFT", function () {
  let mintNFT: MintNFT;
  let eventManager: EventManager;
  let operationController: OperationController;

  let createdGroupId: number;
  const createdEventIds: number[] = [];

  let organizer: SignerWithAddress;
  let participant1: SignerWithAddress;
  let relayer: SignerWithAddress;
  let participant2: SignerWithAddress;

  before(async () => {
    [organizer, participant1, relayer, participant2] =
      await ethers.getSigners();

    // generate proof
    const { publicInputCalldata } = await generateProof();
    // Deploy all contracts
    [, mintNFT, eventManager, operationController] = await deployAll(relayer);
    // Create a Group and an Event
    await createGroup(eventManager, "First Group");
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
      await operationController.pause();
      await expect(
        mintNFT
          .connect(participant1)
          .mintParticipateNFT(createdGroupId, createdEventIds[0], proofCalldata)
      ).to.be.reverted;
      await operationController.unpause();
    });
  });

  describe("burn", () => {
    it("success to burn", async () => {
      const { proofCalldata } = await generateProof();
      const mintNftTxn = await mintNFT
        .connect(participant2)
        .mintParticipateNFT(createdGroupId, createdEventIds[0], proofCalldata);
      await mintNftTxn.wait();

      expect(await mintNFT.balanceOf(participant2.address)).equal(1);

      const tokenId = await mintNFT.tokenOfOwnerByIndex(
        participant2.address,
        0
      );

      // participant2がorganizerにトークンの操作を承認
      await mintNFT.connect(participant2).approve(organizer.address, tokenId);

      // 承認後にburnを実行
      await mintNFT.connect(organizer).burn(tokenId);
      expect(await mintNFT.balanceOf(participant2.address)).equal(0);
    });
  });

  describe("get NFT holders of the event", () => {
    let mintNFT: MintNFT;
    let eventManager: EventManager;

    let createdGroupId1: number;
    let createdGroupId2: number;
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

      // Deploy all contracts
      [, mintNFT, eventManager] = await deployAll(relayer);

      // Create a Group and an Event
      await createGroup(eventManager, "First Group");
      await createGroup(eventManager, "Second Group");
      const groupsList = await eventManager.getGroups();
      createdGroupId1 = groupsList[0].groupId.toNumber();
      createdGroupId2 = groupsList[1].groupId.toNumber();

      await createEventRecord(eventManager, {
        groupId: createdGroupId1,
        name: "event1",
        description: "event1 description",
        date: "2022-07-3O",
        mintLimit: 10,
        useMtx: false,
        secretPhrase: publicInputCalldata[0],
        eventNFTAttributes: attributes,
      });
      const eventsList = await eventManager.getEventRecords(0, 0);
      createdEventIds.push(eventsList[0].eventRecordId.toNumber());
      await createEventRecord(eventManager, {
        groupId: createdGroupId1,
        name: "event2",
        description: "event2 description",
        date: "2022-07-3O",
        mintLimit: 10,
        useMtx: false,
        secretPhrase: publicInputCalldata[0],
        eventNFTAttributes: attributes,
      });
      const eventsList2 = await eventManager.getEventRecords(0, 0);
      createdEventIds.push(eventsList2[0].eventRecordId.toNumber());
      await createEventRecord(eventManager, {
        groupId: createdGroupId2,
        name: "event3",
        description: "event3 description",
        date: "2022-07-3O",
        mintLimit: 10,
        useMtx: false,
        secretPhrase: publicInputCalldata[0],
        eventNFTAttributes: attributes,
      });
      const eventsList3 = await eventManager.getEventRecords(0, 0);
      createdEventIds.push(eventsList3[0].eventRecordId.toNumber());
    });

    describe("mint NFT", () => {
      it("mint three times", async () => {
        const { proofCalldata } = await generateProof();
        const mintNftTxn = await mintNFT
          .connect(organizer)
          .mintParticipateNFT(
            createdGroupId1,
            createdEventIds[0],
            proofCalldata
          );
        await mintNftTxn.wait();
        const { proofCalldata: proofCalldata2 } = await generateProof();
        const mintNftTxn2 = await mintNFT
          .connect(participant1)
          .mintParticipateNFT(
            createdGroupId1,
            createdEventIds[0],
            proofCalldata2
          );
        await mintNftTxn2.wait();
        const { proofCalldata: proofCalldata3 } = await generateProof();
        const mintNftTxn3 = await mintNFT
          .connect(participant2)
          .mintParticipateNFT(
            createdGroupId1,
            createdEventIds[0],
            proofCalldata3
          );
        await mintNftTxn3.wait();
        const { proofCalldata: proofCalldata4 } = await generateProof();
        const mintNftTxn4 = await mintNFT
          .connect(participant1)
          .mintParticipateNFT(
            createdGroupId1,
            createdEventIds[1],
            proofCalldata4
          );
        await mintNftTxn4.wait();
        const { proofCalldata: proofCalldata5 } = await generateProof();
        const mintNftTxn5 = await mintNFT
          .connect(participant1)
          .mintParticipateNFT(
            createdGroupId2,
            createdEventIds[2],
            proofCalldata5
          );
        await mintNftTxn5.wait();
      });
      it("get owners of the tokens", async () => {
        const tokens = [0, 1, 2, 3, 4];
        const owners = await mintNFT.ownerOfTokens(tokens);
        expect(owners.length).equal(5);
        expect(owners[0].holderAddress).equal(organizer.address);
        expect(owners[1].holderAddress).equal(participant1.address);
        expect(owners[2].holderAddress).equal(participant2.address);
        expect(owners[3].holderAddress).equal(participant1.address);
        expect(owners[4].holderAddress).equal(participant1.address);
      });
      it("get NFT holders of the event", async () => {
        const nftholders = await mintNFT.getNFTHoldersByEvent(
          createdEventIds[0]
        );
        expect(nftholders.length).equal(3);
        expect(nftholders[0].holderAddress).equal(organizer.address);
        expect(nftholders[1].holderAddress).equal(participant1.address);
        expect(nftholders[2].holderAddress).equal(participant2.address);
        expect(Number(nftholders[0].tokenId)).equal(0);
        expect(Number(nftholders[1].tokenId)).equal(1);
        expect(Number(nftholders[2].tokenId)).equal(2);
      });
      it("get NFT holders of the event group", async () => {
        const nftholders = await mintNFT.getNFTHoldersByEventGroup(
          createdGroupId1
        );
        expect(nftholders.length).equal(4);
        // EventGroup は降順、TokenID は昇順で帰ってくる
        expect(nftholders[0].holderAddress).equal(participant1.address);
        expect(nftholders[1].holderAddress).equal(organizer.address);
        expect(nftholders[2].holderAddress).equal(participant1.address);
        expect(nftholders[3].holderAddress).equal(participant2.address);
        expect(Number(nftholders[0].tokenId)).equal(3);
        expect(Number(nftholders[1].tokenId)).equal(0);
        expect(Number(nftholders[2].tokenId)).equal(1);
        expect(Number(nftholders[3].tokenId)).equal(2);
        expect(Number(nftholders[0].eventId)).equal(2);
        expect(Number(nftholders[1].eventId)).equal(1);
        expect(Number(nftholders[2].eventId)).equal(1);
        expect(Number(nftholders[3].eventId)).equal(1);
      });
    });
  });

  describe("getNFTAttributeRecordsByEventId", () => {
    it("should revert if limit is over 100", async () => {
      await expect(
        mintNFT.connect(organizer).getNFTAttributeRecordsByEventId(1, 101, 0)
      ).to.be.revertedWith("limit is too large");
    });

    it("should revert if limit + offset is over flow", async () => {
      await expect(
        mintNFT
          .connect(organizer)
          .getNFTAttributeRecordsByEventId(1, 100, ethers.constants.MaxUint256)
      ).to.be.revertedWith("limit + offset must be <= 2^256 - 1");
    });

    it("get NFTAttributeRecords by event id", async () => {
      const nftAttributeRecords = await mintNFT
        .connect(organizer)
        .getNFTAttributeRecordsByEventId(1, 100, 0);
      expect(nftAttributeRecords.length).equal(attributes.length);
      expect(nftAttributeRecords[0].metaDataURL).equal(
        attributes[0].metaDataURL
      );
      expect(nftAttributeRecords[1].metaDataURL).equal(
        attributes[1].metaDataURL
      );
      expect(nftAttributeRecords[2].metaDataURL).equal(
        attributes[2].metaDataURL
      );
      expect(nftAttributeRecords[0].requiredParticipateCount).equal(
        attributes[0].requiredParticipateCount
      );
      expect(nftAttributeRecords[1].requiredParticipateCount).equal(
        attributes[1].requiredParticipateCount
      );
      expect(nftAttributeRecords[2].requiredParticipateCount).equal(
        attributes[2].requiredParticipateCount
      );
    });

    it("get NFTAttributeRecords with limit", async () => {
      const nftAttributeRecords = await mintNFT
        .connect(organizer)
        .getNFTAttributeRecordsByEventId(
          1,
          attributes[2].requiredParticipateCount,
          0
        );
      expect(nftAttributeRecords.length).equal(2);
      expect(nftAttributeRecords[0].metaDataURL).equal(
        attributes[0].metaDataURL
      );
      expect(nftAttributeRecords[1].metaDataURL).equal(
        attributes[1].metaDataURL
      );
      expect(nftAttributeRecords[0].requiredParticipateCount).equal(
        attributes[0].requiredParticipateCount
      );
      expect(nftAttributeRecords[1].requiredParticipateCount).equal(
        attributes[1].requiredParticipateCount
      );
    });

    it("get NFTAttributeRecords with limit and offset", async () => {
      const nftAttributeRecords = await mintNFT
        .connect(organizer)
        .getNFTAttributeRecordsByEventId(
          1,
          attributes[2].requiredParticipateCount + 1,
          attributes[1].requiredParticipateCount
        );
      expect(nftAttributeRecords.length).equal(2);
      expect(nftAttributeRecords[0].metaDataURL).equal(
        attributes[1].metaDataURL
      );
      expect(nftAttributeRecords[1].metaDataURL).equal(
        attributes[2].metaDataURL
      );
      expect(nftAttributeRecords[0].requiredParticipateCount).equal(
        attributes[1].requiredParticipateCount
      );
      expect(nftAttributeRecords[1].requiredParticipateCount).equal(
        attributes[2].requiredParticipateCount
      );
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

  let usedProofCalldata!: any;

  before(async () => {
    [organizer, participant1, participant2, relayer] =
      await ethers.getSigners();

    // generate proof
    const { publicInputCalldata } = await generateProof();

    [, mintNFT, eventManager] = await deployAll(relayer);

    // Create a Group and an Event
    await createGroup(eventManager, "First Group");
    const groupsList = await eventManager.getGroups();
    createdGroupId = groupsList[0].groupId.toNumber();
    await createEventRecord(eventManager, {
      groupId: createdGroupId,
      name: "event1",
      description: "event1 description",
      date: "2022-07-3O",
      mintLimit: 10,
      useMtx: false,
      secretPhrase: publicInputCalldata[0],
      eventNFTAttributes: attributes,
    });
    await createEventRecord(eventManager, {
      groupId: createdGroupId,
      name: "event2",
      description: "event2 description",
      date: "2022-07-3O",
      mintLimit: 1,
      useMtx: false,
      secretPhrase: publicInputCalldata[0],
      eventNFTAttributes: attributes,
    });

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
  let operationController: OperationController;

  let createdGroupId: number;
  const createdEventIds: number[] = [];

  let organizer: SignerWithAddress;
  let participant1: SignerWithAddress;
  let relayer: SignerWithAddress;

  before(async () => {
    [organizer, participant1, relayer] = await ethers.getSigners();
    [, mintNFT, eventManager, operationController] = await deployAll(relayer);

    // Create a Group and an Event
    await createGroup(eventManager, "First Group", organizer);
    const groupsList = await eventManager.getGroups();
    createdGroupId = groupsList[0].groupId.toNumber();
    await createEventRecord(
      eventManager,
      {
        groupId: createdGroupId,
        name: "event1",
        description: "event1 description",
        date: "2022-07-3O",
        mintLimit: 10,
        useMtx: false,
        secretPhrase:
          "0x10c7da1d87ac3a86d34053a76768cc39c581d469b68863a9fba17bcdaa048f98",
        eventNFTAttributes: attributes,
      },
      organizer
    );
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
    await operationController.connect(organizer).pause();
    await expect(mintNFT.connect(organizer).changeMintLocked(1, false)).to.be
      .reverted;
    await operationController.connect(organizer).unpause();
  });
});

describe("reset secret phrase", () => {
  let mintNFT: MintNFT;
  let eventManager: EventManager;
  let operationController: OperationController;

  let createdGroupId: number;
  const createdEventIds: number[] = [];

  let organizer: SignerWithAddress;
  let participant1: SignerWithAddress;
  let relayer: SignerWithAddress;

  let correctProofCalldata!: any;

  before(async () => {
    [organizer, participant1, relayer] = await ethers.getSigners();
    // deploy all contracts
    [, mintNFT, eventManager, operationController] = await deployAll(relayer);
    // generate proof
    const { publicInputCalldata } = await generateProof();
    correctProofCalldata = publicInputCalldata[0];

    // Create a Group and an Event
    await createGroup(eventManager, "First Group", organizer);
    const groupsList = await eventManager.getGroups();
    createdGroupId = groupsList[0].groupId.toNumber();
    await createEventRecord(
      eventManager,
      {
        groupId: createdGroupId,
        name: "event1",
        description: "event1 description",
        date: "2022-07-3O",
        mintLimit: 10,
        useMtx: false,
        secretPhrase: correctProofCalldata,
        eventNFTAttributes: attributes,
      },
      organizer
    );
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
    await operationController.connect(organizer).pause();
    await expect(
      mintNFT.connect(organizer).resetSecretPhrase(1, newProofCalldata)
    ).to.be.reverted;
    await operationController.connect(organizer).unpause();
  });
});

describe("setEventInfo", () => {});
