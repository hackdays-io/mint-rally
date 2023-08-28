import { ethers, upgrades, network } from "hardhat";

async function main() {
  if (network.name !== "mumbai") throw new Error("wrong network");

  const MintNFTFactory = await ethers.getContractFactory("MintNFT");
  const deployedMintNFT: any = await upgrades.upgradeProxy(
    process.env.MUMBAI_MINTNFT_ADDRESS!,
    MintNFTFactory
  );
  await deployedMintNFT.deployed();

  // const EventManagerFactory = await ethers.getContractFactory("EventManager");
  // const deployedEventManager: any = await upgrades.upgradeProxy(
  //   process.env.MUMBAI_EVENTMANAGER_ADDRESS!,
  //   EventManagerFactory
  // );
  // await deployedEventManager.deployed();

  console.log("mintNFT address:", deployedMintNFT.address);
  // console.log("eventManager address:", deployedEventManager.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
