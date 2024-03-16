import { Container, Button, useDisclosure, Input, Text, Flex } from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import React, { FC, useCallback, useState  } from "react";
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
  const [value, setValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  const handleOpenConnectWallet = useCallback(() => {
    onConnectWalletOpen();
    onClose();
  }, [onConnectWalletOpen, onClose]);

  const handlePayment = () => {
    const isNumeric = /^-?\d*\.?\d+$/.test(value);
    setIsValid(isNumeric);
    if(isNumeric){}
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value);
  
  return (
    <Container maxWidth={1000} mt={{ base: 5, md: 10 }}>
        {address ?
            <>
                <Text pb={5}>{t.PURCHASE}</Text>
                <Flex mb={5}>
                    <Input w={500} value={value} onChange={handleChange} placeholder={t.POINTS_TO_BE_PURCHASED}/>
                    <Text pl={1}>pt</Text>
                </Flex>
                {!isValid && <Text pb={5} color="red">{t.INCORRECT_INPUT}</Text>}
                <Button
                    backgroundColor="yellow.900"
                    color="white"
                    onClick={handlePayment}
                >
                    {t.PAYMENT}
                </Button>
            </>
            : 
            <Button
                backgroundColor="yellow.900"
                color="white"
                onClick={handleOpenConnectWallet}
            >
                {t.SIGN_IN}
            </Button>
        }
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