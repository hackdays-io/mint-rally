import { ethers, upgrades } from "hardhat";

async function main() {
  const EventManagerFactory = await ethers.getContractFactory("EventManager");
  const deployedEventManager: any = await upgrades.upgradeProxy(
    "0x4fe4F50B719572b3a5A33516da59eC43F51F4A45",
    EventManagerFactory
  );
  await deployedEventManager.deployed();

  console.log("mintNFT address:", deployedEventManager.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
