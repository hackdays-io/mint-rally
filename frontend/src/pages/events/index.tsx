import { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Spacer,
  Spinner,
  VStack,
} from "@chakra-ui/react";

import EventCard from "../../components/atoms/events/EventCard";
import { Event } from "types/Event";
import { useLocale } from "../../hooks/useLocale";
import { useEvents } from "src/hooks/useEvent";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Paginate from "src/components/atoms/events/Paginate";

const Events: NextPage = () => {
  const router = useRouter();
  const { t } = useLocale();
  const { events, isLoading, countData, setCurrentCursor, COUNT_PER_PAGE } =
    useEvents();
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const pageChanged = (page: number) => {
    router.push("/events?page=" + page);
  };
  useEffect(() => {
    if (router.isReady) {
      if (router.query?.page) {
        setCurrentPage(Number(router.query.page));
        setCurrentCursor((Number(router.query.page) - 1) * COUNT_PER_PAGE);
      } else {
        setCurrentPage(1);
        setCurrentCursor(0);
      }
    }
  }, [router.query?.page]);

  return (
    <>
      <Box width="100%" mb={6}>
        <div>
          <Image
            src="/images/events/listpage_header.jpg"
            alt="banner image"
            width={"1440px"}
            height={"240px"}
            layout="responsive"
          />
        </div>
      </Box>
      <Container maxW={800} paddingTop={6}>
        <Flex alignItems="bottom" paddingBottom={6}>
          <Heading color={"black"} fontSize={"3xl"} mb={5}>
            {t.EVENTS}
          </Heading>
          <Spacer></Spacer>
          <Link href="/events/new">
            <Button bg="#562406" color="white">
              {t.CREATE_NEW_EVENT}
            </Button>
          </Link>
        </Flex>
        {isLoading ? (
          <Spinner></Spinner>
        ) : (
          <VStack spacing={5} align="stretch">
            <>
              <Paginate
                pageCount={Math.ceil(countData / COUNT_PER_PAGE)}
                pageRangeDisplayed={COUNT_PER_PAGE}
                currentPage={currentPage!}
                pageChanged={pageChanged}
              />
              {events.map((item: Event.EventRecord) => {
                return (
                  <Link
                    href={"/events/" + item.eventRecordId}
                    key={item.eventRecordId.toString()}
                  >
                    <a>
                      <EventCard
                        title={item.name}
                        description={item.description}
                        date={item.date}
                      />
                    </a>
                  </Link>
                );
              })}
            </>
          </VStack>
        )}
      </Container>
    </>
  );
};

export default Events;
