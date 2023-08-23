import {
  Box,
  Button,
  Divider,
  FormLabel,
  HStack,
  Img,
  Input,
  Stack,
  Tag,
} from "@chakra-ui/react";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Polygon } from "@thirdweb-dev/chains";
import {
  metamaskWallet,
  safeWallet,
  useConnect,
  useConnectionStatus,
  useDisconnect,
  useWallet,
} from "@thirdweb-dev/react";
import { FC, useCallback, useState } from "react";
import { useLocale } from "src/hooks/useLocale";
import { chainId } from "src/libs/web3Config";

type Props = {
  selected: (selected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
};

const SafeConnectButton: FC<Props> = ({ selected, setConnecting }) => {
  const { t } = useLocale();
  const safeConfig = safeWallet();
  const metamaskConfig = metamaskWallet();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const connectionStatus = useConnectionStatus();

  const [isSelected, setSelected] = useState<boolean>(false);

  const [safeAddress, setSafeAddress] = useState("");

  const personalWallet = useWallet();

  const handleMetamaskConnect = useCallback(async () => {
    await connect(metamaskConfig, { chainId: Number(chainId) });
  }, [metamaskConfig, connect]);

  const handleBack = useCallback(async () => {
    if (personalWallet) {
      await disconnect();
    }
    setConnecting(false);
    setSelected(false);
    selected(false);
  }, [selected, setSelected, setConnecting, disconnect, personalWallet]);

  const handleConnect = useCallback(async () => {
    if (!personalWallet) return;
    await connect(safeConfig, { chain: Polygon, safeAddress, personalWallet });
    setConnecting(false);
    setSelected(false);
    selected(false);
  }, [connect, personalWallet, safeAddress, safeConfig]);

  const SafeIcon = () => (
    <Img src="/images/safe.png" alt="metamask" width="20px" />
  );

  return (
    <>
      {!isSelected ? (
        <Button
          w={280}
          leftIcon={<SafeIcon />}
          style={{
            fontWeight: "bold",
            backgroundColor: "#562406",
            color: "#fff",
          }}
          onClick={() => {
            setConnecting(true);
            setSelected(true);
            selected(true);
          }}
        >
          {t.CONNECT_WITH_SAFE}
        </Button>
      ) : (
        <Box maxW="100%" width="400px" textAlign="left">
          <HStack mb={{ base: 2, md: 0 }}>
            <Button
              leftIcon={<FontAwesomeIcon icon={faArrowLeft} />}
              _hover={{ background: "transparent" }}
              p={0}
              background="transparent"
              onClick={() => {
                handleBack();
              }}
            >
              Back
            </Button>
          </HStack>
          <Divider borderColor="yellow.900" mb={4} />

          <FormLabel color="yellow.900">1. {t.CONNECT_WITH_METAMASK}</FormLabel>

          {personalWallet ? (
            <Tag backgroundColor="mintGreen.100" size="lg">
              OK
            </Tag>
          ) : (
            <Button
              style={{
                fontWeight: "bold",
                backgroundColor: "#562406",
                color: "#fff",
              }}
              onClick={() => {
                handleMetamaskConnect();
              }}
            >
              {t.CONNECT_WITH_METAMASK}
            </Button>
          )}

          <FormLabel color="yellow.900" mt={5}>
            2. {t.INPUT_SAFE_WALLET_ADDRESS}
          </FormLabel>
          <Stack>
            <Input
              background="white"
              placeholder={t.INPUT_SAFE_WALLET_ADDRESS}
              onChange={(e) => {
                setSafeAddress(e.target.value);
              }}
              value={safeAddress}
              disabled={["unknown", "connecting"].includes(connectionStatus)}
            />
          </Stack>

          <Button
            onClick={() => {
              handleConnect();
            }}
            background="yellow.900"
            color="white"
            width="full"
            mt={5}
            disabled={
              !safeAddress ||
              safeAddress.length !== 42 ||
              !personalWallet ||
              ["unknown", "connecting"].includes(connectionStatus)
            }
            isLoading={["connecting"].includes(connectionStatus)}
          >
            {t.CONNECT}
          </Button>
        </Box>
      )}
    </>
  );
};
export default SafeConnectButton;
