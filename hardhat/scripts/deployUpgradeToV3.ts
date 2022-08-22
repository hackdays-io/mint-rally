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

  const MintNFTV3 = await ethers.getContractFactory("MintNFTV3");
  // mintNFT = await MintNFT.deploy();
  const mintNFT3 = await upgrades.upgradeProxy(
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", // previous contract address
    MintNFTV3
  );
  await mintNFT3.deployed();

  console.log("mintNFTV2 address:", mintNFT3.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
