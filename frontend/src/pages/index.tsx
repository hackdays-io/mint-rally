import {
  Box,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Spacer,
  Spinner,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import EventCard from "../components/atoms/events/EventCard";
import { useEventRecords } from "../hooks/useEventManager";
import { useChainId, useNetworkMismatch } from "@thirdweb-dev/react";

const Home: NextPage = () => {
  const { records, errors, loading } = useEventRecords();
  const chainId = useChainId();
  const networkMismatched = useNetworkMismatch();
  console.log(chainId, networkMismatched);
  return (
    <Box pb={20}>
      <div>
        <Image
          src="/images/mainImg.png"
          width={1920}
          height={960}
          alt="mainImg"
        />
      </div>
      <Container maxW={800} paddingTop={6}>
        <Flex alignItems="bottom" paddingBottom={6}>
          <Heading>Events</Heading>
          <Spacer></Spacer>
        </Flex>
        {loading ? (
          <Spinner></Spinner>
        ) : (
          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={5}>
            <>
              {records.map((item) => {
                return (
                  <Link
                    href={"/events/" + item.eventRecordId}
                    key={item.eventRecordId.toString()}
                  >
                    <a>
                      <EventCard
                        title={item.name}
                        description={item.description}
                      ></EventCard>
                    </a>
                  </Link>
                );
              })}
            </>
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
};

export default Home;
