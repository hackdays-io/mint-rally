const snarkjs = require("snarkjs");
import fs from "fs";

describe("generate proof", () => {
  it("should generate proof", async () => {
    const wasm = fs.readFileSync(
      "../circuits/SecretPhrase_js/SecretPhrase.wasm"
    );
    const zkey = fs.readFileSync("../circuits/circuit.zkey");
    const { proof, publicSignals } = await snarkjs.plonk.fullProve(
      { in: 10 },
      wasm,
      zkey
    );
    console.log(proof);
    console.log(publicSignals);
  });
});
