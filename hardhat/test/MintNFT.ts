import { ethers } from "hardhat";

describe("MintNFT", function () {
  it("MintNFT test", async function () {
    const [owner1, owner2] = await ethers.getSigners();

    const MintNFT = await ethers.getContractFactory("MintNFT");
    const mintNFT = await MintNFT.deploy();
    await mintNFT.deployed();

    let txn = await mintNFT.pushParticipateNFT([
      {
        name: "normalNFT",
        groupAddress: "0xbbb",
        eventAddress: "0xaaa",
      },
      {
        name: "specialNFT",
        groupAddress: "0xbbb",
        eventAddress: "0xaab",
      },
    ]);
    await txn.wait();

    txn = await mintNFT.connect(owner1).mintParticipateNFT("0xaaa");
    txn = await mintNFT.connect(owner1).mintParticipateNFT("0xaab");
    await txn.wait();
    txn = await mintNFT.connect(owner2).mintParticipateNFT("0xaaa");
    await txn.wait();

    let currentNum = await mintNFT.connect(owner1).checkOwnedNFTsId();
    let currentNum2 = await mintNFT.connect(owner2).checkOwnedNFTsId();

    console.log(currentNum, currentNum2);
  });
});
