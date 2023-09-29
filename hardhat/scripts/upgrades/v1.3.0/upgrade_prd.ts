import { network } from "hardhat";
import { upgradeEventManager, upgradeMintNFT } from "../../helper/upgrade";
import { deployOperationController } from "../../helper/deploy";

async function main() {
  if (network.name !== "polygon") throw new Error("wrong network");

  const deployedOperationController = await deployOperationController();

  await upgradeMintNFT([
    process.env.POLYGON_FOWARDER_ADDRESS,
    process.env.POLYGON_SECRETPHRASE_VERIFIER_ADDRESS,
    deployedOperationController.address,
  ]);
  await upgradeEventManager([
    process.env.POLYGON_RELAYER_ADDRESS,
    250000,
    1000000,
    deployedOperationController.address,
  ]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
