import { Link as ChakraUILink, Box, HStack } from "@chakra-ui/react";

type PaginateProps = {
  pageCount: number;
  pageRangeDisplayed: number;
  currentPage: number;
  pageChanged: (page: number) => void;
};
const Paginate = (props: PaginateProps) => {
  const pageChanged = (page: number) => {
    return () => {
      props.pageChanged(page);
    };
  };
  return (
    <>
      {props && props.pageCount > 1 && (
        <HStack>
          <Box>Page:</Box>
          {new Array(props.pageCount).fill(null).map((_, index) => (
            <>
              {index + 1 === props.currentPage ? (
                <Box>{index + 1}</Box>
              ) : (
                <a
                  className="renderlinkunderline"
                  key={index}
                  onClick={pageChanged(index + 1)}
                >
                  <ChakraUILink color="yellow.800">
                    <Box>{index + 1}</Box>
                  </ChakraUILink>
                </a>
              )}
            </>
          ))}
        </HStack>
      )}
    </>
  );
};
export default Paginate;
