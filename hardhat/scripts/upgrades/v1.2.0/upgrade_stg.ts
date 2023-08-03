import { ethers, upgrades } from "hardhat";
const { buildPoseidon } = require("circomlibjs");

async function main() {
  const poseidon = await buildPoseidon();
  const secretPhrases: string[] = [];
  const hashedSecretPhrases = secretPhrases.map((secretPhrase) => {
    const hexSecretPhrase = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(secretPhrase)
    );
    const poseidonHash = poseidon([hexSecretPhrase]);
    return poseidon.F.toString(poseidonHash);
  });
  const MintNFTFactory = await ethers.getContractFactory("MintNFT");
  const deployedMintNFT: any = await upgrades.upgradeProxy(
    "0xC3894D90dF7EFCAe8CF34e300CF60FF29Db9a868",
    MintNFTFactory,
    {
      call: {
        fn: "initialize",
        args: [
          "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
          "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
          hashedSecretPhrases,
        ],
      },
    }
  );
  await deployedMintNFT.deployed();

  console.log("mintNFT address:", deployedMintNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
