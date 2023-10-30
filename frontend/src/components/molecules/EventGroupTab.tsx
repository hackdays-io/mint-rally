import { Tab, TabList, Tabs } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FC } from "react";
import { useLocale } from "src/hooks/useLocale";

const EventGroupTab: FC = () => {
  const router = useRouter();
  const { t } = useLocale();

  return (
    <Tabs
      variant="enclosed"
      colorScheme="mintGreen"
      defaultIndex={router.asPath.includes("leaders") ? 1 : 0}
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
      </TabList>
    </Tabs>
  );
};

export default EventGroupTab;
