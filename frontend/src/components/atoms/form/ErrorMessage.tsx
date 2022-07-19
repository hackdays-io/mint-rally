import { Box } from "@chakra-ui/react";
import { FC, ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const ErrorMessage: FC<Props> = ({ children }) => {
  return children ? (
    <Box color="red" my={1} fontSize="13px">
      {children}
    </Box>
  ) : (
    <></>
  );
};

export default ErrorMessage;
