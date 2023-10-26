import {
  Container,
  Heading,
  Spinner,
  Text,
  Table,
  Th,
  Tr,
  Td,
  Thead,
  Tbody,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useLocale } from "../../../hooks/useLocale";
import { useEventGroups } from "src/hooks/useEvent";
import { Event } from "types/Event";
import ENSName from "src/components/atoms/web3/ENSName";
import EventGroupTab from "src/components/molecules/EventGroupTab";
import { useLeadersOfEventGroup } from "src/hooks/useMintNFT";
import { useAddress } from "@thirdweb-dev/react";

const EventGroup = () => {
  const router = useRouter();
  const { eventgroupid } = router.query;
  const { groups, isLoading } = useEventGroups();
  const address = useAddress();

  const { t } = useLocale();
  const findgroup = useMemo(() => {
    return groups?.find(
      (item: Event.EventGroup) => item.groupId.toString() == eventgroupid
    );
  }, [groups]);

  const { leaders, isLoading: isLoadingHolders } = useLeadersOfEventGroup(
    Number(eventgroupid)
  );

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
                <EventGroupTab />
                {isLoadingHolders ? (
                  <Spinner />
                ) : (
                  <Table mt={2} mb={10}>
                    <Thead wordBreak="keep-all">
                      <Tr>
                        <Th
                          fontSize="sm"
                          textAlign="center"
                          px={{ base: 0, md: 5 }}
                        >
                          {t.EVENT_GROUP_LEADERS_RANK}
                        </Th>
                        <Th fontSize="sm">{t.EVENT_GROUP_LEADERS_ADDRESS}</Th>
                        <Th
                          fontSize="sm"
                          textAlign="center"
                          px={{ base: 0, md: 5 }}
                        >
                          {t.EVENT_GROUP_LEADERS_COUNT}
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody wordBreak="break-word">
                      {leaders.map((user) => (
                        <Tr>
                          <Td
                            textAlign="center"
                            fontSize={
                              [1, 2, 3].includes(user.rank) ? "2xl" : "sm"
                            }
                            px={{ base: 0, md: 5 }}
                          >
                            {user.rank == 1 && "🥇"}
                            {user.rank == 2 && "🥈"}
                            {user.rank == 3 && "🥉"}
                            {user.rank > 3 && user.rank}
                          </Td>
                          <Td>
                            {user.address.map((addr) => (
                              <Link href={`/users/${addr}`}>
                                <Text
                                  cursor={"pointer"}
                                  _hover={{ textDecoration: "underline" }}
                                  fontWeight={
                                    addr === address ? "bold" : "normal"
                                  }
                                  color={
                                    addr === address ? "mintGreen.500" : "black"
                                  }
                                  fontSize={
                                    [1, 2, 3].includes(user.rank)
                                      ? { base: "lg", md: "xl" }
                                      : "md"
                                  }
                                  py={1}
                                >
                                  <ENSName address={addr} />
                                </Text>
                              </Link>
                            ))}
                          </Td>
                          <Td textAlign="center" px={{ base: 0, md: 5 }}>
                            {user.count}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
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
