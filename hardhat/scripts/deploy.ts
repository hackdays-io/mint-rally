// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { MintNFT, EventManager } from "../typechain";

async function main() {
  let mintNFT: MintNFT;
  let eventManager: EventManager;
  const MintNFT = await ethers.getContractFactory("MintNFT");
  mintNFT = await MintNFT.deploy();
  await mintNFT.deployed();
  const EventManager = await ethers.getContractFactory("EventManager");
  eventManager = await EventManager.deploy(mintNFT.address);
  await eventManager.deployed();
  mintNFT.setEventManagerAddr(eventManager.address);

  console.log("mintNFT address:", mintNFT.address);
  console.log("eventManager address:", eventManager.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
