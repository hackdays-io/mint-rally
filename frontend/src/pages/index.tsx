import {
  Box,
  Container,
  Flex,
  GridItem,
  Heading,
  SimpleGrid,
  Spacer,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import EventCard from "../components/atoms/events/EventCard";
import { useLocale } from "../hooks/useLocale";
import { useEvents } from "src/hooks/useEvent";

const Home: NextPage = () => {
  const { t, locale } = useLocale();
  const { events, isLoading } = useEvents({
    initialCursor: 0,
    countPerPage: 6,
  });
  const filename = locale === "ja" ? "mainImg-ja" : "mainImg";
  return (
    <Box>
      <div>
        <Image
          src={`/images/${filename}.png`}
          width={1920}
          height={960}
          alt="mainImg"
        />
      </div>

      <Container maxW={1000} pt={10} pb={20}>
        <Heading fontSize="3xl" mb={10}>
          {t.FEATUE}
        </Heading>
        <SimpleGrid
          columns={{ base: 1, md: 3 }}
          spacing={{ base: 5, md: "100px" }}
        >
          <GridItem
            position="relative"
            textAlign={{ base: "center", md: "left" }}
          >
            <Box
              backgroundColor="mint.subtle3"
              width={180}
              height={180}
              borderRadius="full"
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              margin="auto"
              zIndex={-1}
            />
            <Box>
              <Image
                alt=""
                src="/images/home/feature1.svg"
                width={300}
                height={300}
              />
            </Box>
            <Text pt={5}>{t.FEATUE_DESC_1}</Text>
          </GridItem>
          <GridItem
            position="relative"
            textAlign={{ base: "center", md: "left" }}
          >
            <Box
              backgroundColor="mint.subtle3"
              width={180}
              height={180}
              borderRadius="full"
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              margin="auto"
              zIndex={-1}
            />
            <Box>
              <Image
                alt=""
                src="/images/home/feature2.svg"
                width={300}
                height={300}
              />
            </Box>
            <Text pt={5}>{t.FEATUE_DESC_2}</Text>
          </GridItem>
          <GridItem
            position="relative"
            textAlign={{ base: "center", md: "left" }}
          >
            <Box
              backgroundColor="mint.subtle3"
              width={180}
              height={180}
              borderRadius="full"
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              margin="auto"
              zIndex={-1}
            />
            <Box>
              <Image
                alt=""
                src="/images/home/feature3.svg"
                width={300}
                height={300}
              />
            </Box>
            <Text pt={5}>{t.FEATUE_DESC_3}</Text>
          </GridItem>
        </SimpleGrid>
      </Container>

      <Box backgroundColor="mint.subtle">
        <Container maxW={1000} pt={10} pb={20}>
          <Heading fontSize="3xl" mb={10}>
            {t.HOW_IT_WORKS}
          </Heading>
          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            spacing={{ base: 5, md: 10 }}
          >
            <GridItem
              position="relative"
              p={5}
              backgroundColor="mint.white"
              borderRadius="10"
            >
              <Text
                dangerouslySetInnerHTML={{
                  __html: t.ORGANIZER_DESC,
                }}
              />
              <Text mt={4} textAlign="right">
                <Box
                  as="span"
                  py="1"
                  px="3"
                  backgroundColor="mint.bg"
                  borderRadius="full"
                  fontSize="sm"
                >
                  {t.ORGANIZER}
                </Box>
              </Text>
            </GridItem>
            <GridItem
              position="relative"
              p={5}
              backgroundColor="mint.white"
              borderRadius="10"
            >
              <Box
                backgroundColor="mint.subtle"
                width={220}
                height={220}
                borderRadius="full"
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                margin="auto"
                zIndex={-1}
              />

              <Text
                dangerouslySetInnerHTML={{
                  __html: t.PARTICIPANTS_DESC,
                }}
              />
              <Text mt={4} textAlign="right">
                <Box
                  as="span"
                  py="1"
                  px="3"
                  backgroundColor="mint.bg"
                  borderRadius="full"
                  fontSize="sm"
                >
                  {t.PARTICIPANTS}
                </Box>
              </Text>
            </GridItem>
            <GridItem
              position="relative"
              p={5}
              backgroundColor="mint.white"
              borderRadius="10"
            >
              <Box
                backgroundColor="mint.subtle"
                width={220}
                height={220}
                borderRadius="full"
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                margin="auto"
                zIndex={-1}
              />

              <Text
                dangerouslySetInnerHTML={{
                  __html: t.ORGANIZER_PARTICIPANTS_DESC,
                }}
              />
              <Text mt={4} textAlign="right">
                <Box
                  as="span"
                  py="1"
                  px="3"
                  backgroundColor="mint.bg"
                  borderRadius="full"
                  fontSize="sm"
                >
                  {t.ORGANIZER_PARTICIPANTS}
                </Box>
              </Text>
            </GridItem>
          </SimpleGrid>
        </Container>
      </Box>

      <Container maxW={1000} paddingTop={20}>
        <Flex alignItems="bottom" paddingBottom={6}>
          <Heading fontSize="3xl">{t.RECENT_EVENTS}</Heading>
          <Spacer></Spacer>
        </Flex>
        {isLoading ? (
          <Spinner></Spinner>
        ) : (
          <VStack spacing={5} align="stretch">
            {events ? (
              <>
                {events.slice(0, 6).map((item: any) => {
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
                        ></EventCard>
                      </a>
                    </Link>
                  );
                })}
              </>
            ) : (
              <Text>{t.NO_EVENTS_AVAILABLE}</Text>
            )}
          </VStack>
        )}
      </Container>

      <Box background="mint.primary" mt={20} color="mint.bg">
        <Container maxW={1000} py={10}>
          <Text fontSize="2xl" mb={5} fontWeight="bold">
            {t.CONTRIBUTORS_WANTED}
          </Text>
          <Text
            fontSize="md"
            mb={3}
            dangerouslySetInnerHTML={{ __html: t.CONTRIBUTORS_WANTED_DESC }}
          />

          <Link
            href="https://github.com/hackdays-io/mint-rally"
            target="_blank"
          >
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
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
