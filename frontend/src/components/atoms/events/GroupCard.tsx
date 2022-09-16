import { Box, Flex, Heading } from "@chakra-ui/react";
import { FC } from "react";

type Props = { title: string };

const EventGroupCard: FC<Props> = ({ title }) => {
  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      rounded="lg"
      overflow="hidden"
      h={100}
      _hover={{ cursor: "pointer" }}
      textAlign="center"
      verticalAlign="center"
    >
      <Flex h="100%" justify="center" align="center">
        <Heading size="l" justifyContent="center">
          {title}
        </Heading>
      </Flex>
    </Box>
  );
};

export default EventGroupCard;
