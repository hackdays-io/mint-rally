import { ethers, network, upgrades } from "hardhat";
import { SecretPhraseVerifier } from "../../../typechain";

async function main() {
  if (network.name !== "local") throw new Error("wrong network");

  const MintNFTFactory = await ethers.getContractFactory("MintNFT");
  const deployedMintNFT: any = await upgrades.upgradeProxy(
    "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
    MintNFTFactory,
    {
      call: {
        fn: "initialize",
        args: [
          "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
          [1, 3, 2],
        ],
      },
    }
  );
  await deployedMintNFT.deployed();

  // const EventManagerFactory = await ethers.getContractFactory("EventManager");
  // const deployedEventManager: any = await upgrades.upgradeProxy(
  //   "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
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
