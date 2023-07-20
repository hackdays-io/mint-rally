import { ethers } from "hardhat";

const snarkjs = require("snarkjs");

describe("generate proof", () => {
  it("proove", async () => {
    const plonkVerifierFactory = await ethers.getContractFactory(
      "PlonkVerifier"
    );
    const plonkVerifier = await plonkVerifierFactory.deploy();
    await plonkVerifier.deployed();

    const { proof, publicSignals } = await snarkjs.plonk.prove(
      "./circuits/circuit.zkey",
      "./circuits/witness.wtns"
    );
    const calldata = await snarkjs.plonk.exportSolidityCallData(
      proof,
      publicSignals
    );

    const verified = await plonkVerifier.verifyProof(
      JSON.parse(calldata.split("][")[0] + "]"),
      JSON.parse("[" + calldata.split("][")[1])
    );
    console.log(verified);
  });
});
