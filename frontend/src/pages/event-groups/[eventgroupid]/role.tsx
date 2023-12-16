import { NextPage } from "next";
import { useRouter } from "next/router";
import EventGroupBase from "src/components/organisms/EventGroupBase";
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from "@chakra-ui/react";
import GrantRole from "src/components/molecules/GrantRole";
import Collaborators from "src/components/molecules/Collaborators";
import { useLocale } from "src/hooks/useLocale";
import { useState } from "react";

const RolePage: NextPage = () => {
  const { t } = useLocale();
  const [tabIndex, setTabIndex] = useState(0);
  const router = useRouter();
  const { eventgroupid } = router.query;

  return (
    <EventGroupBase>
      <Tabs mt={5} index={tabIndex} onChange={(index) => setTabIndex(index)}>
        <TabList>
          <Tab
            _selected={{
              borderColor: "mintGreen.300",
              fontWeight: "bold",
            }}
          >
            {t.RBAC_GRANT}
          </Tab>
          <Tab
            _selected={{
              borderColor: "mintGreen.300",
              fontWeight: "bold",
            }}
          >
            {t.RBAC_LIST}
          </Tab>
        </TabList>
        {eventgroupid && (
          <TabPanels>
            <TabPanel key={`tab-panel-0-${tabIndex}`}>
              <GrantRole groupId={Number(eventgroupid)} />
            </TabPanel>
            <TabPanel key={`tab-panel-1-${tabIndex}`}>
              <Collaborators groupId={Number(eventgroupid)} />
            </TabPanel>
          </TabPanels>
        )}
      </Tabs>
    </EventGroupBase>
  );
};

export default RolePage;
