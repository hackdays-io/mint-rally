import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import builtins from "builtin-modules";

export default {
  input: ["autotasks/relay_stg/index.js", "autotasks/relay_prd/index.js"],
  output: [
    {
      dir: "build/relay_stg",
      format: "cjs",
      exports: "auto",
    },
    {
      dir: "build/relay_prd",
      format: "cjs",
      exports: "auto",
    },
  ],
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    json({ compact: true }),
  ],
  external: [
    ...builtins,
    "ethers",
    "web3",
    "axios",
    /^defender-relay-client(\/.*)?$/,
  ],
};
