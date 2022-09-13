// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { writeFileSync } from "fs";
import { ethers, upgrades } from "hardhat";
// import { MintNFT, EventManager } from "../typechain";

async function main() {
  // FIXME can't use types cause deployProxy return "Contract" type. it's different from below types.
  // let mintNFT: MintNFT;
  // let eventManager: EventManager;

  const Forwarder = await ethers.getContractFactory("MintRallyForwarder");
  const forwarder = await Forwarder.deploy();
  await forwarder.deployed();
  const MintNFT = await ethers.getContractFactory("MintNFT");
  // mintNFT = await MintNFT.deploy();
  const mintNFT = await upgrades.deployProxy(MintNFT, [forwarder.address]);
  await mintNFT.deployed();

  const EventManager = await ethers.getContractFactory("EventManager");
  // eventManager = await EventManager.deploy();
  const eventManager = await upgrades.deployProxy(EventManager);
  await eventManager.deployed();

  await mintNFT.setEventManagerAddr(eventManager.address);
  await eventManager.setMintNFTAddr(mintNFT.address);

  console.log("minimalForwarderUpgradeable", forwarder.address);
  console.log("mintNFT address:", mintNFT.address);
  console.log("eventManager address:", eventManager.address);

  writeFileSync(
    "deploy.json",
    JSON.stringify(
      {
        MintRallyFowarder: forwarder.address,
        MintNFT: mintNFT.address,
      },
      null,
      2
    )
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
