import { Button, FormLabel, HStack, Input, Stack } from "@chakra-ui/react";
import { faArrowLeft, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useConnect, useConnectionStatus } from "@thirdweb-dev/react";
import { FC, useState } from "react";
import { useLocale } from "src/hooks/useLocale";
import { chainId, useWeb3WalletConfig } from "src/libs/web3Config";

type Props = {
  selected: (selected: boolean) => void;
};

const GetWithMagicLinkButton: FC<Props> = ({ selected }) => {
  const { t } = useLocale();
  const { magicLinkConfig } = useWeb3WalletConfig();
  const connect = useConnect();
  const connectionStatus = useConnectionStatus();

  const [isSelected, setSelected] = useState<boolean>(false);
  const [isNotValid, setIsNotValid] = useState<boolean>(true);
  const [enteredEmailAddress, setEnteredEmailAddress] = useState("");
  const handleConnect = async () => {
    try {
      await connect(magicLinkConfig, {
        email: enteredEmailAddress,
        chainId: Number(chainId),
      });
    } catch (e) {
      console.log(e);
    }
  };

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
          {t.GET_NFT_USING_EMAIL}
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
            <HStack mb={{ base: 2, md: 0 }} maxW="100%">
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
              isLoading={["connecting"].includes(connectionStatus)}
              disabled={
                ["unknown", "connecting", "connected"].includes(
                  connectionStatus
                ) || isNotValid
              }
            >
              {t.CONNECT}
            </Button>
          </Stack>
        </>
      )}
    </>
  );
};
export default GetWithMagicLinkButton;
