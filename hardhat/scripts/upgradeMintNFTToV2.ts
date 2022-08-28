import { ethers, upgrades } from "hardhat";

async function main() {
  const MintNFTV2 = await ethers.getContractFactory("MintNFTV2");
  const mintNFTV2 = await upgrades.upgradeProxy("xxxxx", MintNFTV2);
  await mintNFTV2.deployed();

  console.log("minNFTV2 address:", mintNFTV2.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
