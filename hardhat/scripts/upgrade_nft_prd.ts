import { ethers, upgrades } from "hardhat";

async function main() {
  const MintNFTFactory = await ethers.getContractFactory("MintNFT");
  const deployedMintNFT: any = await upgrades.upgradeProxy("0x7d895Ca96caa5344EC0b732c6e1DEfa560671e14", MintNFTFactory);
  await deployedMintNFT.deployed();

  console.log("mintNFT address:", deployedMintNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});