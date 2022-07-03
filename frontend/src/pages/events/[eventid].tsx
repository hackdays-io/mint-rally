import {
  Heading,
  List,
  ListItem,
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
  IEventRecord,
  useEventRecords,
  useApplyForParticipation,
} from "../../hooks/useEventManager";

const Event = () => {
  const { records, loading, getEventRecords } = useEventRecords();
  useEffect(() => {
    getEventRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const router = useRouter();
  const { eventid } = router.query;
  const {
    errors: applyErrors,
    loading: applyLoading,
    applyForParticipation,
  } = useApplyForParticipation();

  return (
    <>
      <Heading>Event details</Heading>
      {loading && <Spinner></Spinner>}
      <List>
        {records
          .filter((item) => item.eventRecordId.toString() == eventid)
          .map((item) => {
            return (
              <>
                <ListItem key={"name-" + item.eventRecordId}>
                  {item.name}
                </ListItem>
                <ListItem key={"description-" + item.eventRecordId}>
                  {item.description}
                </ListItem>
                <Box mt={8} textAlign="center">
                  <Button
                    isLoading={applyLoading}
                    onClick={() => {
                      applyForParticipation({
                        evendId: item.eventRecordId,
                      });
                    }}
                  >
                    Register!
                  </Button>
                  {applyErrors && (
                    <Alert status="error" mt={2}>
                      <AlertIcon />
                      <AlertTitle>Error occurred</AlertTitle>
                      <AlertDescription>{applyErrors.message}</AlertDescription>
                    </Alert>
                  )}
                </Box>
              </>
            );
          })}
      </List>
    </>
  );
};

export default Event;
