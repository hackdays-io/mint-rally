import { Button, Img } from "@chakra-ui/react";
import { metamaskWallet, useConnect } from "@thirdweb-dev/react";
import { FC } from "react";
import { useLocale } from "src/hooks/useLocale";
import { chainId } from "src/libs/web3Config";

const MetamaskConnectButton: FC = () => {
  const { t } = useLocale();
  const metamaskConfig = metamaskWallet();
  const connect = useConnect();
  const handleConnect = async () => {
    await connect(metamaskConfig, { chainId: Number(chainId) });
  };
  const MetamaskIcon = () => (
    <Img src="/images/metamask.png" alt="metamask" width="24px" />
  );
  return (
    <>
      <Button
        w={280}
        leftIcon={<MetamaskIcon />}
        style={{
          fontWeight: "bold",
          backgroundColor: "#562406",
          color: "#fff",
        }}
        onClick={() => {
          handleConnect();
        }}
      >
        {t.GET_NFT_USING_METAMASK}
      </Button>
    </>
  );
};
export default MetamaskConnectButton;
