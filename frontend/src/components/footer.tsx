import { Box, Grid, Link, Text } from "@chakra-ui/react";
import { useLocale } from "src/hooks/useLocale";

const Footer = () => {
  const { t } = useLocale();

  return (
    <Box padding={3} textAlign="center" color="mint.front">
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
        <Link href="https://twitter.com/mint_rally" target="_blank">
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
            X
          </Box>
        </Link>
      </Box>

      <Grid
        gap={{ base: 2, md: 4 }}
        mt={3}
        gridTemplateColumns={{ base: "1fr", md: "auto auto auto" }}
        justifyContent="center"
      >
        <Link
          href="https://hackdays.notion.site/86dea1026e4943c180f806027d200815?pvs=4"
          target="_blank"
          fontSize="sm"
        >
          {t.AGREEMENT_TERMS}
        </Link>
        <Link
          href="https://hackdays.notion.site/d13993b3865344d6b6d754821b057a10?pvs=4"
          target="_blank"
          fontSize="sm"
        >
          {t.AGREEMENT_PRIVACY}
        </Link>
        <Link
          href="https://hackdays.notion.site/1bccde1919f04d78a5b0d5b148c65f11?pvs=4"
          target="_blank"
          fontSize="sm"
        >
          {t.AGREEMENT_SCTA}
        </Link>
      </Grid>

      <Text mt={2}>© 2023 Hackdays project</Text>
    </Box>
  );
};

export default Footer;
