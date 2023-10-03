import { network } from "hardhat";
import { upgradeEventManager, upgradeMintNFT } from "../../helper/upgrade";

async function main() {
  if (network.name !== "local") throw new Error("wrong network");

  await upgradeMintNFT([
    process.env.LOCAL_FORWARDER_ADDRESS!,
    process.env.LOCAL_SECRETPHRASE_VERIFIER_ADDRESS!,
    process.env.LOCAL_OPERATION_CONTROLLER_ADDRESS!,
  ]);

  await upgradeEventManager();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
