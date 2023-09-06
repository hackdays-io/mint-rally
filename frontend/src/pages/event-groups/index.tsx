import {
  Button,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Spacer,
  Spinner,
} from "@chakra-ui/react";
import { NextPage } from "next";
import Link from "next/link";
import EventGroupCard from "../../components/atoms/events/GroupCard";
import { useLocale } from "../../hooks/useLocale";
import { useEventGroups } from "src/hooks/useEvent";
import { Event } from "types/Event";

/**
 * /event-groups/
 */
const EventGroups: NextPage = () => {
  const { t } = useLocale();
  const { groups, isLoading } = useEventGroups();

  return (
    <>
      <Container maxW={800} paddingTop={6}>
        <Flex alignItems="bottom" paddingBottom={6} flexWrap="wrap">
          <Heading mb={2}>{t.EVENTGROUPS}</Heading>
          <Spacer></Spacer>
          <Link href="/event-groups/new">
            <Button>{t.CREATE_NEW_EVENT_GROUP}</Button>
          </Link>
        </Flex>
        {isLoading ? (
          <Spinner></Spinner>
        ) : groups == null || groups.length == 0 ? (
          <Heading size="md" color="gray.500">
            {t.NO_EVENTGROUPS_AVAILABLE}
          </Heading>
        ) : (
          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={5}>
            <>
              {groups.map((item: Event.EventGroup) => {
                return (
                  <Link
                    key={item.groupId.toString()}
                    href={"/event-groups/" + item.groupId}
                  >
                    <a>
                      <EventGroupCard title={item.name} />
                    </a>
                  </Link>
                );
              })}
            </>
          </SimpleGrid>
        )}
      </Container>
    </>
  );
};

export default EventGroups;
