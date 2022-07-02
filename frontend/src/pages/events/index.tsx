import { Box, Flex, Link } from "@chakra-ui/react";
import { NextPage } from "next";

const Events: NextPage = () => {
  return (
    <>
      <Flex>
        <Link href="/events/new">Create new event</Link>
      </Flex>
      <Box>
        Events
      </Box>
    </>      
  )
}

export default Events