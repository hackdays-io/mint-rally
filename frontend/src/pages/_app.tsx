import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import Layout from "../components/layout";

const activeChainId = ChainId.Mumbai;

const colors = {
  mint: {
    bg: "#56F0DE",
    primary: "#552306",
    subtle1: "#A25020",
    subtle2: "#C68762",
    white: "#FFFFFF",
    subtle: "#E3FFFC",
  },
};

const theme = extendTheme({
  // https://chakra-ui.com/docs/theming/theme#typography
  fonts: {},
  // デフォルトのカラーモード
  // https://chakra-ui.com/docs/theming/theme#config
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  colors: colors,
  // デフォルトのフォント
  styles: {
    global: {
      body: {
        color: colors.mint.primary,
      },
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
