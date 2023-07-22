const wasm_tester = require("circom_tester").wasm;
const { buildPoseidon } = require("circomlibjs");
const snarkjs = require("snarkjs");
import { assert, expect } from "chai";
import { exec, execSync } from "child_process";
import { ethers } from "hardhat";
import { promisify } from "util";
import { SecretPhraseVerifier } from "../typechain";
import { BigNumber } from "ethers";
import path from "path";

const execAsync = promisify(exec);

describe("Poseidon hash", async () => {
  it("should hash a secret phrase", async () => {
    const secretPhrase = "test";
    const hexSecretPhrase = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(secretPhrase)
    );
    const challengingSecretPhrase = [hexSecretPhrase];

    const poseidon = await buildPoseidon();
    const poseidonHash = poseidon(challengingSecretPhrase);
    const resultString = poseidon.F.toString(poseidonHash);

    const input = {
      correctSecretPhraseHash: resultString,
      challengingSecretPhrase: challengingSecretPhrase,
    };

    const circuit = await wasm_tester(
      path.join(__dirname, "../circuits/SecretPhrase.circom")
    );

    const witness = await circuit.calculateWitness(input, true);
    await circuit.assertOut(witness, { verified: 1 });
  });
});

describe("generate proof", () => {
  let secretPhraseVerifier: SecretPhraseVerifier;

  before(async () => {
    const secretPhraseVerifierFactory = await ethers.getContractFactory(
      "SecretPhraseVerifier"
    );
    secretPhraseVerifier = await secretPhraseVerifierFactory.deploy();
    await secretPhraseVerifier.deployed();
  });

  it("generate witness", async () => {
    const { stdout, stderr } = await execAsync(
      "node ./circuits/build/SecretPhrase_js/generate_witness.js ./circuits/build/SecretPhrase_js/SecretPhrase.wasm ./circuits/input.json ./circuits/build/witness.wtns"
    );
    expect(stderr).to.be.empty;
    expect(stdout).to.be.empty;
  });

  it("proove", async () => {
    const { proof, publicSignals } = await snarkjs.plonk.prove(
      "./circuits/build/SecretPhrase.zkey",
      "./circuits/build/witness.wtns"
    );
    const calldata = await snarkjs.plonk.exportSolidityCallData(
      proof,
      publicSignals
    );

    const verified = await secretPhraseVerifier.verifyProof(
      JSON.parse(calldata.split("][")[0] + "]"),
      JSON.parse("[" + calldata.split("][")[1]),
      BigNumber.from(1)
    );

    expect(verified).to.be.true;

    await secretPhraseVerifier.submitProof(
      JSON.parse(calldata.split("][")[0] + "]"),
      BigNumber.from(1)
    );

    const failedToVerify = await secretPhraseVerifier.verifyProof(
      JSON.parse(calldata.split("][")[0] + "]"),
      JSON.parse("[" + calldata.split("][")[1]),
      BigNumber.from(1)
    );
    expect(failedToVerify).to.be.false;
  });

  it("fail to verify", async () => {
    const { stdout, stderr } = await execAsync(
      "node ./circuits/build/SecretPhrase_js/generate_witness.js ./circuits/build/SecretPhrase_js/SecretPhrase.wasm ./circuits/wrong_input.json ./circuits/build/wrong_witness.wtns"
    );
    expect(stderr).to.be.empty;
    expect(stdout).to.be.empty;

    const { proof, publicSignals } = await snarkjs.plonk.prove(
      "./circuits/build/SecretPhrase.zkey",
      "./circuits/build/witness.wtns"
    );

    const calldata = await snarkjs.plonk.exportSolidityCallData(
      proof,
      publicSignals
    );

    const verified = await secretPhraseVerifier.verifyProof(
      JSON.parse(calldata.split("][")[0] + "]"),
      JSON.parse("[" + calldata.split("][")[1]),
      BigNumber.from(1)
    );

    expect(verified).to.be.false;
  });
});
