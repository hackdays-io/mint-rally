import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { FC, ReactNode } from "react";

type Props = {
  status?: "info" | "warning" | "success" | "error" | "loading" | undefined;
  mt?: number;
  children?: ReactNode;
  title?: string;
};

const AlertMessage: FC<Props> = ({ status, mt, title, children }) => {
  return (
    <Alert status={status} mt={mt}>
      <AlertIcon />
      <AlertTitle>{title}</AlertTitle>
      {children && <AlertDescription>{children}</AlertDescription>}
    </Alert>
  );
};

export default AlertMessage;

AlertMessage.defaultProps = {
  status: "error",
  mt: 2,
  title: "Error occurred",
};
