import React, { ReactNode } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import { Box, Grid } from "@chakra-ui/react";
import MyHead from "./atoms/MyHead";
import { Maintenance } from "./organisms/Maintenance";

type Props = {
  children: ReactNode;
  title?: string;
};
const Layout = ({ children }: Props) => (
  <>
    <MyHead></MyHead>
    <Grid
      gridTemplateColumns="100%"
      gridTemplateRows="auto 1fr auto"
      minHeight="100vh"
    >
      <Navbar />
      <Box>{children}</Box>
      <Footer />
    </Grid>
    <Maintenance />
  </>
);
export default Layout;
