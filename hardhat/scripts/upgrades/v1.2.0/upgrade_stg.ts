import { ethers, upgrades, network } from "hardhat";

const ids = [
  1, 1, 1, 3, 3, 4, 5, 6, 7, 7, 7, 7, 7, 8, 9, 10, 12, 13, 14, 15, 16, 18, 19,
  20, 21, 22, 23, 24, 25, 26, 29, 30, 31, 27, 32, 33, 36, 37, 38, 40, 42, 43,
  45, 45, 46, 46, 46, 47, 47, 48, 48, 48, 47, 48, 48, 49, 48, 51, 50, 53, 54,
  56, 57, 58, 59, 60, 64, 65, 53, 54, 66, 66, 67, 67, 66, 47, 48, 68, 68, 68,
  69, 69, 68, 69, 69, 68, 68, 70, 72, 73, 74, 75, 75, 76, 76, 77, 77, 76, 78,
  78, 78, 78, 78, 78, 79, 79, 67, 69, 80, 81, 81, 81, 82, 78, 80, 81, 73, 73,
  83, 84, 86, 85, 87, 90, 91, 92, 92, 93, 91, 93, 20, 93, 93, 92, 96, 97, 99,
  98, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 112, 112, 113, 113,
  114,
];

async function main() {
  if (network.name !== "mumbai") throw new Error("wrong network");

  const MintNFTFactory = await ethers.getContractFactory("MintNFT");
  const deployedMintNFT: any = await upgrades.upgradeProxy(
    process.env.MUMBAI_MINTNFT_ADDRESS!,
    MintNFTFactory,
    {
      call: {
        fn: "initialize",
        args: [
          "0xe9a9403381Ae89595D7DE67e2512aDb914F17DA7",
          "0x8cec10307447b3fa8d45007cf0cd45e9139efeac",
          ids,
        ],
      },
    }
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
