import { Container, Heading, Spinner, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FC, ReactNode, useMemo } from "react";
import { useEventGroups } from "src/hooks/useEvent";
import { useLocale } from "src/hooks/useLocale";
import { Event } from "types/Event";
import ENSName from "../atoms/web3/ENSName";
import EventGroupTab from "../molecules/EventGroupTab";

type Props = {
  children: ReactNode;
};

const EventGroupBase: FC<Props> = ({ children }) => {
  const { t } = useLocale();
  const router = useRouter();
  const { eventgroupid } = router.query;
  const { groups, isLoading } = useEventGroups();
  const findgroup = useMemo(() => {
    return groups?.find(
      (item: Event.EventGroup) => item.groupId.toString() == eventgroupid
    );
  }, [groups]);

  return (
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
              <EventGroupTab group={findgroup} />
              {children}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default EventGroupBase;
