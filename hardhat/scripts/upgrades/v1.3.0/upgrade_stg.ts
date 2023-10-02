import { network } from "hardhat";
import { upgradeEventManager, upgradeMintNFT } from "../../helper/upgrade";

async function main() {
  if (network.name !== "mumbai") throw new Error("wrong network");

  await upgradeMintNFT();
  // [
  //   process.env.MUMBAI_FORWARDER_ADDRESS!,
  //   process.env.MUMBAI_SECRETPHRASE_VERIFIER_ADDRESS!,
  //   process.env.MUMBAI_OPERATION_CONTROLLER_ADDRESS!,
  // ]

  await upgradeEventManager();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
