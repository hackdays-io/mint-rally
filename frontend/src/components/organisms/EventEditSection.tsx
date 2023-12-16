import { Box, Divider, Heading, Text } from "@chakra-ui/react";
import { FC, useMemo } from "react";
import { useCollaboratorAccessEventGroups } from "src/hooks/useEvent";
import { Event } from "types/Event";
import EventMintLock from "../molecules/EventMintLock";
import EventTransferLock from "../molecules/EventTransferLock";
import ResetSecretPhrase from "../molecules/ResetSecretPhrase";
import { useLocale } from "src/hooks/useLocale";
import DropNFTs from "./nft/DropNFTs";
import { useAddress } from "@thirdweb-dev/react";

type Props = {
  event: Event.EventRecord;
};

const EventEditSection: FC<Props> = ({ event }) => {
  const address = useAddress();
  const { t } = useLocale();
  const { groups } = useCollaboratorAccessEventGroups();

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
            {t.EVENT_ADMIN_MENU}
          </Heading>

          <Divider my={3} />

          <EventMintLock eventId={event.eventRecordId} />

          <Divider my={3} />

          <EventTransferLock eventId={event.eventRecordId} />

          <Divider my={3} />

          <ResetSecretPhrase eventId={event.eventRecordId} />

          <Divider my={3} />
          {address && <DropNFTs event={event} address={address} />}
        </Box>
      )}
    </>
  );
};

export default EventEditSection;
