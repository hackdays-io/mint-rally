import { ethers, upgrades } from "hardhat";

async function main() {
  const MintNFTFactory = await ethers.getContractFactory("MintNFT");
  const deployedMintNFT: any = await upgrades.upgradeProxy(
    "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    MintNFTFactory
  );
  await deployedMintNFT.deployed();

  console.log("mintNFT address:", deployedMintNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
