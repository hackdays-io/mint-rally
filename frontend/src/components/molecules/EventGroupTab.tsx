import { Tab, TabList, Tabs } from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import { FC, useMemo } from "react";
import { useMemberRole } from "src/hooks/useEvent";
import { useLocale } from "src/hooks/useLocale";
import { Event } from "types/Event";

type Props = {
  group: Event.EventGroup;
};

const EventGroupTab: FC<Props> = ({ group }) => {
  const router = useRouter();
  const { eventgroupid } = router.query;
  const address = useAddress();

  const { memberRole } = useMemberRole(Number(eventgroupid), address);

  const { t } = useLocale();

  const tabIndex = useMemo(() => {
    switch (true) {
      case router.asPath.includes("events"):
        return 0;
      case router.asPath.includes("leaders"):
        return 1;
      case router.asPath.includes("role"):
        return 2;
      case router.asPath.includes("transfer"):
        return 3;
      default:
        break;
    }
  }, [router.asPath]);

  return (
    <Tabs
      variant="enclosed"
      colorScheme="mintGreen"
      defaultIndex={tabIndex}
      borderColor="mintGreen.300"
    >
      <TabList>
        <Tab
          _selected={{
            borderColor: "mintGreen.300",
            borderWidth: 1,
            borderBottom: "none",
            backgroundColor: "mintGreen.50",
          }}
          onClick={() =>
            router.push(`/event-groups/${router.query.eventgroupid}`)
          }
        >
          {t.EVENT_GROUP_TAB_EVENTS}
        </Tab>
        <Tab
          _selected={{
            borderColor: "mintGreen.300",
            borderWidth: 1,
            borderBottom: "none",
            backgroundColor: "mintGreen.50",
          }}
          onClick={() =>
            router.push(`/event-groups/${router.query.eventgroupid}/leaders`)
          }
        >
          {t.EVENT_GROUP_TAB_LEADERS}
        </Tab>
        {(group.ownerAddress === address || memberRole?.admin) && (
          <Tab
            _selected={{
              borderColor: "mintGreen.300",
              borderWidth: 1,
              borderBottom: "none",
              backgroundColor: "mintGreen.50",
            }}
            onClick={() =>
              router.push(`/event-groups/${router.query.eventgroupid}/role`)
            }
          >
            {t.RBAC_EDIT_COLLABORATORS}
          </Tab>
        )}
        {(group.ownerAddress === address) && (
          <Tab
            _selected={{
              borderColor: "mintGreen.300",
              borderWidth: 1,
              borderBottom: "none",
              backgroundColor: "mintGreen.50",
            }}
            onClick={() =>
              router.push(`/event-groups/${router.query.eventgroupid}/transfer`)
            }
          >
          {t.EVENT_GROUP_TAB_TRANSFER}
          </Tab>
        )}  
      </TabList>
    </Tabs>
  );
};

export default EventGroupTab;
