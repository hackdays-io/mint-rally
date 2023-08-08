import { ethers, upgrades } from "hardhat";

async function main() {
  const MintNFTFactory = await ethers.getContractFactory("MintNFT");
  const deployedMintNFT: any = await upgrades.upgradeProxy(
    "0xC3894D90dF7EFCAe8CF34e300CF60FF29Db9a868",
    MintNFTFactory
  );
  await deployedMintNFT.deployed();

  console.log("mintNFT address:", deployedMintNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
