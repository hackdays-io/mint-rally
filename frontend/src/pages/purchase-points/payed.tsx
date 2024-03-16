import { Container, Button, useDisclosure, Input, Text, Flex } from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import React, { FC, useCallback, useState  } from "react";
import { useLocale } from "src/hooks/useLocale";
import { ConnectWalletModal } from "./../../components/molecules/web3/ConnectWalletModal";

const User: FC = () => {
  const address = useAddress();
  const { t } = useLocale();
  
  return (
    <Container maxWidth={1000} mt={{ base: 5, md: 10 }}>
        {address &&
            <>
                <Text pb={5}>{t.POINTS_IN_PROGRESS}</Text>
            </>
        }    
    </Container>
  );
};

export default User;