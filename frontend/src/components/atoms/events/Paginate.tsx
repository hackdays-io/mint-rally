import { Link as ChakraUILink, Box, HStack, Flex } from "@chakra-ui/react";
import { FC, useCallback } from "react";

type PaginateProps = {
  pageCount: number;
  currentPage: number;
  pageChanged: (page: number) => void;
};

const Paginate: FC<PaginateProps> = ({
  pageCount,
  currentPage,
  pageChanged,
}) => {
  const handleClick = useCallback(
    (page: number) => {
      pageChanged(page);
    },
    [pageChanged]
  );

  return (
    <>
      {pageCount > 1 && (
        <HStack>
          <Box>Page:</Box>
          {new Array(pageCount).fill(null).map((_, index) => (
            <>
              {index + 1 === currentPage ? (
                <Flex
                  key={index}
                  width="30px"
                  height="30px"
                  justifyContent="center"
                  alignItems="center"
                  borderRadius={5}
                  backgroundColor="mintGreen.400"
                  color="white"
                  fontWeight="bold"
                >
                  {index + 1}
                </Flex>
              ) : (
                <Flex
                  key={index}
                  width="30px"
                  height="30px"
                  justifyContent="center"
                  alignItems="center"
                  borderRadius={5}
                  backgroundColor="mintGreen.100"
                  color="yellow.900"
                  onClick={() => handleClick(index + 1)}
                  cursor="pointer"
                  _hover={{
                    backgroundColor: "yellow.400",
                  }}
                >
                  {index + 1}
                </Flex>
              )}
            </>
          ))}
        </HStack>
      )}
    </>
  );
};

export default Paginate;
