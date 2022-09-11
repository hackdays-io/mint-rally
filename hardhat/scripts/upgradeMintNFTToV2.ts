import { ethers, upgrades } from "hardhat";

async function main() {
  // FIXME: なんかHardhatError: HH700: Artifact for contract "MinimalForwarder" not found. で怒られた
  // const MinimalForwarder = await ethers.getContractFactory("MinimalForwarder");
  // const minimalForwarder = await MinimalForwarder.deploy();

  const MintNFTV2 = await ethers.getContractFactory("MintNFTV2");
  // TODO: set forwarder address
  const mintNFTV2 = await upgrades.upgradeProxy(
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    MintNFTV2
  );
  await mintNFTV2.deployed();

  // console.log("minimalForwarder:", minimalForwarder.address);
  console.log("minNFTV2 address:", mintNFTV2.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
