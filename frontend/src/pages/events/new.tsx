import { Container, Heading } from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import { NextPage } from "next";
import { useLocale } from "../../hooks/useLocale";
import CreateEventForm from "../../components/organisms/CreateEventForm";
import LoginRequired from "src/components/atoms/web3/LoginRequired";

const EventCreate: NextPage = () => {
  const { t } = useLocale();
  const address = useAddress();

  return (
    <>
      <Container maxW={1000} py={6}>
        <Heading as="h1" fontSize="3xl" color="text.black" mb={10}>
          {t.CREATE_NEW_EVENT}
        </Heading>

        <LoginRequired
          requiredChainID={+process.env.NEXT_PUBLIC_CHAIN_ID!}
          forbiddenText={t.PLEASE_SIGN_IN}
          agreementText={t.AGREEMENT}
        >
          {address && <CreateEventForm address={address} />}
        </LoginRequired>
      </Container>
    </>
  );
};

export default EventCreate;
