import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import {
  EventManager,
  MintNFT,
  MintRallyForwarder,
  OperationController,
  SecretPhraseVerifier,
} from "../typechain";
import { generateProof } from "./helper/secret_phrase";
import { signMetaTxRequest } from "./helper/signfor_mtx";

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

describe("MTX Event", function () {
  let mintNFT: MintNFT;
  let secretPhraseVerifier: SecretPhraseVerifier;
  let operationController: OperationController;
  let eventManager: EventManager;
  let mintRallyForwarder: MintRallyForwarder;
  let organizer: SignerWithAddress;
  let participant1: SignerWithAddress;
  let relayer: SignerWithAddress;

  before(async () => {
    [organizer, participant1, relayer] = await ethers.getSigners();
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

    const forwarderFactory = await ethers.getContractFactory(
      "MintRallyForwarder"
    );
    mintRallyForwarder = await forwarderFactory.deploy();
    await mintRallyForwarder.deployed();

    const MintNFTFactory = await ethers.getContractFactory("MintNFT");
    const deployedMintNFT: any = await upgrades.deployProxy(
      MintNFTFactory,
      [
        organizer.address,
        mintRallyForwarder.address,
        secretPhraseVerifier.address,
        operationController.address,
      ],
      {
        initializer: "initialize",
      }
    );
    mintNFT = deployedMintNFT;
    await mintNFT.deployed();

    const eventManagerContractFactory = await ethers.getContractFactory(
      "EventManager"
    );
    eventManager = (await upgrades.deployProxy(
      eventManagerContractFactory,
      [
        organizer.address,
        mintRallyForwarder.address,
        relayer.address,
        250000,
        1000000,
        operationController.address,
      ],
      {
        initializer: "initialize",
      }
    )) as EventManager;
    await eventManager.deployed();

    await eventManager.setMintNFTAddr(mintNFT.address);
    await mintNFT.setEventManagerAddr(eventManager.address);
  });

  it("should create group with mtx", async function () {
    const { signature, request } = await signMetaTxRequest(
      organizer,
      mintRallyForwarder,
      {
        from: organizer.address,
        to: eventManager.address,
        data: eventManager.interface.encodeFunctionData("createGroup", [
          "mtx group name",
        ]),
      }
    );

    const tx = await mintRallyForwarder
      .connect(relayer)
      .execute(request, signature);
    await tx.wait();

    const groups = await eventManager.getGroups();
    expect(groups.length).to.equal(1);
  });

  it("should create event with mtx", async function () {
    const { publicInputCalldata } = await generateProof();

    const { signature, request } = await signMetaTxRequest(
      organizer,
      mintRallyForwarder,
      {
        from: organizer.address,
        to: eventManager.address,
        data: eventManager.interface.encodeFunctionData("createEventRecord", [
          1,
          "mtx event name",
          "mtx event description",
          "2022-07-30",
          100,
          0,
          false,
          false,
          false,
          publicInputCalldata[0],
          attributes,
        ]),
      }
    );

    const tx = await mintRallyForwarder
      .connect(relayer)
      .execute(request, signature);
    await tx.wait();

    const events = await eventManager.getEventRecords(100, 0);
    expect(events.length).to.equal(1);
  });
});
