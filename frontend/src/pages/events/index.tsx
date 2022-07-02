import { Box, Flex, Link } from "@chakra-ui/react";
import { NextPage } from "next";
import { useEventManager } from "../../hooks/useEventManager";

const Events: NextPage = () => {
  const { data, error, loading } = useEventManager()

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