import { ethers, upgrades } from "hardhat";

async function main() {
  const EventManagerFactory = await ethers.getContractFactory("EventManager");
  const deployedEventManager: any = await upgrades.upgradeProxy(
    "0xFe2fe598E6C8B2fe66E55D5545D7d0aE4d52fCA1",
    EventManagerFactory
  );
  await deployedEventManager.deployed();

  console.log("eventManager address:", deployedEventManager.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
