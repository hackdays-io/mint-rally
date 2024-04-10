import {
  Container,
  Button,
  useDisclosure,
  Input,
  Text,
  Flex,
} from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import React, { FC, useCallback, useState } from "react";
import { useLocale } from "src/hooks/useLocale";
import { ConnectWalletModal } from "./../../components/molecules/web3/ConnectWalletModal";

const User: FC = () => {
  const address = useAddress();
  const { t } = useLocale();
  const { onClose } = useDisclosure();
  const {
    isOpen: isConnectWalletOpen,
    onOpen: onConnectWalletOpen,
    onClose: onConnectWalletClose,
  } = useDisclosure();
  const [connecting, setConnecting] = useState<boolean>(false);
  const [value, setValue] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [valueURL, setValueURL] = useState("");

  const handleOpenConnectWallet = useCallback(() => {
    onConnectWalletOpen();
    onClose();
  }, [onConnectWalletOpen, onClose]);

  const handlePayment = async () => {
    const isNumeric = /^-?\d*\.?\d+$/.test(value);
    setIsValid(isNumeric);
    if (isNumeric) {
      try {
        // todo: 署名をダミーデータから変更
        const response = await fetch(
          `/api/points/checkout?amount=${value}&signature=0x681c1341f66238f9e2c44a9e98a3c8eceb0d27ca031dee628490d7772f13a19f31ce708d13be3a662fd43ebd12ddaf0e208869af422a20070ca254da629fe0a61c`
        );
        const data = await response.json();
        // データを処理する
        console.log(data.sessionURL);
        setValueURL(data.sessionURL);
        window.location.href = data.sessionURL;
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue(event.target.value);

  return (
    <Container maxWidth={1000} mt={{ base: 5, md: 10 }}>
      {address ? (
        <>
          <Text pb={5}>{t.PURCHASE}</Text>
          <Flex mb={5}>
            <Input
              w={500}
              value={value}
              onChange={handleChange}
              placeholder={t.POINTS_TO_BE_PURCHASED}
            />
            <Text pl={1}>pt</Text>
          </Flex>
          {!isValid && (
            <Text pb={5} color="red">
              {t.INCORRECT_INPUT}
            </Text>
          )}
          <Button
            backgroundColor="yellow.900"
            color="white"
            onClick={handlePayment}
          >
            {t.PAYMENT}
          </Button>
        </>
      ) : (
        <Button
          backgroundColor="yellow.900"
          color="white"
          onClick={handleOpenConnectWallet}
        >
          {t.SIGN_IN}
        </Button>
      )}
      {(!address || connecting) && (
        <ConnectWalletModal
          setConnecting={setConnecting}
          onClose={onConnectWalletClose}
          isOpen={isConnectWalletOpen}
        />
      )}
    </Container>
  );
};

export default User;
