import {
  Box,
  Button,
  Divider,
  FormLabel,
  HStack,
  Input,
  Stack,
} from "@chakra-ui/react";
import { faArrowLeft, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useConnectionStatus } from "@thirdweb-dev/react";
import { FC, useState } from "react";
import { useLocale } from "src/hooks/useLocale";
import { useConnectMagic } from "src/hooks/useWallet";

type Props = {
  selected: boolean;
  setSelected: (selected: boolean) => void;
};

const MagicLinkConnectButton: FC<Props> = ({ selected, setSelected }) => {
  const { t } = useLocale();
  const connectionStatus = useConnectionStatus();

  const [isNotValid, setIsNotValid] = useState<boolean>(true);
  const [enteredEmailAddress, setEnteredEmailAddress] = useState("");

  const { handleConnect, isLoading } = useConnectMagic(enteredEmailAddress);

  return (
    <>
      {!selected ? (
        <Button
          w={280}
          leftIcon={<FontAwesomeIcon icon={faEnvelope} />}
          style={{
            fontWeight: "bold",
            backgroundColor: "#562406",
            color: "#fff",
          }}
          onClick={() => {
            setSelected(true);
          }}
        >
          {t.CONNECT_WITH_EMAIL}
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
                setSelected(false);
              }}
            >
              Back
            </Button>
          </HStack>
          <Divider borderColor="yellow.900" mb={4} />
          <FormLabel color="yellow.900">
            {t.PLEASE_ENTER_EMAIL_ADDRESS}
          </FormLabel>
          <Stack
            width="100%"
            direction={["column", "row"]}
            align={"center"}
            alignContent={"center"}
            justify={"center"}
            gap={2}
          >
            <Input
              variant="outline"
              type="text"
              backgroundColor={"#fff"}
              onChange={(e) => {
                setEnteredEmailAddress(e.target.value);
                setIsNotValid(!e.target.value.includes("@"));
              }}
              placeholder={t.EMAIL_ADDRESS}
              disabled={["unknown", "connecting", "connected"].includes(
                connectionStatus
              )}
              width="full"
            />
            <Button
              w={{ base: "full", md: "130px" }}
              style={{
                fontWeight: "bold",
                backgroundColor: "#562406",
                color: "#fff",
              }}
              onClick={() => {
                handleConnect();
              }}
              disabled={
                ["unknown", "connecting", "connected"].includes(
                  connectionStatus
                ) ||
                isNotValid ||
                isLoading
              }
              isLoading={["connecting"].includes(connectionStatus) || isLoading}
            >
              {t.CONNECT}
            </Button>
          </Stack>
        </Box>
      )}
    </>
  );
};
export default MagicLinkConnectButton;
