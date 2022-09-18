import React, { ReactNode } from "react";
import Head from "next/head";
import Navbar from "./navbar";
import Footer from "./footer";
import { Box } from "@chakra-ui/react";
import MyHead from "./atoms/MyHead";

type Props = {
  children: ReactNode;
  title?: string;
};
const Layout = ({ children }: Props) => (
  <>
    <MyHead></MyHead>
    <Box minHeight="100vh">
      <Navbar />
      <Box>{children}</Box>
    </Box>
  </>
);
export default Layout;
