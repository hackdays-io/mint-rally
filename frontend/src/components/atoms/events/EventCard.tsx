import { FC } from "react";
import { Box, Divider, Flex, Heading, Text } from "@chakra-ui/react";
import { CalendarIcon } from '@chakra-ui/icons'

type Props = {
  title: string;
  description: string;
  date: string;
};

const EventCard: FC<Props> = ({ title, description, date }) => {
  return (
    <>
      <Divider
        borderColor="mint.bg"
        borderWidth={1.3}
      />
      <Box
        maxW="sm"
        overflow="hidden"
        _hover={{ cursor: "pointer" }}
        verticalAlign="center"
      >
        <Box p={1}>
          <Heading
            size="md"
            color={"black"}
            justifyContent="center"
            mt={5}
            mb={1}
          >
            {title}
          </Heading>
          <Text
            color={"black"}
            overflow="hidden"
            mb={2}
          >
            {description}
          </Text>
          <Flex alignItems="center">
            <CalendarIcon
              color={"gray.700"}
              mr={3}
            />
            <Text
              fontSize={"sm"}
              color={"black"}
              overflow="hidden"
            >
              {date}
            </Text>
          </Flex>
        </Box>
      </Box >
    </>
  );
};

export default EventCard;
