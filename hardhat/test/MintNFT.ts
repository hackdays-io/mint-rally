import { expect } from "chai";
import { ethers } from "hardhat";

describe("MintNFT", function () {
  it("MintNFT test", async function () {
    const [owner1, owner2] = await ethers.getSigners();

    const MintNFT = await ethers.getContractFactory("MintNFT");
    const mintNFT = await MintNFT.deploy();
    await mintNFT.deployed();

    let txn = await mintNFT.pushGroupNFTAttributes(1, [
      {
        name: "normalNFT",
        image: "https://i.imgur.com/TZEhCTX.png",
        groupId: 1,
        eventId: 0,
        requiredParticipateCount: 0,
      },
      {
        name: "specialNFT",
        image: "https://i.imgur.com/TZEhCTX.png",
        groupId: 1,
        eventId: 0,
        requiredParticipateCount: 5,
      },
      {
        name: "awesomeNFT",
        image: "https://i.imgur.com/TZEhCTX.png",
        groupId: 1,
        eventId: 0,
        requiredParticipateCount: 10,
      },
    ]);
    await txn.wait();

    txn = await mintNFT.connect(owner1).mintParticipateNFT(1, 1, 0);
    await txn.wait();
    let holdingNFTs = await mintNFT.connect(owner1).getOwnedNFTs();
    expect(holdingNFTs[0].eventId).equal(1);

    txn = await mintNFT.connect(owner1).mintParticipateNFT(1, 2, 5);
    await txn.wait();
    holdingNFTs = await mintNFT.connect(owner1).getOwnedNFTs();
    expect(holdingNFTs[1].eventId).equal(2);
    expect(holdingNFTs[1].name).equal("specialNFT");
  });
});
