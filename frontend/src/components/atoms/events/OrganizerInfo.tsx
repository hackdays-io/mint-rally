import { Spinner, Table, Tbody, Td, Text, Th, Tr } from "@chakra-ui/react";
import Link from "next/link";
import { FC, useMemo } from "react";
import { useEventGroups } from "src/hooks/useEvent";
import { useLocale } from "../../../hooks/useLocale";
import { Event } from "types/Event";
import ENSName from "../web3/ENSName";

type Props = {
  eventgroupid: string;
};

export const OrganizerRows: FC<Props> = ({ eventgroupid }: Props) => {
  const { t } = useLocale();
  const { groups, isLoading } = useEventGroups();
  const findgroup: Event.EventGroup = useMemo(() => {
    return groups?.find(
      (item: Event.EventGroup) => item.groupId.toString() == eventgroupid
    );
  }, [groups, eventgroupid]);
  return (
    <>
      {isLoading && (
        <tr>
          <td>
            <Spinner />
          </td>
        </tr>
      )}
      {findgroup && (
        <>
          <Tr>
            <Th> {t.EVENTGROUPS}:</Th>
            <Td overflowWrap="anywhere">
              {" "}
              <Link href={`/event-groups/${findgroup.groupId}`}>
                <a>
                  <Text fontSize="16px">{findgroup.name}</Text>
                </a>
              </Link>
            </Td>
          </Tr>
          <Tr>
            <Th>{t.ORGANIZER}</Th>
            <Td overflowWrap="anywhere">
              <ENSName address={findgroup.ownerAddress} enableEtherScanLink />
            </Td>
          </Tr>
        </>
      )}
    </>
  );
};
const OrganizerInfo: FC<Props> = ({ eventgroupid }) => {
  return (
    <>
      <Table maxWidth="100%" variant="simple" mt={8}>
        <Tbody>
          <OrganizerRows eventgroupid={eventgroupid} />
        </Tbody>
      </Table>
    </>
  );
};
export default OrganizerInfo;
