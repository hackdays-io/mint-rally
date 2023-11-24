import { Box, Button, Flex, Input, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "src/hooks/useLocale";
import { useMintParticipateNFT } from "src/hooks/useMintNFT";
import { Event } from "types/Event";
import AlertMessage from "src/components/atoms/form/AlertMessage";
import { useReward } from "react-rewards";
import { useWallet } from "@thirdweb-dev/react";
import { NFTItem } from "src/components/atoms/nft/NFTItem";
import { useRouter } from "next/router";

type Props = {
  event: Event.EventRecord;
  address: string;
};

export const MintForm: FC<Props> = ({ event, address }) => {
  const { t } = useLocale();
  const {
    query: { secret_phrase },
  } = useRouter();
  const walletMetadata = useWallet()?.getMeta();

  const {
    mint,
    mintMTX,
    isLoading,
    error,
    mintedNFT,
    status,
    isPreparingProof,
  } = useMintParticipateNFT(event, address, event.useMtx);

  const { reward: confettiReward } = useReward("confettiReward", "confetti", {
    elementCount: 100,
    lifetime: 300,
  });
  const { reward: balloonsReward } = useReward("balloonsReward", "balloons", {
    elementCount: 30,
    spread: 80,
  });

  useEffect(() => {
    if (status == "success" && mintedNFT) {
      confettiReward();
      balloonsReward();
    }
  }, [status, mintedNFT]);

  const [enteredSecretPhrase, setEnteredSecretPhrase] = useState("");

  useEffect(() => {
    if (secret_phrase) setEnteredSecretPhrase(secret_phrase.toString());
  }, [secret_phrase]);

  const claimMint = useCallback(async () => {
    if (!event) return;
    if (event.useMtx) {
      await mintMTX(enteredSecretPhrase);
    } else {
      await mint(enteredSecretPhrase);
    }
  }, [event, enteredSecretPhrase, mint, mintMTX]);

  const hideSecretPhraseInput = useMemo(() => {
    return secret_phrase ? true : false;
  }, [secret_phrase]);

  return (
    <>
      {!mintedNFT && (
        <>
          <Text mb={3}>
            {!hideSecretPhraseInput && t.ENTER_SECRET_PHRASE}
            {t.PUSH_MINT_BUTTON}
            {walletMetadata?.name === "MetaMask" &&
              t.ENTER_SECRET_PHRASE_METAMASK}
          </Text>
          <Flex
            alignItems="center"
            justifyContent="center"
            gap="4%"
            flexWrap="wrap"
            color="text.black"
          >
            <Box
              width={{ base: "100%", md: "48%" }}
              mb={{ base: 5, md: 0 }}
              position="relative"
              display={hideSecretPhraseInput ? "none" : "block"}
            >
              <Input
                variant="outline"
                type="text"
                value={enteredSecretPhrase}
                onChange={(e) => setEnteredSecretPhrase(e.target.value)}
                pr={10}
                placeholder={t.INPUT_SECRET_PHRASE}
                backgroundColor={"#fff"}
              />
            </Box>
            <Button
              width={{ base: "100%", md: "48%" }}
              isLoading={isLoading}
              onClick={() => claimMint()}
              background="mint.primary"
              color="white"
              rounded="full"
            >
              {t.CLAIM_NFT}
              <Text as="span" fontSize="10px" ml={event.useMtx ? 2 : 0}>
                {event.useMtx ? t.USE_MTX : ""}
              </Text>
            </Button>
          </Flex>
        </>
      )}
      {error && (
        <AlertMessage title={t.ERROR_MINTING_PARTICIPATION_NFT}>
          {error.reason}
        </AlertMessage>
      )}
      {status == "success" && !mintedNFT && (
        <AlertMessage status="success" mt={3} title={t.YOU_HAVE_CLAIMED_NFT} />
      )}
      {isPreparingProof && (
        <AlertMessage status="success" mt={3} title={t.PREPARING_PROOF} />
      )}
      {mintedNFT && (
        <>
          <AlertMessage status="success" mt={3} title={t.YOU_HAVE_GOT_NFT} />
          <VStack justify="center" mt={5} zIndex={5} position="relative">
            <Box maxW={350}>
              <NFTItem
                nft={mintedNFT}
                tokenId={mintedNFT.tokenId || 0}
                shareURL={false}
                clickable={false}
                address={address}
                showShareButtons={true}
                showViewButtons={true}
              />
            </Box>
            <span id="confettiReward" />
            <span id="balloonsReward" />
          </VStack>
          <VStack justify="center" mt={10}>
            <Text fontSize="sm">{t.GO_SURVEY}</Text>
            <Link href={"https://forms.gle/kx7VykmGwRqhJiQ16"} target="_blank">
              <Button size="sm">{t.SURVEY_BUTTON}</Button>
            </Link>
          </VStack>
        </>
      )}
    </>
  );
};
