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
    <Container maxW={800}>
      <Heading as="h1" mt={4} mb={6}>
        {t.CREATE_NEW_EVENT_GROUP}
      </Heading>
      <LoginRequired
        requiredChainID={Number(process.env.NEXT_PUBLIC_CHAIN_ID!)}
        forbiddenText={t.PLEASE_SIGN_IN}
      >
        {address && <CreateEventGroupForm address={address} />}
      </LoginRequired>
    </Container>
  );
};

export default NewEventGroupPage;
