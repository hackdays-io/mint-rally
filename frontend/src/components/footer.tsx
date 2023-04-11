import { Box, Text } from "@chakra-ui/react";
import Link from "next/link";

const Footer = () => (
  <Box padding={3} textAlign="center" color="mint.front">
    <Text>© 2023 Hackdays project</Text>
    <Box mt={2}>
      <Link href="https://github.com/hackdays-io/mint-rally" target="_blank">
        <Box
          cursor="pointer"
          as="span"
          py="1"
          px="3"
          backgroundColor="mint.bg"
          borderRadius="full"
          fontSize="sm"
          color="mint.primary"
          fontWeight="bold"
        >
          Github
        </Box>
      </Link>
      <Link href="https://discord.gg/4hJefCEYKS" target="_blank">
        <Box
          cursor="pointer"
          as="span"
          py="1"
          px="3"
          ml={2}
          backgroundColor="mint.bg"
          borderRadius="full"
          fontSize="sm"
          color="mint.primary"
          fontWeight="bold"
        >
          Discord
        </Box>
      </Link>
    </Box>
  </Box>
);
export default Footer;
