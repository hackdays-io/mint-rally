import { Spinner, Text } from "@chakra-ui/react";
import Link from "next/link";
import { FC, useMemo } from "react";
import { useEventGroups } from "src/hooks/useEvent";
import { useLocale } from "../../../hooks/useLocale";
import { Event } from "types/Event";

type Props = {
  eventgroupid: string;
};
const LinkToOrganizer: FC<Props> = ({ eventgroupid }) => {
  const { t } = useLocale();
  const { groups, isLoading } = useEventGroups();
  const findgroup = useMemo(() => {
    return groups?.find(
      (item: Event.EventGroup) => item.groupId.toString() == eventgroupid
    );
  }, [groups, eventgroupid]);

  return (
    <>
      {isLoading && <Spinner />}
      {findgroup && (
        <Link href={`/event-groups/${findgroup.groupId}`}>
          <a>
            <Text fontSize="16px" my={10}>
              {t.ORGANIZER}: {findgroup.name}
            </Text>
          </a>
        </Link>
      )}
    </>
  );
};
export default LinkToOrganizer;
