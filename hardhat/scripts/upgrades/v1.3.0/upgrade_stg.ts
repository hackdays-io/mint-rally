import { ethers, upgrades, network } from "hardhat";

async function main() {
  if (network.name !== "mumbai") throw new Error("wrong network");

  const operationController = await ethers.getContractFactory(
    "OperationController"
  );
  const deployedOperationController: any = await upgrades.deployProxy(
    operationController,
    [],
    {
      initializer: "initialize",
    }
  );
  await deployedOperationController.deployed();

  console.log(
    "operationController address:",
    deployedOperationController.address
  );

  const MintNFTFactory = await ethers.getContractFactory("MintNFT");
  const deployedMintNFT: any = await upgrades.upgradeProxy(
    process.env.MUMBAI_MINTNFT_ADDRESS!,
    MintNFTFactory,
    {
      call: {
        fn: "initialize",
        args: [
          process.env.MUMBAI_FOWARDER_ADDRESS,
          process.env.MUMBAI_SECRETPHRASE_VERIFIER_ADDRESS,
          deployedOperationController.address,
        ],
      },
    }
  );
  await deployedMintNFT.deployed();

  console.log("mintNFT address:", deployedMintNFT.address);

  const EventManagerFactory = await ethers.getContractFactory("EventManager");
  const deployedEventManager: any = await upgrades.upgradeProxy(
    process.env.MUMBAI_EVENTMANAGER_ADDRESS!,
    EventManagerFactory,
    {
      call: {
        fn: "initialize",
        args: [
          process.env.MUMBAI_RELAYER_ADDRESS,
          250000,
          1000000,
          deployedOperationController.address,
        ],
      },
    }
  );
  await deployedEventManager.deployed();

  console.log("eventManager address:", deployedEventManager.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
