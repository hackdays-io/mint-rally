import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import {
  ThirdwebProvider,
  magicLink,
  metamaskWallet,
  safeWallet,
} from "@thirdweb-dev/react";
import Layout from "../components/layout";
import { chakraTheme } from "../../utils/chakra-theme";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { GoogleAnalytics } from "nextjs-google-analytics";
import { Localhost, Mumbai, Polygon } from "@thirdweb-dev/chains";
import { useLocale } from "src/hooks/useLocale";
import { useMemo } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Router } from "next/router";
import { createConfig, configureChains, mainnet, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);

const wagmiConfig = createConfig({
  publicClient,
  webSocketPublicClient,
});

config.autoAddCss = false;

const chainId = process.env.NEXT_PUBLIC_CHAIN_ID!;
const activeChain =
  chainId === "80001"
    ? Mumbai
    : chainId === "137"
    ? Polygon
    : { ...Localhost, chainId: 31337 };

const magicLinkConfig = magicLink({
  apiKey: process.env.NEXT_PUBLIC_MAGIC_LINK_KEY!,
  magicSdkConfiguration: {
    locale: "ja",
    network: activeChain as any,
  },
  smsLogin: false,
});

magicLinkConfig.meta.name = "メールアドレス";

function MyApp({ Component, pageProps }: AppProps) {
  Router.events.on("routeChangeStart", () => NProgress.start());
  Router.events.on("routeChangeComplete", () => NProgress.done());
  Router.events.on("routeChangeError", () => NProgress.done());

  const { t } = useLocale();
  const magicLinkConfig = useMemo(() => {
    const m_config = magicLink({
      apiKey: process.env.NEXT_PUBLIC_MAGIC_LINK_KEY!,
      magicSdkConfiguration: {
        locale: "ja",
        network: activeChain as any,
      },
      smsLogin: false,
    });
    m_config.meta.name = t.GET_VIA_EMAIL;
    return m_config;
  }, [t]);

  return (
    <>
      <GoogleAnalytics trackPageViews />
      <WagmiConfig config={wagmiConfig}>
        <ThirdwebProvider
          activeChain={activeChain}
          supportedWallets={[metamaskWallet(), safeWallet(), magicLinkConfig]}
        >
          <ChakraProvider theme={chakraTheme}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ChakraProvider>
        </ThirdwebProvider>
      </WagmiConfig>
    </>
  );
}

export default MyApp;
