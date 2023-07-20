pragma circom 2.1.2;

template VerifySecretPhrase () {
    signal input collectSecretPhrase;
    signal input challengingSecretPhrase;
    signal output verified;
    
    signal secretPhrase_diff <== collectSecretPhrase - challengingSecretPhrase;

    verified <== secretPhrase_diff * secretPhrase_diff;
}

component main {public [challengingSecretPhrase]} = VerifySecretPhrase();