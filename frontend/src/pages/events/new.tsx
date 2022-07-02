import { Heading, List, ListItem } from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { getEventManagerContract, IEventGroup } from "../../helpers/eventManager";

const EventCreate: NextPage = () => {
  const address = useAddress()
  const [groups, setGroups] = useState([])
  const getOwnEventGroups = async() => {
    console.log('get my event groups')
    const eventManager = getEventManagerContract()
    console.log(eventManager)
    if (!eventManager) throw 'error'
    const data = await eventManager.getOwnGroups()
    console.log(data)
    setGroups(data)
  }
  useEffect(() => {
    if (address){
      getOwnEventGroups()
    }
  }, [address])

  return (
    <>
      <Heading>
        Create a new event
      </Heading>
      {address ? (
        <List>
          { groups.map((item: IEventGroup) => {
            return (
              <ListItem key={item.groupId}>{item.name}</ListItem>
            )
          }) }
        </List>
        ) : (
        <span>please login first</span>
      )}
    </>      
  )
}

export default EventCreate;
