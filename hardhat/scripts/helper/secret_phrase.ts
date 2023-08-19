import dayjs from "dayjs";
import { readFileSync, writeFileSync } from "fs";
import { ethers } from "hardhat";
const { buildPoseidon } = require("circomlibjs");
const snarkjs = require("snarkjs");
const wc = require("../../circuits/build/SecretPhrase_js/witness_calculator.js");
import abi from "./eventManagerABI.json";
import { randomBytes } from "crypto";

export const hashPoseidon = async (message: string) => {
  const hexSecretPhrase = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(message)
  );
  const challengingSecretPhrase = [hexSecretPhrase];
  const poseidon = await buildPoseidon();
  const poseidonHash = poseidon(challengingSecretPhrase);
  const resultString = poseidon.F.toString(poseidonHash);
  return resultString;
};

export const generateProof = async (
  correctSecretPhraseHash: any,
  challengingSecretPhrase: any
) => {
  const input = {
    correctSecretPhraseHash: correctSecretPhraseHash,
    challengingSecretPhrase: [challengingSecretPhrase],
  };

  const buffer = readFileSync(
    "./circuits/build/SecretPhrase_js/SecretPhrase.wasm"
  );
  const witnessCalculator = await wc(buffer);
  const buff = await witnessCalculator.calculateWTNSBin(input, 0);

  const rand = randomBytes(32).toString("hex");
  const tmpFilePath = `./tmp/wtns${rand}.wtns`;
  writeFileSync(tmpFilePath, buff);

  const { proof, publicSignals } = await snarkjs.plonk.prove(
    "./circuits/build/SecretPhrase.zkey",
    tmpFilePath
  );
  const calldata = await snarkjs.plonk.exportSolidityCallData(
    proof,
    publicSignals
  );

  return {
    proofCalldata: JSON.parse(calldata.split("][")[0] + "]"),
    publicInputCalldata: JSON.parse("[" + calldata.split("][")[1]),
  };
};

export const getFromTxHash = async (txHashes: string[]) => {
  const eventManagerInterface = new ethers.utils.Interface(abi.abi);
  const provider = ethers.provider;

  const txPromise = txHashes.map(async (txHash) => {
    const tx = await provider.getTransaction(txHash);
    const decodedInput = eventManagerInterface.parseTransaction({
      data: tx.data,
    });
    return decodedInput.args["_secretPhrase"];
  });
  const secretPhrases = await Promise.all(txPromise);

  return secretPhrases;
};
