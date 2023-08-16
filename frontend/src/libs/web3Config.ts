import { Localhost, Mumbai, Polygon } from "@thirdweb-dev/chains";
import { magicLink } from "@thirdweb-dev/react";
import { useLocale } from "src/hooks/useLocale";
import { useMemo } from "react";

export const chainId = process.env.NEXT_PUBLIC_CHAIN_ID!;
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
        network: activeChain as any,
      },
      smsLogin: false,
    });
    console.log(m_config);
    m_config.meta.name = t.GET_VIA_EMAIL;
    return m_config;
  }, [t]);
  return { magicLinkConfig }
};
