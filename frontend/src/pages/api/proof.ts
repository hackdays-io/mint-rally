// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import dayjs from "dayjs";
import { readFileSync, writeFileSync } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
const wc = require("./circuits/witness_calculator.js");
const snarkjs = require("snarkjs");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") res.status(405).send("Method not allowed");

  try {
    const input = {
      correctSecretPhraseHash: req.body.correctSecretPhraseHash,
      challengingSecretPhrase: [req.body.challengingSecretPhrase],
    };

    const wasmFilePath = path.join(
      process.cwd(),
      "src/pages/api/circuits/SecretPhrase.wasm"
    );
    const buffer = readFileSync(wasmFilePath);
    const witnessCalculator = await wc(buffer);
    const buff = await witnessCalculator.calculateWTNSBin(input, 0);

    const tmpFilePath = `/tmp/wtns${dayjs().unix().toString()}.wtns`;
    writeFileSync(tmpFilePath, buff);

    const zkeyFilePath = path.join(
      process.cwd(),
      "src/pages/api/circuits/SecretPhrase.zkey"
    );
    const { proof, publicSignals } = await snarkjs.plonk.prove(
      zkeyFilePath,
      tmpFilePath
    );
    const calldata = await snarkjs.plonk.exportSolidityCallData(
      proof,
      publicSignals
    );

    res.send({
      proofCalldata: JSON.parse(calldata.split("][")[0] + "]"),
      publicInputCalldata: JSON.parse("[" + calldata.split("][")[1]),
    });
  } catch (error) {
    res.status(500).send(error);
  }

  return;
}
