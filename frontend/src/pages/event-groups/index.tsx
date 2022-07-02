import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { getEventManagerContract } from "../../helpers/eventManager";

interface IEventGroup {
  id: number;
  name: string;
}

const EventGroups: NextPage = () => {
  const [groups, setGroups] = useState([]);
  const getEventGroups = async () => {
    console.log("get event groups");
    const eventManager = getEventManagerContract();
    if (!eventManager) throw "error";
    console.log(eventManager);
    const data = await eventManager.getGroups();
    setGroups(data);
  };
  useEffect(() => {
    //getEventGroups()
  }, []);
  return (
    <>
      <Flex>
        <Link href="/event-groups/new">Create new EventGroup</Link>
      </Flex>
      <Box>
        Event Groups
        {groups}
        <Button onClick={getEventGroups}>load events</Button>
      </Box>
    </>
  );
};

export default EventGroups;
