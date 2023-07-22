pragma circom 2.1.2;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template VerifySecretPhrase () {
    signal input correctSecretPhraseHash;
    signal input challengingSecretPhrase[1];
    signal output verified;

    component hash = Poseidon(1);
    component isEqual = IsEqual();

    hash.inputs[0] <== challengingSecretPhrase[0];

    isEqual.in[0] <== hash.out;
    isEqual.in[1] <== correctSecretPhraseHash;

    verified <== isEqual.out;
}

component main {public [correctSecretPhraseHash]} = VerifySecretPhrase();