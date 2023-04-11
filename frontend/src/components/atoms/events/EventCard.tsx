import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import Image from "next/image";
import { FC } from "react";

type Props = {
  title: string;
  description: string;
};

const EventCard: FC<Props> = ({ title, description }) => {
  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      rounded="lg"
      overflow="hidden"
      _hover={{ cursor: "pointer" }}
      verticalAlign="center"
    >
      <Box>
        <Image
          src="/images/events/default-thumb.png"
          width="350"
          height="160"
        />
      </Box>
      <Box p={3} h={130}>
        <Heading
          size="md"
          justifyContent="center"
          mb={1}
          height="50px"
          overflow="hidden"
        >
          {title}
        </Heading>
        <Text height="50px" overflow="hidden">
          {description}
        </Text>
      </Box>
    </Box>
  );
};

export default EventCard;
