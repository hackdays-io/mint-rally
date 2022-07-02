import { ethers } from "hardhat";

const deployMintNFT = async () => {
  const factory = await ethers.getContractFactory("MintNFT");
  const contract = await factory.deploy();

  await contract.deployed();

  let txn = await contract.pushParticipateNFT([
    {
      name: "normalNFT",
      image: "https://i.imgur.com/TZEhCTX.png",
      groupId: "0xbbb",
      eventId: "0xaaa",
      requiredParticipateCount: 0,
    },
  ]);
  await txn.wait();

  console.log("MintNFT deployed to:", contract.address);
};

deployMintNFT().catch((err) => {
  console.log(err);
  process.exitCode = 1;
});
