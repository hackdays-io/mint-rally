import axios from "axios";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import { useCallback, useState } from "react";
const { buildPoseidon } = require("circomlibjs");

export const useHashPoseidon = () => {
  const hash = useCallback(async (message: string) => {
    const hexSecretPhrase = keccak256(toUtf8Bytes(message));
    const challengingSecretPhrase = [hexSecretPhrase];
    const poseidon = await buildPoseidon();
    const poseidonHash = poseidon(challengingSecretPhrase);
    const resultString = poseidon.F.toString(poseidonHash);
    return resultString;
  }, []);

  return { hash };
};

export const useGenerateProof = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { hash } = useHashPoseidon();

  const generateProof = useCallback(
    async (secretPhrase: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const hashedSecretPhrase = await hash(secretPhrase);
        const {
          data,
        }: { data: { proofCalldata: any[]; publicInputCalldata: any[] } } =
          await axios.post("/api/proof", {
            correctSecretPhraseHash: hashedSecretPhrase,
            challengingSecretPhrase: keccak256(toUtf8Bytes(secretPhrase)),
          });
        setIsLoading(false);
        return data;
      } catch (error: any) {
        setError(error);
        setIsLoading(false);
      }
    },
    [hash]
  );

  return { isLoading, error, generateProof };
};
