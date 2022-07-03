import React, { ReactNode } from "react";
import Head from "next/head";
import Navbar from "./navbar";
import Footer from "./footer";
import { Box } from "@chakra-ui/react";

type Props = {
  children: ReactNode;
  title?: string;
};
const Layout = ({ children }: Props) => (
  <>
    <Head>
      <title>Mint Rally</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <Box minHeight="100vh">
      <Navbar />
      <Box>{children}</Box>
    </Box>
  </>
);
export default Layout;
