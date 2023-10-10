import { ethers, network, upgrades } from "hardhat";
import { SecretPhraseVerifier } from "../../../typechain";

async function main() {
  if (network.name !== "local") throw new Error("wrong network");

  const MintNFTFactory = await ethers.getContractFactory("MintNFT");
  const deployedMintNFT: any = await upgrades.upgradeProxy(
    "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    MintNFTFactory,
    {
      call: {
        fn: "initialize",
        args: [
          "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", // forwarder
          "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9", // secret phrase verifier
          "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e", // operation controller
        ],
      },
    }
  );
  await deployedMintNFT.deployed();

  const EventManagerFactory = await ethers.getContractFactory("EventManager");
  const deployedEventManager: any = await upgrades.upgradeProxy(
    "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
    EventManagerFactory,
    {
      call: {
        fn: "initialize",
        args: [
          "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", // relayer
          250000,
          1000000,
          "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e", // operation controller
        ],
      },
    }
  );
  await deployedEventManager.deployed();

  console.log("mintNFT address:", deployedMintNFT.address);
  console.log("eventManager address:", deployedEventManager.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
