import { Box, Button, HStack, Heading, Text } from "@chakra-ui/react";
import { FC, ReactNode } from "react";
import { useAddress, useChainId, useSwitchChain } from "@thirdweb-dev/react";
import { useLocale } from "../../../hooks/useLocale";
import Image from "next/image";
import SelectMintWallet from "./SelectMintWallet";

type Props = {
  children: ReactNode;
  requiredChainID: number;
  forbiddenText: string;
};

const MintNFTLoginRequired: FC<Props> = ({
  children,
  requiredChainID,
  forbiddenText,
}) => {
  const address = useAddress();
  const chainId = useChainId()!;

  const { t } = useLocale();

  const switchNetwork = useSwitchChain();

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
          <HStack justify="center" mb={2} color="yellow.900">
            <Heading as={"h2"} fontSize={"lg"} alignContent="center">
              {forbiddenText}
            </Heading>
            <Image
              width={45}
              height={45}
              src="/images/events/civitan.png"
              alt="civitan"
            />
          </HStack>
          <SelectMintWallet />
        </Box>
      ) : chainId !== requiredChainID ? (
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
              onClick={() => switchNetwork(requiredChainID)}
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

export default MintNFTLoginRequired;
