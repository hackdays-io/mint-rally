import { Localhost, Mumbai, Polygon } from "@thirdweb-dev/chains";
import { magicLink, metamaskWallet, safeWallet } from "@thirdweb-dev/react";
import { useLocale } from "src/hooks/useLocale";
import { useMemo } from "react";

export const chainId = process.env.NEXT_PUBLIC_CHAIN_ID!;
export const activeChain =
  chainId === "80001"
    ? Mumbai
    : chainId === "137"
    ? Polygon
    : { ...Localhost, chainId: 31337 };

export const useWeb3WalletConfig = () => {
  const { t, locale } = useLocale();

  const magicLinkConfig = useMemo(() => {
    const m_config = magicLink({
      apiKey: process.env.NEXT_PUBLIC_MAGIC_LINK_KEY!,
      magicSdkConfiguration: {
        locale: locale === "ja" ? "ja" : "en",
        network: activeChain as any,
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

  const supportedWallets = [
    metamaskWallet(),
    safeWalletConfig,
    magicLinkConfig,
  ];

  return { magicLinkConfig, supportedWallets };
};
