// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, upgrades } from "hardhat";
// import { MintNFT, EventManager } from "../typechain";

async function main() {
  // FIXME can't use types cause deployProxy return "Contract" type. it's different from below types.
  // let mintNFT: MintNFT;
  // let eventManager: EventManager;

  const MintNFTV2 = await ethers.getContractFactory("MintNFTV2");
  // mintNFT = await MintNFT.deploy();
  const mintNFT2 = await upgrades.upgradeProxy(
    "0x9E545E3C0baAB3E08CdfD552C960A1050f373042", // previous contract address
    MintNFTV2
  );
  await mintNFT2.deployed();

  const EventManager2 = await ethers.getContractFactory("EventManagerV2");
  // eventManager = await EventManager.deploy();
  const eventManager2 = await upgrades.upgradeProxy(
    "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9", // previous contract address
    EventManager2
  );
  await eventManager2.deployed();

  await mintNFT2.setEventManagerAddr(eventManager2.address);
  await eventManager2.setMintNFTAddr(mintNFT2.address);

  console.log("mintNFTV2 address:", mintNFT2.address);
  console.log("eventManagerV2 address:", eventManager2.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
