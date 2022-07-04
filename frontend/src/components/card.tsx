import { Box, Flex, Heading } from "@chakra-ui/react";

export const Card = ({ title, href }: { title: string; href: string }) => {
  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      rounded="lg"
      overflow="hidden"
      w={250}
      h={100}
      onClick={() => {
        location.href = href;
      }}
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
