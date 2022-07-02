import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  List,
  ListItem,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { getEventManagerContract, IEventGroup } from "../../helpers/eventManager";


const EventGroups: NextPage = () => {
  const [groups, setGroups] = useState([])
  const getEventGroups = async() => {
    console.log('get event groups')
    const eventManager = getEventManagerContract()
    if (!eventManager) throw 'error'
    const data = await eventManager.getGroups()
    console.log(data)
    setGroups(data)
  }
  useEffect(() => {
    getEventGroups();
  }, []);
  return (
    <>
      <Flex>
        <Link href="/event-groups/new">Create new EventGroup</Link>
      </Flex>
      <Heading>Event Groups</Heading>
      <List spacing={3}>
        {groups.map((item: IEventGroup) => {
          return (
            <ListItem key={item.groupId}>
              <Link href={"/event-groups/" + item.groupId}>{item.name}</Link>
            </ListItem>
          );
        })}
      </List>
    </>
  );
};

export default EventGroups;
