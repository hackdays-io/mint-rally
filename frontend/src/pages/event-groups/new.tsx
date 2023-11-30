import { Heading, Container } from "@chakra-ui/react";
import type { NextPage } from "next";
import LoginRequired from "../../components/atoms/web3/LoginRequired";
import { useLocale } from "../../hooks/useLocale";
import { CreateEventGroupForm } from "src/components/organisms/CreateEventGroupForm";
import { useAddress } from "@thirdweb-dev/react";

export interface EventGroupFormData {
  groupName: string;
}

const NewEventGroupPage: NextPage = () => {
  const { t } = useLocale();
  const address = useAddress();

  return (
    <Container maxW={1000}>
      <Heading as="h1" fontSize="3xl" my={6}>
        {t.CREATE_NEW_EVENT_GROUP}
      </Heading>
      <LoginRequired
        requiredChainID={+process.env.NEXT_PUBLIC_CHAIN_ID!}
        forbiddenText={t.PLEASE_SIGN_IN}
        agreementText={t.AGREEMENT}
      >
        {address && <CreateEventGroupForm address={address} />}
      </LoginRequired>
    </Container>
  );
};

export default NewEventGroupPage;
