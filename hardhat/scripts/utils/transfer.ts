import { ethers } from "hardhat";

const main = async () => {
  const [owner] = await ethers.getSigners();

  const mintNFTContract = await ethers.getContractAt(
    "MintNFT",
    "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    owner
  );

  const tx = await mintNFTContract.transferFrom(
    owner.address,
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    0
  );
  await tx.wait();
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
