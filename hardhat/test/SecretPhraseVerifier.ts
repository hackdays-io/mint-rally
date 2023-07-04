const snarkjs = require("snarkjs");
const wasm_tester = require("circom_tester").wasm;
import { computeEffEcdsaPubInput } from "@personaelabs/spartan-ecdsa";
import path from "path";
import { ethers } from "hardhat";

describe("generate proof", () => {
  it("Generate Public inputs", async () => {
    const [signer] = await ethers.getSigners();

    const message = "hello world";
    const signature = await signer.signMessage(message);
    const r = BigInt(
      `0x${Buffer.from(signature.slice(2, 66), "hex").toString("hex")}`
    );
    const s = Buffer.from(signature.slice(66, 130), "hex");
    const v = BigInt(
      `0x${Buffer.from(signature.slice(130, 132), "hex").toString("hex")}`
    );

    const prefix = `\u0019Ethereum Signed Message:\n${message.length}`;
    const prefixedMessage = ethers.utils.concat([
      ethers.utils.toUtf8Bytes(prefix),
      ethers.utils.toUtf8Bytes(message),
    ]);
    const msgHash = Buffer.from(
      ethers.utils.keccak256(prefixedMessage).slice(2),
      "hex"
    );

    const circuitPubInput = computeEffEcdsaPubInput(r, v, msgHash);

    const circuitInput = {
      s: BigInt("0x" + s.toString("hex")),
      Tx: circuitPubInput.Tx,
      Ty: circuitPubInput.Ty,
      Ux: circuitPubInput.Ux,
      Uy: circuitPubInput.Uy,
    };

    const circuit = await wasm_tester(
      path.join(__dirname, "../circuits/SecretPhrase.circom"),
      {
        prime: "secq256k1",
      }
    );

    const w = await circuit.calculateWitness(circuitInput, true);
    await circuit.assertOut(w, { addr: BigInt(signer.address).toString(10) });
  });
});
