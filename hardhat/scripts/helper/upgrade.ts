import { ethers, network, upgrades } from "hardhat";
import { MintNFT } from "../../typechain";

export const upgradeMintNFT = async (params?: any[]) => {
  let contractAddress = "";
  switch (network.name) {
    case "mumbai":
      contractAddress = process.env.MUMBAI_MINTNFT_ADDRESS!;
      break;
    case "polygon":
      contractAddress = process.env.POLYGON_MINTNFT_ADDRESS!;
      break;
    case "local":
      contractAddress = process.env.LOCAL_MINTNFT_ADDRESS!;
      break;
    default:
      break;
  }

  const MintNFTFactory = await ethers.getContractFactory("MintNFT");
  const deployedMintNFT: MintNFT = (await upgrades.upgradeProxy(
    contractAddress,
    MintNFTFactory,
    params && {
      call: {
        fn: "initialize",
        args: params,
      },
    }
  )) as any;

  await deployedMintNFT.deployed();

  console.log("mintNFT address:", deployedMintNFT.address);

  return deployedMintNFT;
};

export const upgradeEventManager = async (params?: any[]) => {
  let contractAddress = "";
  switch (network.name) {
    case "mumbai":
      contractAddress = process.env.MUMBAI_EVENTMANAGER_ADDRESS!;
      break;
    case "polygon":
      contractAddress = process.env.POLYGON_EVENTMANAGER_ADDRESS!;
      break;
    case "local":
      contractAddress = process.env.LOCAL_EVENTMANAGER_ADDRESS!;
      break;
    default:
      break;
  }

  const EventManagerFactory = await ethers.getContractFactory("EventManager");
  const deployedEventManager: any = await upgrades.upgradeProxy(
    contractAddress,
    EventManagerFactory,
    params && {
      call: {
        fn: "initialize",
        args: params,
      },
    }
  );
  await deployedEventManager.deployed();

  console.log("eventManager address:", deployedEventManager.address);

  return deployedEventManager;
};

export const upgradeOperationController = async (params?: any[]) => {
  let contractAddress = "";
  switch (network.name) {
    case "mumbai":
      contractAddress = process.env.MUMBAI_OPERATION_CONTROLLER_ADDRESS!;
      break;
    case "polygon":
      contractAddress = process.env.POLYGON_OPERATION_CONTROLLER_ADDRESS!;
      break;
    default:
      break;
  }

  const OperationControllerFactory = await ethers.getContractFactory(
    "OperationController"
  );
  const deployedOperationController: any = await upgrades.upgradeProxy(
    contractAddress,
    OperationControllerFactory,
    params && {
      call: {
        fn: "initialize",
        args: params,
      },
    }
  );
  await deployedOperationController.deployed();

  console.log(
    "operationController address:",
    deployedOperationController.address
  );

  return deployedOperationController;
};
