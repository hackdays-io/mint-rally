import {
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
import { useLocale } from "../../../hooks/useLocale";
import ENSName from "src/components/atoms/web3/ENSName";
import { useLeadersOfEventGroup } from "src/hooks/useMintNFT";
import { useAddress } from "@thirdweb-dev/react";
import EventGroupBase from "src/components/organisms/EventGroupBase";

const EventGroup = () => {
  const router = useRouter();
  const { eventgroupid } = router.query;
  const address = useAddress();

  const { t } = useLocale();

  const { leaders, isLoading: isLoadingHolders } = useLeadersOfEventGroup(
    Number(eventgroupid)
  );

  return (
    <EventGroupBase>
      {isLoadingHolders ? (
        <Spinner mt={5} />
      ) : (
        <Table mt={2} mb={10}>
          <Thead wordBreak="keep-all">
            <Tr>
              <Th fontSize="sm" textAlign="center" px={{ base: 0, md: 5 }}>
                {t.EVENT_GROUP_LEADERS_RANK}
              </Th>
              <Th fontSize="sm">{t.EVENT_GROUP_LEADERS_ADDRESS}</Th>
              <Th fontSize="sm" textAlign="center" px={{ base: 0, md: 5 }}>
                {t.EVENT_GROUP_LEADERS_COUNT}
              </Th>
            </Tr>
          </Thead>
          <Tbody wordBreak="break-word">
            {leaders.map((user) => (
              <Tr key={user.rank}>
                <Td
                  textAlign="center"
                  fontSize={[1, 2, 3].includes(user.rank) ? "2xl" : "sm"}
                  px={{ base: 0, md: 5 }}
                >
                  {user.rank == 1 && "🥇"}
                  {user.rank == 2 && "🥈"}
                  {user.rank == 3 && "🥉"}
                  {user.rank > 3 && user.rank}
                </Td>
                <Td>
                  {user.address.map((addr) => (
                    <Link key={addr} href={`/users/${addr}`}>
                      <Text
                        cursor={"pointer"}
                        _hover={{ textDecoration: "underline" }}
                        fontWeight={addr === address ? "bold" : "normal"}
                        color={addr === address ? "mintGreen.500" : "black"}
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
    </EventGroupBase>
  );
};

export default EventGroup;
