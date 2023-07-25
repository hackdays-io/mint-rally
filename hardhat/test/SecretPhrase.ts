const wasm_tester = require("circom_tester").wasm;
const { buildPoseidon } = require("circomlibjs");
const snarkjs = require("snarkjs");
import { assert, expect } from "chai";
import { exec, execSync } from "child_process";
import { ethers } from "hardhat";
import { promisify } from "util";
import { SecretPhraseVerifier } from "../typechain";
import { BigNumber, BigNumberish } from "ethers";
import path from "path";

const execAsync = promisify(exec);

describe("Poseidon hash", async () => {
  it("check circuit", async () => {
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
    await circuit.assertOut(witness, {});
  });

  it("check circuit with wrong secret phrase", async () => {
    const wrongPhrase = "wrong";
    const hexWrongPhrase = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(wrongPhrase)
    );
    const wrongSecretPhrase = [hexWrongPhrase];

    const secretPhrase = "test";
    const hexSecretPhrase = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(secretPhrase)
    );
    const correctSecretPhrase = [hexSecretPhrase];

    const poseidon = await buildPoseidon();
    const poseidonHash = poseidon(correctSecretPhrase);
    const resultString = poseidon.F.toString(poseidonHash);

    const input = {
      correctSecretPhraseHash: resultString,
      challengingSecretPhrase: wrongSecretPhrase,
    };

    const circuit = await wasm_tester(
      path.join(__dirname, "../circuits/SecretPhrase.circom")
    );

    try {
      await circuit.calculateWitness(input, true);
    } catch (err: any) {
      assert(err.message.includes("Assert Failed"));
    }
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

  it("prove", async () => {
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
    // const { stdout, stderr } = await execAsync(
    //   "node ./circuits/build/SecretPhrase_js/generate_witness.js ./circuits/build/SecretPhrase_js/SecretPhrase.wasm ./circuits/wrong_input.json ./circuits/build/wrong_witness.wtns"
    // );
    // expect(stderr).to.be.empty;
    // expect(stdout).to.be.empty;

    const { proof, publicSignals } = await snarkjs.plonk.prove(
      "./circuits/build/SecretPhrase.zkey",
      "./circuits/build/witness.wtns"
    );

    const calldata = await snarkjs.plonk.exportSolidityCallData(
      proof,
      publicSignals
    );

    const wrongProofCalldata: any = [
      "0x10c7da1d87ac3a86d34053a76768cc39c581d469b68863a9fba17bcdaa048f98",
      "0x2745eaddc5036ced4a7a42ee2eb5ed9c99f72df8a8dc6206c9aac0af8f505757",
      "0x2f4c0b9dd8df7bf84bdf97c81fef5fa0f2e790986c298b2408b23608170eadab",
      "0x0a3f255229155c8eaea9f52b1aaab3d77aa93d5145f2cee8a485c8b24a1ca80f",
      "0x0ee895a14f5df001fa64584d631ca2cda943a6acc12a7fd4b30fe187ca3f5df5",
      "0x0d36a9eb55904a20221da7c19b422e65c5d52226e26ec54be4aeb098d6d98ede",
      "0x2213ef550ec98107ac5199e02a8985e1a814014e1b158b4ee4e76b749d149e27",
      "0x0240a15f8bf16b1af60d95e7d0a351b0670d7c7f1d4a62ccc49fb9a325bf5cf8",
      "0x1cccdc3294f89c5a26b3e6dd522b12b693bc629e1ca18b189fd11641951e6c3c",
      "0x0474ed81af5a10bc1ac9cfd4c57504c250aef251451a9d0e0e878b3e4bb7f5b2",
      "0x04a92c6ad8aad0f9ca48be638b86f0fadefb8ea7b68a793c1819662c20d46d43",
      "0x2dcfe1a5e28527d8215a919d9e1eaf03f781df56302d1ee2f68a3cea88979357",
      "0x1b7b4fceb8cc6258acf8b1d0f25bf72c6be5075d9d2e05ac61dc4c0b93de47c2",
      "0x0926022a82fcdde349a70834e8b158cd46c8bd5386cf949d3fa1e30f9ca7942d",
      "0x14d2af0c7bdb1cecd5539865bd6af8f3e46393217c97ff86a395044877e4c638",
      "0x20688548968e7b8c2d3984ea661f3cb6ce082bd8717ced760d4c227f75b76114",
      "0x2b7e1268061a61b7bab83ea8ed88a662589e7491513079535432deb4a0c3832e",
      "0x04f24cfb7d594f6cbd9f4c5af84ec7c6965179f6b9122482cbb7e3695d6e78b5",
      "0x2edec2e5082f56399784bf9bc7281de4d7880749481d6e1266f620703590bcc3",
      "0x142ce84dc5b94bf9d3c4e796a6ae4d9d5899210b6d8fc19064d92b27513d0e94",
      "0x0b7afa363057522cbb8917e7a2b82016bcafeed520c6d3a623aad8e22a19a029",
      "0x031290766c690a2b251cd1fcb881e8a6ed18a5a1624095eace4250b937bbe206",
      "0x111a3da55cc6281d3d8aaedd612a8565793045ac712bd668fd140b9c5ece4470",
      "0x1111111111111111111111111111111111111111111111111111111111111111",
    ];

    const result = await secretPhraseVerifier.verifyProof(
      wrongProofCalldata,
      JSON.parse("[" + calldata.split("][")[1]),
      BigNumber.from(1)
    );

    expect(result).to.be.false;
  });
});
