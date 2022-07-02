import { ethers } from "hardhat";

// describe("MintNFT", function () {
//   it("MintNFT test", async function () {
//     const [owner1, owner2] = await ethers.getSigners();

//     const MintNFT = await ethers.getContractFactory("MintNFT");
//     const mintNFT = await MintNFT.deploy();
//     await mintNFT.deployed();

//     let txn = await mintNFT.pushGroupNFTAttributes(1, [
//       {
//         name: "normalNFT",
//         image: "https://i.imgur.com/TZEhCTX.png",
//         groupId: "0xbbb",
//         eventId: "0xaaa",
//         requiredParticipateCount: 0,
//       },
//       {
//         name: "specialNFT",
//         image: "https://i.imgur.com/TZEhCTX.png",
//         groupId: "0xbbb",
//         eventId: "0xaaa",
//         requiredParticipateCount: 3,
//       },
//       {
//         name: "normalNFT",
//         image: "https://i.imgur.com/TZEhCTX.png",
//         groupId: "0xbbb",
//         eventId: "0xaab",
//         requiredParticipateCount: 0,
//       },
//     ]);
//     await txn.wait();

//     txn = await mintNFT.connect(owner1).mintParticipateNFT("0xbbb", 0);
//     await txn.wait();
//     txn = await mintNFT.connect(owner1).mintParticipateNFT("0xbbb", 0);
//     await txn.wait();

//     let holdingNFTs = await mintNFT.connect(owner1).getOwnedNFTs();
//     console.log(holdingNFTs);
//   });
// });
