import {
  Heading,
  Spinner,
  Box,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  useGetEventById,
  useApplyForParticipation,
} from "../../hooks/useEventManager";

const Event = () => {
  const router = useRouter();
  const { eventid } = router.query;
  const { event, loading: loadingFetch, getEventById } = useGetEventById();
  useEffect(() => {
    if (eventid) {
      const id = Array.isArray(eventid) ? eventid[0] : eventid;
      getEventById({ eventId: Number.parseInt(id, 10) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    errors: applyErrors,
    loading: applyLoading,
    applyForParticipation,
  } = useApplyForParticipation();

  return (
    <>
      <Heading>Event details</Heading>
      {loadingFetch && <Spinner></Spinner>}
      {event && (
        <Box>
          <Text>Event name: {event.name}</Text>
          <Text>Event description: {event.description}</Text>
          <Box mt={8} textAlign="center">
            <Button
              isLoading={applyLoading}
              onClick={() => {
                applyForParticipation({
                  evendId: event.eventRecordId,
                });
              }}
            >
              Apply
            </Button>
            {applyErrors && (
              <Alert status="error" mt={2}>
                <AlertIcon />
                <AlertTitle>Error occurred</AlertTitle>
                <AlertDescription>{applyErrors.message}</AlertDescription>
              </Alert>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

export default Event;
