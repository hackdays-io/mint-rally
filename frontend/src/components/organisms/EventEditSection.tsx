import { Box, Divider, Heading, Text } from "@chakra-ui/react";
import { FC, useMemo } from "react";
import { useOwnEventGroups } from "src/hooks/useEvent";
import { Event } from "types/Event";
import EventMintLock from "../molecules/EventMintLock";
import ResetSecretPhrase from "../molecules/ResetSecretPhrase";

type Props = {
  event: Event.EventRecord;
};

const EventEditSection: FC<Props> = ({ event }) => {
  const { groups } = useOwnEventGroups();

  const isOrganizer = useMemo(() => {
    return groups?.find(
      (item: Event.EventGroup) =>
        item.groupId.toString() == event.groupId.toString()
    );
  }, [groups, event]);

  return (
    <>
      {isOrganizer && (
        <Box
          rounded="lg"
          py={{ md: 8, base: 5 }}
          px={{ md: 10, base: 5 }}
          mt={4}
          backgroundColor="red.50"
        >
          <Heading as="h3" mb={2} fontSize="lg">
            管理者メニュー
          </Heading>

          <Divider my={3} />

          <EventMintLock eventId={event.eventRecordId} />

          <Divider my={3} />

          <ResetSecretPhrase eventId={event.eventRecordId} />
        </Box>
      )}
    </>
  );
};

export default EventEditSection;
