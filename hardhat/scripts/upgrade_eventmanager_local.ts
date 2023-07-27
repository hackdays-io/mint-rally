import { ethers, upgrades } from "hardhat";

async function main() {
  const EventManagerFactory = await ethers.getContractFactory("EventManager");
  const deployedEventManager: any = await upgrades.upgradeProxy(
    "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    EventManagerFactory
  );
  await deployedEventManager.deployed();

  console.log("eventManager address:", deployedEventManager.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
