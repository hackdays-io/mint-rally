import { Container, Heading, Spinner, VStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import ENSName from "src/components/atoms/web3/ENSName";
import { useAddress } from "@thirdweb-dev/react";
import EditCollaborators from "src/components/organisms/EditCollaborators";
import EventCard from "../../../components/atoms/events/EventCard";
import { useLocale } from "../../../hooks/useLocale";
import {
  useEventGroups,
  useEventsByGroupId,
  useMemberRole,
} from "src/hooks/useEvent";
import { Event } from "types/Event";
import EventGroupTab from "src/components/molecules/EventGroupTab";

const EventGroup = () => {
  const router = useRouter();
  const { eventgroupid } = router.query;
  const { groups, isLoading } = useEventGroups();
  const {
    events,
    isLoading: eventLoading,
    getEventsByGroupId,
  } = useEventsByGroupId();
  useEffect(() => {
    if (router.isReady && eventgroupid) {
      getEventsByGroupId(Number(eventgroupid));
    }
  }, [router.query?.eventgroupid]);
  const { t } = useLocale();
  const findgroup = useMemo(() => {
    return groups?.find(
      (item: Event.EventGroup) => item.groupId.toString() == eventgroupid
    );
  }, [groups]);
  const address = useAddress();
  const {
    memberRole,
    isLoading: isRoleLoading,
    getMemberRole,
  } = useMemberRole();
  useEffect(() => {
    if (findgroup == undefined) return;
    if (address == undefined) return;
    if (isRoleLoading) return;
    getMemberRole(findgroup.groupId, address);
  }, [findgroup, address, isRoleLoading, getMemberRole]);

  return (
    <>
      <Container maxW={800} paddingTop={6}>
        {isLoading ? (
          <Spinner></Spinner>
        ) : (
          <>
            {findgroup && (
              <>
                <Heading mb={6}>{findgroup.name}</Heading>
                <Text mb={6}>
                  {t.ORGANIZER}:{" "}
                  <ENSName
                    address={findgroup.ownerAddress}
                    enableEtherScanLink={true}
                  />
                </Text>
                {((address && findgroup && address == findgroup.ownerAddress) ||
                  (memberRole && memberRole.admin)) && (
                  <EditCollaborators groupId={findgroup.groupId} />
                )}
                <EventGroupTab />
                {eventLoading ? (
                  <Spinner mt={5} />
                ) : (
                  <VStack spacing={5} align="stretch">
                    {events?.map((event: Event.EventRecord) => {
                      return (
                        <Link
                          href={"/events/" + event.eventRecordId}
                          key={event.eventRecordId.toString()}
                        >
                          <a>
                            <EventCard
                              title={event.name}
                              description={event.description}
                              date={event.date}
                            ></EventCard>
                          </a>
                        </Link>
                      );
                    })}
                  </VStack>
                )}
              </>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default EventGroup;
