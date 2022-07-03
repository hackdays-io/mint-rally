import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import Layout from "../components/layout";

const activeChainId = ChainId.Mumbai;

const theme = extendTheme({
  // デフォルトのフォント
  // https://chakra-ui.com/docs/theming/theme#typography
  fonts: {},
  // デフォルトのカラーモード
  // https://chakra-ui.com/docs/theming/theme#config
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  colors: {
    mint: {
      bg: "#56F0DE",
      front: "#552306",
      white: '#FFFFFF',
      subtle: '#E3FFFC'
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={activeChainId}>
      <ChakraProvider theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </ThirdwebProvider>
  );
}

export default MyApp;
