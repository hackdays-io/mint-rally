import { Button, HStack, Img, Input, Spacer, Stack } from "@chakra-ui/react";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useConnect } from "@thirdweb-dev/react";
import { FC, useState } from "react";
import { useLocale } from "src/hooks/useLocale";
import { chainId, useMagicLinkConfig } from "src/libs/web3Config";

type Props = {
  selected: (selected: boolean) => void;
};

const MagicLinkConnectButton: FC<Props> = ({ selected }) => {
  const { t } = useLocale();
  const { magicLinkConfig } = useMagicLinkConfig();
  const connect = useConnect();
  const [isSelected, setSelected] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isNotValid, setIsNotValid] = useState<boolean>(true);
  const [enteredEmailAddress, setEnteredEmailAddress] = useState("");
  const handleConnect = async () => {
    setLoading(true);
    try {
      await connect(magicLinkConfig, {
        email: enteredEmailAddress,
        chainId: Number(chainId),
      });
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };
  const EmailIcon = () => (
    <Img src="/images/email.png" alt="email icon" width="24px" />
  );
  return (
    <>
      {!isSelected ? (
        <Button
          w={280}
          leftIcon={<EmailIcon />}
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
          <label>{t.PLEASE_ENTER_EMAIL_ADDRESS}</label>
          <Stack
            width="100%"
            direction={["column", "row"]}
            align={"center"}
            alignContent={"center"}
            justify={"center"}
          >
            <HStack>
              <Button
                leftIcon={<FontAwesomeIcon icon={faArrowLeft} />}
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
                pr={10}
                placeholder={t.EMAIL_ADDRESS}
                disabled={isLoading}
              />
            </HStack>
            <Button
              w={160}
              style={{
                fontWeight: "bold",
                backgroundColor: "#562406",
                color: "#fff",
              }}
              onClick={() => {
                handleConnect();
              }}
              loadingText="Loading..."
              isLoading={isLoading}
              disabled={isNotValid}
            >
              {t.CONNECT}
            </Button>{" "}
          </Stack>
        </>
      )}
    </>
  );
};
export default MagicLinkConnectButton;
