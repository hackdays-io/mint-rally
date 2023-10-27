import { network } from "hardhat";
import { upgradeEventManager, upgradeMintNFT } from "../../helper/upgrade";

async function main() {
  if (network.name !== "polygon") throw new Error("wrong network");

  await upgradeMintNFT();
  // [
  //   process.env.POLYGON_FOWARDER_ADDRESS,
  //   process.env.POLYGON_SECRETPHRASE_VERIFIER_ADDRESS,
  //   process.env.POLYGON_OPERATION_CONTROLLER_ADDRESS,
  // ]

  // await upgradeEventManager();
  // [
  //   process.env.POLYGON_RELAYER_ADDRESS,
  //   250000,
  //   1000000,
  //   process.env.POLYGON_OPERATION_CONTROLLER_ADDRESS,
  // ]
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
