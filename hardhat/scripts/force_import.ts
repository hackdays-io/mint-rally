import { ethers, upgrades } from "hardhat";

async function main() {
  const EventManagerFactory = await ethers.getContractFactory("EventManager");
  await upgrades.forceImport(
    "0xFe2fe598E6C8B2fe66E55D5545D7d0aE4d52fCA1",
    EventManagerFactory
  );

  const MintNFTFactory = await ethers.getContractFactory("MintNFT");
  await upgrades.forceImport(
    "0x7d895Ca96caa5344EC0b732c6e1DEfa560671e14",
    MintNFTFactory
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
