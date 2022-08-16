// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, upgrades } from "hardhat";
// import { MintNFT, EventManager } from "../typechain";

async function main() {
  // FIXME can't use types cause deployProxy return "Contract" type. it's different from below types.
  // let mintNFT: MintNFT;
  // let eventManager: EventManager;

  const MintNFT = await ethers.getContractFactory("MintNFT");
  // mintNFT = await MintNFT.deploy();
  const mintNFT = await upgrades.deployProxy(MintNFT);
  await mintNFT.deployed();

  const EventManager = await ethers.getContractFactory("EventManager");
  // eventManager = await EventManager.deploy();
  const eventManager = await upgrades.deployProxy(EventManager);
  await eventManager.deployed();

  // FIXME can't call onlyOwner function. Logs→Error: cannot estimate gas; transaction may fail or may require manual gas limit [ See: https://links.ethers.org/v5-errors-UNPREDICTABLE_GAS_LIMIT ] (reason="Error: VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'", method="estimateGas", transaction={"from":"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","to":"0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0","data":"0x9041e3f4000000000000000000000000dc64a140aa3e981100a9beca4e685f962f0cf6c9","accessList":null}, error={"name":"ProviderError","code":-32603,"_isProviderError":true,"data":{"message":"Error: VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'","data":"0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000204f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572"}}, code=UNPREDICTABLE_GAS_LIMIT, version=providers/5.6.8)
  // await mintNFT.setEventManagerAddr(eventManager.address);
  // await eventManager.setMintNFTAddr(mintNFT.address);

  console.log("mintNFT address:", mintNFT.address);
  console.log("eventManager address:", eventManager.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
