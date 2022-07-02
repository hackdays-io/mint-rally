import { Box, Flex, Link } from "@chakra-ui/react";
import { NextPage } from "next";

const EventGroups: NextPage = () => {
  return (
    <>
      <Flex>
        <Link href="/event-groups/new">Create new EventGroup</Link>
      </Flex>
      <Box>
        Event Groups
      </Box>
    </>      
  )
}

export default EventGroups