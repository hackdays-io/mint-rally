import { Container, Text } from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import React, { FC } from "react";
import { useLocale } from "src/hooks/useLocale";

const PurchasePointPaid: FC = () => {
  const address = useAddress();
  const { t } = useLocale();

  return (
    <Container maxWidth={1000} mt={{ base: 5, md: 10 }}>
      {address && (
        <>
          <Text pb={5}>{t.POINTS_IN_PROGRESS}</Text>
        </>
      )}
    </Container>
  );
};

export default PurchasePointPaid;
