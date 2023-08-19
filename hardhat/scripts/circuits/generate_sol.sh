script_dir="$(cd "$(dirname "$0")" && pwd)"
cd "$script_dir"
echo "Generating solidity verifier..."
snarkjs zkey export solidityverifier ../../circuits/build/SecretPhrase.zkey ../../contracts/SecretPhraseVerifier_generated.sol