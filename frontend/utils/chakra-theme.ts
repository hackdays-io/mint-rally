import { extendTheme } from "@chakra-ui/react";

const colors = {
  mint: {
    bg: "#56F0DE",
    primary: "#552306",
    subtle1: "#A25020",
    subtle2: "#C68762",
    subtle3: "#f0cda9",
    white: "#FFFFFF",
    subtle: "#E3FFFC",
  },
};

export const chakraTheme = extendTheme({
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
