import { Localhost, Mumbai, Polygon } from "@thirdweb-dev/chains";
import {
  magicLink,
  metamaskWallet,
  safeWallet,
  walletConnect,
} from "@thirdweb-dev/react";
import { useLocale } from "src/hooks/useLocale";
import { useMemo } from "react";

export const chainId = process.env.NEXT_PUBLIC_CHAIN_ID!;
export const activeChain =
  chainId === "80001"
    ? { ...Mumbai, rpc: [process.env.NEXT_PUBLIC_PROVIDER_RPC!, ...Mumbai.rpc] }
    : chainId === "137"
    ? Polygon
    : { ...Localhost, rpc: ["http://localhost:8545"], chainId: 31337 };

export const useWeb3WalletConfig = () => {
  const { t, locale } = useLocale();

  const magicLinkConfig = useMemo(() => {
    const m_config = magicLink({
      apiKey: process.env.NEXT_PUBLIC_MAGIC_LINK_KEY!,
      magicSdkConfiguration: {
        locale: locale === "ja" ? "ja" : "en",
      },
      smsLogin: false,
    });
    m_config.meta.name = t.GET_VIA_EMAIL;
    m_config.meta.iconURL = "/images/magiclink.svg";
    return m_config;
  }, [t]);

  const safeWalletConfig = useMemo(() => {
    const s_config = safeWallet();
    s_config.meta.iconURL = "/images/safe_black.png";
    return s_config;
  }, []);

  const metamaskConfig = useMemo(() => {
    return metamaskWallet();
  }, []);

  const walletConnectConfig = useMemo(() => {
    return walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID!,
      qrModalOptions: {
        themeMode: "light",
      },
    });
  }, []);

  const supportedWallets = [
    metamaskConfig,
    safeWalletConfig,
    magicLinkConfig,
    walletConnectConfig,
  ];

  return { magicLinkConfig, walletConnectConfig, supportedWallets };
};
