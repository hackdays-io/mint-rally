import { network } from "hardhat";
import { upgradeEventManager, upgradeMintNFT } from "../../helper/upgrade";

async function main() {
  if (network.name !== "mumbai") throw new Error("wrong network");

  await upgradeMintNFT();
  // await upgradeMintNFT([
  //   process.env.MUMBAI_OWNER_ADDRESS!,
  //   process.env.MUMBAI_FORWARDER_ADDRESS!,
  //   process.env.MUMBAI_SECRETPHRASE_VERIFIER_ADDRESS!,
  //   process.env.MUMBAI_OPERATION_CONTROLLER_ADDRESS!,
  // ]);

  // await upgradeEventManager([
  //   process.env.MUMBAI_OWNER_ADDRESS!,
  //   process.env.MUMBAI_RELAYER_ADDRESS!,
  //   250000,
  //   1000000,
  //   process.env.MUMBAI_OPERATION_CONTROLLER_ADDRESS,
  // ]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
