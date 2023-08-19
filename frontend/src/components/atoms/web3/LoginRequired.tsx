import { Box, Button, HStack, Heading, Img, Text } from "@chakra-ui/react";
import { FC, ReactNode } from "react";
import {
  useAddress,
  useChainId,
  useSwitchChain,
  useNetworkMismatch,
} from "@thirdweb-dev/react";
import { useLocale } from "../../../hooks/useLocale";
import SelectMintWallet from "src/components/molecules/web3/SelectMintWallet";
import { Mumbai } from "@thirdweb-dev/chains";

type Props = {
  children: ReactNode;
  requiredChainID: number;
  forbiddenText: string;
};

const LoginRequired: FC<Props> = ({
  children,
  requiredChainID,
  forbiddenText,
}) => {
  const address = useAddress();

  const { t } = useLocale();
  const isMismatched = useNetworkMismatch();

  const switchChain = useSwitchChain();

  return (
    <>
      {!address ? (
        <Box
          background="linear-gradient(86.52deg, #B5DFDC 0%, #DDED6C 97.14%)"
          borderRadius="16px"
          width="100%"
          p={6}
          textAlign="center"
        >
          <HStack justify="center">
            <Heading as={"h2"} mb={2} fontSize={"lg"} alignContent="center">
              {forbiddenText}
            </Heading>
            <Img src="/images/events/civitan.png" alt="civitan" />
          </HStack>
          <SelectMintWallet />
        </Box>
      ) : isMismatched ? (
        <Box
          background="linear-gradient(86.52deg, #B5DFDC 0%, #DDED6C 97.14%)"
          borderRadius="16px"
          width="100%"
          p={6}
          textAlign="center"
        >
          {t.PLEASE_SWITCH_NETWORK}
          <Text fontSize="xl">
            <Button
              onClick={() => switchChain(Mumbai.chainId)}
              style={{
                fontWeight: "bold",
                backgroundColor: "#562406",
                color: "#fff",
              }}
            >
              {t.SWITCH_NETWORK}
            </Button>
          </Text>
        </Box>
      ) : (
        children
      )}
    </>
  );
};

export default LoginRequired;
