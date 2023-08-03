import { ethers, upgrades } from "hardhat";
import { SecretPhraseVerifier } from "../../../typechain";
const { buildPoseidon } = require("circomlibjs");

async function main() {
  let secretPhraseVerifier: SecretPhraseVerifier;
  const SecretPhraseVerifierFactory = await ethers.getContractFactory(
    "SecretPhraseVerifier"
  );
  secretPhraseVerifier = await SecretPhraseVerifierFactory.deploy();
  await secretPhraseVerifier.deployed();

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
          secretPhraseVerifier.address,
          hashedSecretPhrases,
        ],
      },
    }
  );
  await deployedMintNFT.deployed();

  const EventManagerFactory = await ethers.getContractFactory("EventManager");
  const deployedEventManager: any = await upgrades.upgradeProxy(
    "0x4fe4F50B719572b3a5A33516da59eC43F51F4A45",
    EventManagerFactory
  );
  await deployedEventManager.deployed();

  console.log("mintNFT address:", deployedMintNFT.address);
  console.log("eventManager address:", deployedEventManager.address);
  console.log("secretPhraseVerifier address:", secretPhraseVerifier.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
