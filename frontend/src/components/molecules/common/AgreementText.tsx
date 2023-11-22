import { Link, Text } from "@chakra-ui/react";
import { FC } from "react";
import { useLocale } from "src/hooks/useLocale";

const AgreementText: FC = () => {
  const { t, locale } = useLocale();

  return (
    <Text
      textAlign="left"
      fontSize="sm"
      maxW={{ md: "400px" }}
      margin="0 auto"
      mt={5}
    >
      {locale === "ja" ? (
        <>
          <Link
            href="https://hackdays.notion.site/86dea1026e4943c180f806027d200815?pvs=4"
            target="_blank"
          >
            {t.AGREEMENT_TERMS}
          </Link>
          ,{" "}
          <Link
            href="https://hackdays.notion.site/d13993b3865344d6b6d754821b057a10?pvs=4"
            target="_blank"
          >
            {t.AGREEMENT_PRIVACY}
          </Link>{" "}
          {t.AGREEMENT_TEXT}
        </>
      ) : (
        <>
          {t.AGREEMENT_TEXT},{" "}
          <Link
            href="https://hackdays.notion.site/86dea1026e4943c180f806027d200815?pvs=4"
            target="_blank"
          >
            {t.AGREEMENT_TERMS}
          </Link>
          ,{" "}
          <Link
            href="https://hackdays.notion.site/d13993b3865344d6b6d754821b057a10?pvs=4"
            target="_blank"
          >
            {t.AGREEMENT_PRIVACY}
          </Link>
          .
        </>
      )}
    </Text>
  );
};

export default AgreementText;
