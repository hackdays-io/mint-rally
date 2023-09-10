import { BigNumber } from "ethers";
import { ethers } from "hardhat";

async function main() {
  const provider = ethers.provider;

  const tr = await provider.getTransactionReceipt(
    "0x9dbea31bce77a3d02e36eb283d31a544cc0200fba1c0bd737ce000a20492eb35"
  );
  const tx = await provider.getTransaction(
    "0x9dbea31bce77a3d02e36eb283d31a544cc0200fba1c0bd737ce000a20492eb35"
  );

  console.log(tx.data);
  console.log(BigNumber.from(tr.logs[0].topics[3]).toNumber());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
