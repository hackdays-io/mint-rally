import { ethers, upgrades } from "hardhat";

async function main() {
  const MinimalForwarder = await ethers.getContractFactory("MinimalForwarder");
  const minimalForwarder = await MinimalForwarder.deploy();

  const MintNFTV2 = await ethers.getContractFactory("MintNFTV2");
  // TODO: set forwarder address
  const mintNFTV2 = await upgrades.upgradeProxy("xxxxx", MintNFTV2);
  await mintNFTV2.deployed();

  console.log("minimalForwarder:", minimalForwarder.address);
  console.log("minNFTV2 address:", mintNFTV2.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
