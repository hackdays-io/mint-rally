import { ethers } from "hardhat";

describe("MintNFT", function () {
  it("MintNFT test", async function () {
    const MintNFT = await ethers.getContractFactory("MintNFT");
    const greeter = await MintNFT.deploy();
    await greeter.deployed();
  });
});
