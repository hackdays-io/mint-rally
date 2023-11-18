import { Box, Grid, Text } from "@chakra-ui/react";
import { FC, useState } from "react";
import MagicLinkConnectButton from "src/components/atoms/web3/MagicLinkConnectButton";
import MetamaskConnectButton from "src/components/atoms/web3/MetamaskConnectButton";
import SafeConnectButton from "src/components/atoms/web3/SafeConnectButton";
import WalletConnectButton from "src/components/atoms/web3/WalletConnectButton";
import ModalBase from "../common/ModalBase";

type Props = {
  setConnecting: (connecting: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
};

export const ConnectWalletModal: FC<Props> = ({
  setConnecting,
  isOpen,
  onClose,
}) => {
  const [magicLinkSelected, setMagicLinkSelected] = useState<boolean>(false);
  const [safeLinkSelected, setSafeLinkSelected] = useState<boolean>(false);
  const [walletConnectSelected, setWalletConnectSelected] =
    useState<boolean>(false);

  return (
    <>
      <ModalBase maxWidth="600px" onClose={onClose} isOpen={isOpen}>
        <Box mt={8} mb={4}>
          <Text mb={4} textAlign="center" fontWeight="bold" fontSize="xl">
            Welcome to MintRally!
            <br/>
            MintRally へようこそ
          </Text>
          <Grid gap={2} justifyContent="center">
            {!magicLinkSelected &&
              !safeLinkSelected &&
              !walletConnectSelected && <MetamaskConnectButton />}
            {!magicLinkSelected && !safeLinkSelected && (
              <WalletConnectButton
                selected={walletConnectSelected}
                setSelected={setWalletConnectSelected}
                onStartConnect={onClose}
              />
            )}
            {!magicLinkSelected && !walletConnectSelected && (
              <SafeConnectButton
                selected={safeLinkSelected}
                setSelected={setSafeLinkSelected}
                setConnecting={setConnecting}
              />
            )}
            {!safeLinkSelected && !walletConnectSelected && (
              <MagicLinkConnectButton
                selected={magicLinkSelected}
                setSelected={setMagicLinkSelected}
              />
            )}
          </Grid>
        </Box>
          <Box p={4} mb={0}>
            <Text mb={4} textAlign="center" fontWeight="normal" fontSize="sm">
              Please connect your wallet to this website only if you agree to the Terms of Use and Privacy Policy.
              <br/>
              <br/>
              利用規約、プライバシーポリシーにご同意いただいた場合のみ本ウェブサイトにウォレットを接続してください。
            </Text>
          </Box>
      </ModalBase>
    </>
  );
};
