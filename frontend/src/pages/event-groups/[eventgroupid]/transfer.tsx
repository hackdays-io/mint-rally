import { NextPage } from "next";
import { useRouter } from "next/router";
import EventGroupBase from "src/components/organisms/EventGroupBase";
import { Box, Button, FormControl, FormLabel, Input, Text, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import OwnerTransfer from "src/components/molecules/OwnerTransfer";
import { useLocale } from "src/hooks/useLocale";
import { useState } from "react";

const TransferPage: NextPage = () => {
  const router = useRouter();
  const { eventgroupid } = router.query;

  return (
    <EventGroupBase>
      <Tabs isFitted variant="enclosed" mt={5}>
        <TabPanels>
          <TabPanel>
            {eventgroupid && (
              <OwnerTransfer groupId={Number(eventgroupid)} />
            )}
          </TabPanel>
          {/* Add additional tab panels here if needed */}
        </TabPanels>
      </Tabs>
    </EventGroupBase>
  );
};

export default TransferPage;
