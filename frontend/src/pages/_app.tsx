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

config.autoAddCss = false;

const chainId = process.env.NEXT_PUBLIC_CHAIN_ID!;
const activeChain =
  chainId === "80001"
    ? Mumbai
    : chainId === "137"
    ? Polygon
    : { ...Localhost, chainId: 31337 };

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <GoogleAnalytics trackPageViews />
      <ThirdwebProvider
        activeChain={activeChain}
        supportedWallets={[
          metamaskWallet(),
          safeWallet(),
          magicLink({
            apiKey: process.env.NEXT_PUBLIC_MAGIC_LINK_KEY!,
            magicSdkConfiguration: {
              locale: "ja",
              network: activeChain as any,
            },
            smsLogin: false,
          }),
        ]}
      >
        <ChakraProvider theme={chakraTheme}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ChakraProvider>
      </ThirdwebProvider>
    </>
  );
}

export default MyApp;
