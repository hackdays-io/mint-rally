import { extendTheme } from "@chakra-ui/react";

const colors = {
  text: {
    black: "#000000",
    white: "#FFFFFF",
  },
  mint: {
    bg: "#56F0DE",
    primary: "#552306",
    subtle1: "#A25020",
    subtle2: "#C68762",
    subtle3: "#f0cda9",
    white: "#FFFFFF",
    subtle: "#E3FFFC",
  },
  grey: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#eeeeee",
    300: "#e0e0e0",
    400: "#bdbdbd",
    500: "#9e9e9e",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },
  mintGreen: {
    50: "#effefb",
    100: "#c1fdf4",
    200: "#95faeb",
    300: "#56f0de",
    400: "#26dbcc",
    500: "#0dbfb3",
    600: "#079a93",
    700: "#0a7b77",
    800: "#0c615f",
    900: "#10514f",
  },
  yellow: {
    50: "#fefbe8",
    100: "#fff6c2",
    200: "#ffea88",
    300: "#ffd743",
    400: "#ffbf10",
    500: "#efa503",
    600: "#ce7d00",
    700: "#87450c",
    800: "#733810",
    900: "#552306",
  },
  blue: {
    50: "#ebf8ff",
    100: "#bee3f8",
    200: "#90cdf4",
    300: "#63b3ed",
    400: "#4299e1",
    500: "#3182ce",
    600: "#2b6cb0",
    700: "#2c5282",
    800: "#2a4365",
    900: "#1a365d",
  },
  red: {
    50: "#fff5f5",
    100: "#fed7d7",
    200: "#feb2b2",
    300: "#fc8181",
    400: "#f56565",
    500: "#e53e3e",
    600: "#c53030",
    700: "#9b2c2c",
    800: "#822727",
    900: "#63171b",
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
  colors,
  // デフォルトのフォント
  styles: {
    global: {
      body: {
        color: colors.text.black,
      },
    },
  },
});
