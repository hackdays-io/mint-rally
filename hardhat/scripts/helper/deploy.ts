import { ethers, network, upgrades } from "hardhat";
import {
  EventManager,
  MintNFT,
  MintPoint,
  OperationController,
} from "../../typechain";

export const deployMintNFT = async (params: {
  ownerAddress: string;
  forwarderAddress: string;
  secretPhraseVerifierAddress: string;
  operationControllerAddress: string;
}) => {
  const mintNFT = await ethers.getContractFactory("MintNFT");
  const deployedMintNFT: MintNFT = (await upgrades.deployProxy(
    mintNFT,
    [
      params.ownerAddress,
      params.forwarderAddress,
      params.secretPhraseVerifierAddress,
      params.operationControllerAddress,
    ],
    {
      initializer: "initialize",
    }
  )) as any;
  await deployedMintNFT.deployed();

  console.log("mintNFT address:", deployedMintNFT.address);

  return deployedMintNFT;
};

export const deployEventManager = async (params: {
  ownerAddress: string;
  mtxPrice: number;
  maxMintLimit: number;
  operationControllerAddress: string;
}) => {
  let relayerAddress = "";
  switch (network.name) {
    case "mumbai":
      relayerAddress = process.env.MUMBAI_RELAYER_ADDRESS!;
      break;
    case "polygon":
      relayerAddress = process.env.POLYGON_RELAYER_ADDRESS!;
      break;
    case "local":
      relayerAddress = process.env.LOCAL_RELAYER_ADDRESS!;
      break;
    default:
      break;
  }

  const eventManager = await ethers.getContractFactory("EventManager");
  const deployedEventManager: EventManager = (await upgrades.deployProxy(
    eventManager,
    [
      params.ownerAddress,
      relayerAddress,
      params.mtxPrice,
      params.maxMintLimit,
      params.operationControllerAddress,
    ],
    {
      initializer: "initialize",
    }
  )) as any;
  await deployedEventManager.deployed();

  console.log("eventManager address:", deployedEventManager.address);

  return deployedEventManager;
};

export const deployOperationController = async () => {
  const operationController = await ethers.getContractFactory(
    "OperationController"
  );
  const deployedOperationController: OperationController =
    (await upgrades.deployProxy(operationController, [], {
      initializer: "initialize",
    })) as any;
  await deployedOperationController.deployed();

  console.log(
    "operationController address:",
    deployedOperationController.address
  );

  return deployedOperationController;
};

export const deploySecretPhraseVerifier = async () => {
  const secretPhraseVerifier = await ethers.getContractFactory(
    "SecretPhraseVerifier"
  );
  const deployedSecretPhraseVerifier = await secretPhraseVerifier.deploy();
  await deployedSecretPhraseVerifier.deployed();

  console.log(
    "secretPhraseVerifier address:",
    deployedSecretPhraseVerifier.address
  );

  return deployedSecretPhraseVerifier;
};

export const deployForwarder = async () => {
  const forwarder = await ethers.getContractFactory("MintRallyForwarder");
  const deployedForwarder = await forwarder.deploy();
  await deployedForwarder.deployed();

  console.log("forwarder address:", deployedForwarder.address);

  return deployedForwarder;
};

export const deployMintPoint = async () => {
  const mintPoint = await ethers.getContractFactory("MintPoint");
  const deployedMintPoint: MintPoint = (await upgrades.deployProxy(
    mintPoint,
    [],
    {
      initializer: "initialize",
    }
  )) as any;
  await deployedMintPoint.deployed();

  console.log("mintPoint address:", deployedMintPoint.address);

  return deployedMintPoint;
};
