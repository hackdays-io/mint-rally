import { Button, FormLabel, HStack, Input, Stack } from "@chakra-ui/react";
import { faArrowLeft, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useConnectionStatus } from "@thirdweb-dev/react";
import { FC, useState } from "react";
import { useLocale } from "src/hooks/useLocale";
import { useConnectMagic } from "src/hooks/useWallet";

type Props = {
  selected: (selected: boolean) => void;
};

const MagicLinkConnectButton: FC<Props> = ({ selected }) => {
  const { t } = useLocale();
  const connectionStatus = useConnectionStatus();

  const [isSelected, setSelected] = useState<boolean>(false);
  const [isNotValid, setIsNotValid] = useState<boolean>(true);
  const [enteredEmailAddress, setEnteredEmailAddress] = useState("");

  const { handleConnect, isLoading } = useConnectMagic(enteredEmailAddress);

  return (
    <>
      {!isSelected ? (
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
            selected(true);
          }}
        >
          {t.CONNECT_WITH_EMAIL}
        </Button>
      ) : (
        <>
          <FormLabel color="yellow.900">
            {t.PLEASE_ENTER_EMAIL_ADDRESS}
          </FormLabel>
          <Stack
            width="100%"
            direction={["column", "row"]}
            align={"center"}
            alignContent={"center"}
            justify={"center"}
          >
            <HStack mb={{ base: 2, md: 0 }}>
              <Button
                leftIcon={<FontAwesomeIcon icon={faArrowLeft} />}
                p={0}
                background="transparent"
                onClick={() => {
                  selected(false);
                  setSelected(false);
                }}
              />
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
                width={280}
              />
            </HStack>
            <Button
              w={{ md: 100, base: "full" }}
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
        </>
      )}
    </>
  );
};
export default MagicLinkConnectButton;
