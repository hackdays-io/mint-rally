import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import Layout from "../components/layout";
import { chakraTheme } from "../../utils/chakra-theme";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { GoogleAnalytics } from "nextjs-google-analytics";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Router } from "next/router";
import { activeChain, useWeb3WalletConfig } from "../libs/web3Config";

config.autoAddCss = false;

function MyApp({ Component, pageProps }: AppProps) {
  Router.events.on("routeChangeStart", () => NProgress.start());
  Router.events.on("routeChangeComplete", () => NProgress.done());
  Router.events.on("routeChangeError", () => NProgress.done());
  const { supportedWallets } = useWeb3WalletConfig();

  return (
    <>
      <GoogleAnalytics trackPageViews />
      <ThirdwebProvider
        activeChain={activeChain}
        supportedWallets={supportedWallets}
        clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!}
        theme="light"
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
