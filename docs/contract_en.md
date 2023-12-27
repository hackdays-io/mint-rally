# Setting Up Contract Development Environment (Until Test Code Execution)

## Installing Necessary Libraries

Install the following two libraries by following their respective instructions. Be aware that `snarkjs` should be installed globally.

1. [circom (a language for writing zero-knowledge proof circuits)](https://docs.circom.io/getting-started/installation/)
2. [snarkjs (a JavaScript library for computing zero-knowledge proofs)](https://www.npmjs.com/package/snarkjs)

Install NPM:

```shell
$ cd hardhat
$ pwd
~/hardhat
$ yarn
```

## Building the Zero-Knowledge Proof Circuit

```
$ yarn build:circuit
```

## Setting Up .env

```
$ cp .env.example .env
```

## Compilation and Test Execution

```
$ yarn test
```