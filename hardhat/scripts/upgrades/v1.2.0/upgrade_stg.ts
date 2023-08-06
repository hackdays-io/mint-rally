import { ethers, upgrades, network } from "hardhat";
import { generateProof, getFromTxHash } from "../../helper/secret_phrase";
import { SecretPhraseVerifier } from "../../../typechain";
const { buildPoseidon } = require("circomlibjs");

const secretPhrases = ["test"];

async function main() {
  if (network.name !== "mumbai") throw new Error("wrong network");

  let secretPhraseVerifier: SecretPhraseVerifier;
  const SecretPhraseVerifierFactory = await ethers.getContractFactory(
    "SecretPhraseVerifier"
  );
  secretPhraseVerifier = await SecretPhraseVerifierFactory.deploy();
  await secretPhraseVerifier.deployed();

  console.log("secret verifier is deployed");

  const poseidon = await buildPoseidon();
  const publicInputCalldata = [];
  for (const secretPhrase of secretPhrases) {
    const hexSecretPhrase = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(secretPhrase)
    );
    const poseidonHash = poseidon.F.toString(poseidon([hexSecretPhrase]));
    const proof = await generateProof(poseidonHash, hexSecretPhrase);
    publicInputCalldata.push(proof.publicInputCalldata[0]);
  }

  console.log("public input is ready");

  const MintNFTFactory = await ethers.getContractFactory("MintNFT");
  const deployedMintNFT: any = await upgrades.upgradeProxy(
    process.env.MUMBAI_MINTNFT_ADDRESS!,
    MintNFTFactory,
    {
      call: {
        fn: "initialize",
        args: [
          process.env.MUMBAI_FOWARDER_ADDRESS!,
          secretPhraseVerifier.address,
          publicInputCalldata,
        ],
      },
    }
  );
  await deployedMintNFT.deployed();

  const EventManagerFactory = await ethers.getContractFactory("EventManager");
  const deployedEventManager: any = await upgrades.upgradeProxy(
    process.env.MUMBAI_EVENTMANAGER_ADDRESS!,
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
