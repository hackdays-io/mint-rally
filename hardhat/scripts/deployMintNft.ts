import { ethers } from "hardhat";

const deployMintNFT = async () => {
  const factory = await ethers.getContractFactory("MintNFT");
  const contract = await factory.deploy();

  await contract.deployed();

  console.log("MintNFT deployed to:", contract.address);
};

deployMintNFT().catch((err) => {
  console.log(err);
  process.exitCode = 1;
});
