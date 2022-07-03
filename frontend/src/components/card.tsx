import { Box, Heading } from "@chakra-ui/react";

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
      <Heading size="l" justifyContent="center">
        {title}
      </Heading>
    </Box>
  );
};
