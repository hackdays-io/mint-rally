import { Button, HStack, Heading, Img, Input } from "@chakra-ui/react";
import { magicLink, useConnect } from "@thirdweb-dev/react";
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
  const [enteredEmailAddress, setEnteredEmailAddress] = useState("");
  const handleConnect = async () => {
    await connect(magicLinkConfig, {
      email: enteredEmailAddress,
      chainId: Number(chainId),
    });
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
          <HStack>
            <Input
              variant="outline"
              type="text"
              backgroundColor={"#fff"}
              onChange={(e) => setEnteredEmailAddress(e.target.value)}
              pr={10}
              placeholder={t.EMAIL_ADDRESS}
            />
            <Button
              w={260}
              style={{
                fontWeight: "bold",
                backgroundColor: "#562406",
                color: "#fff",
              }}
              onClick={() => {
                handleConnect();
              }}
            >
              {t.CONNECT}
            </Button>{" "}
          </HStack>
        </>
      )}
    </>
  );
};
export default MagicLinkConnectButton;
