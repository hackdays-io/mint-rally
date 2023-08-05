import { ethers, network, upgrades } from "hardhat";
import { SecretPhraseVerifier } from "../../../typechain";
import { generateProof } from "../../helper/secret_phrase";
const { buildPoseidon } = require("circomlibjs");

async function main() {
  if (network.name !== "local") throw new Error("wrong network");

  let secretPhraseVerifier: SecretPhraseVerifier;
  const SecretPhraseVerifierFactory = await ethers.getContractFactory(
    "SecretPhraseVerifier"
  );
  secretPhraseVerifier = await SecretPhraseVerifierFactory.deploy();
  await secretPhraseVerifier.deployed();

  const poseidon = await buildPoseidon();
  const secretPhrases: string[] = ["LGTM", "LetsHack"];
  const proofCalldataPromise = secretPhrases.map(async (secretPhrase) => {
    const hexSecretPhrase = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(secretPhrase)
    );
    const poseidonHash = poseidon.F.toString(poseidon([hexSecretPhrase]));
    return await generateProof(poseidonHash, hexSecretPhrase);
  });
  const proofCalldata = await Promise.all(proofCalldataPromise);

  const MintNFTFactory = await ethers.getContractFactory("MintNFT");
  const deployedMintNFT: any = await upgrades.upgradeProxy(
    "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    MintNFTFactory,
    {
      call: {
        fn: "initialize",
        args: [
          "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          secretPhraseVerifier.address,
          proofCalldata.map((proof) => proof.publicInputCalldata[0]),
        ],
      },
    }
  );
  await deployedMintNFT.deployed();

  const EventManagerFactory = await ethers.getContractFactory("EventManager");
  const deployedEventManager: any = await upgrades.upgradeProxy(
    "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
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
