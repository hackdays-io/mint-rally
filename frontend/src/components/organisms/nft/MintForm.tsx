import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { useLocale } from "src/hooks/useLocale";
import { useMintParticipateNFT } from "src/hooks/useMintNFT";
import { Event } from "types/Event";
import { ipfs2http } from "utils/ipfs2http";
import AlertMessage from "src/components/atoms/form/AlertMessage";
import { useReward } from "react-rewards";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useWallet } from "@thirdweb-dev/react";

type Props = {
  event: Event.EventRecord;
  address: string;
};

export const MintForm: FC<Props> = ({ event, address }) => {
  const { t } = useLocale();
  const walletMetadata = useWallet()?.getMeta();

  const { mint, mintMTX, isLoading, error, mintedNFT, status } =
    useMintParticipateNFT(event, address, event.useMtx);

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
  const [passwordType, setPasswordType] = useState("password");

  const togglePasswordVisibility = () => {
    setPasswordType((prevType) =>
      prevType === "password" ? "text" : "password"
    );
  };

  const claimMint = async () => {
    if (!event) return;
    if (event.useMtx) {
      await mintMTX(enteredSecretPhrase);
    } else {
      await mint(enteredSecretPhrase);
    }
  };

  return (
    <>
      {!mintedNFT && (
        <Flex
          width="100%"
          justifyContent="space-between"
          alignItems="end"
          flexWrap="wrap"
        >
          <Text mb={2}>
            {t.ENTER_SECRET_PHRASE}
            {walletMetadata?.name === "MetaMask" &&
              t.ENTER_SECRET_PHRASE_METAMASK}
          </Text>
          <Box
            width={{ base: "100%", md: "48%" }}
            mb={{ base: 5, md: 0 }}
            position="relative"
          >
            <Input
              variant="outline"
              type={passwordType}
              value={enteredSecretPhrase}
              onChange={(e) => setEnteredSecretPhrase(e.target.value)}
              pr={10}
              placeholder={t.INPUT_SECRET_PHRASE}
            />
            <Box
              as="span"
              position="absolute"
              right={3}
              top={2}
              zIndex={5}
              cursor="pointer"
            >
              {passwordType === "password" ? (
                <FontAwesomeIcon
                  onClick={togglePasswordVisibility}
                  icon={faEye}
                />
              ) : (
                <FontAwesomeIcon
                  onClick={togglePasswordVisibility}
                  icon={faEyeSlash}
                />
              )}
            </Box>
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
            <Text as="span" fontSize="10px">
              {event.useMtx ? t.USE_MTX : ""}
            </Text>
          </Button>
        </Flex>
      )}
      {error && <AlertMessage>{error.reason}</AlertMessage>}
      {status == "success" && !mintedNFT && (
        <AlertMessage status="success" mt={3} title={t.YOU_HAVE_CLAIMED_NFT} />
      )}
      {mintedNFT && (
        <>
          <AlertMessage status="success" mt={3} title={t.YOU_HAVE_GOT_NFT} />
          <VStack justify="center" mt={5}>
            <img src={ipfs2http(mintedNFT.image)} width="200" height="200" />
            <span id="confettiReward" />
            <span id="balloonsReward" />
          </VStack>
          <VStack justify="center" mt={10}>
            <Text>{t.GO_SURVEY}</Text>
            <Link href={"https://forms.gle/kx7VykmGwRqhJiQ16"} target="_blank">
              <Button>{t.SURVEY_BUTTON}</Button>
            </Link>
          </VStack>
        </>
      )}
    </>
  );
};
