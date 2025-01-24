import { ethers, upgrades } from "hardhat";
import {
  MintRallyViewer,
} from "../typechain";

async function main() {
  const ownerAddr = "0xc5952da2d393d3421D56bd5FBCac1F8a3df40567";
  const mintNftAddr = "0x225B131690c2648EE58E7684e613C07D01A1B946";
  const eventManagerAddr = "0x71BAfD0812b483054b7e0c66dB428eB4AA54E13C";

  let mintRallyViewer: MintRallyViewer;

  const MintRallyViewerFactory = await ethers.getContractFactory("MintRallyViewer");
  const deployedMintRallyViewer: any = await upgrades.deployProxy(
    MintRallyViewerFactory,
    [
        ownerAddr,
        mintNftAddr,
        eventManagerAddr,
    ],
    {
      initializer: "initialize",
    }
  );
  mintRallyViewer = deployedMintRallyViewer;
  await mintRallyViewer.deployed();

  console.log("mintNFT address:", mintNftAddr);
  console.log("eventManager address:", eventManagerAddr, "\n");
  console.log("mintRallyViewer address:", mintRallyViewer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
