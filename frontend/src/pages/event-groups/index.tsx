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
import { IEventGroup, useEventGroups } from "../../hooks/useEventManager";

/**
 * /event-groups/
 */
const EventGroups: NextPage = () => {
  const { groups, loading } = useEventGroups();

  return (
    <>
      <Container maxW={800} paddingTop={6}>
        <Flex alignItems="bottom" paddingBottom={6}>
          <Heading>Event Groups</Heading>
          <Spacer></Spacer>
          <Button
            onClick={() => {
              window.location.href = "/event-groups/new";
            }}
          >
            Create new event group
          </Button>
        </Flex>
        {loading ? (
          <Spinner></Spinner>
        ) : (
          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={5}>
            <>
              {groups.map((item: IEventGroup) => {
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
