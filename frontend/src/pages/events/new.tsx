import { Container, Heading } from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import { NextPage } from "next";
import { useLocale } from "../../hooks/useLocale";
import CreateEventForm from "../../components/organisms/CreateEventForm";

const EventCreate: NextPage = () => {
  const { t } = useLocale();
  // check contract address
  const address = useAddress();

  return (
    <>
      <Container maxW={800} py={6}>
        <Heading as="h1" mb={10}>
          {t.CREATE_NEW_EVENT}
        </Heading>
        {address ? (
          <CreateEventForm address={address} />
        ) : (
          <span>please sign in first</span>
        )}
      </Container>
    </>
  );
};

export default EventCreate;
