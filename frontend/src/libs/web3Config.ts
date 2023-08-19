import { Localhost, Mumbai, Polygon } from "@thirdweb-dev/chains";
import { magicLink, metamaskWallet, safeWallet, walletConnect } from "@thirdweb-dev/react";
import { useLocale } from "src/hooks/useLocale";
import { useMemo } from "react";

export const chainId = process.env.NEXT_PUBLIC_CHAIN_ID!;
export const thirdwebClientID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!;
export const walletConnectProjectID = process.env.NEXT_PUBLIC_WALETCONNECT_PROJECT_ID!;
export const activeChain =
  chainId === "80001"
    ? Mumbai
    : chainId === "137"
      ? Polygon
      : { ...Localhost, chainId: 31337 };

export const useMagicLinkConfig = () => {
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
    return m_config
  }, [t]);


  const supportedWallets = [metamaskWallet(), safeWallet(), magicLinkConfig, walletConnect({ projectId: walletConnectProjectID })];
  return { magicLinkConfig, supportedWallets }
};
