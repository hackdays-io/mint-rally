script_dir="$(cd "$(dirname "$0")" && pwd)"
cd "$script_dir"
mkdir -p ../../circuits/build

echo "Compiling circuit..."
circom ../../circuits/SecretPhrase.circom --sym --wasm --r1cs -o ../../circuits/build

if [ ! -f "../../circuits/powersOfTau28_hez_final_12.ptau" ]; then
    echo "Downloading file..."
    wget -P ../../circuits https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau
    echo "File downloaded."
fi

echo "Generating trusted setup..."
snarkjs pks ../../circuits/build/SecretPhrase.r1cs ../../circuits/powersOfTau28_hez_final_12.ptau ../../circuits/build/SecretPhrase.zkey