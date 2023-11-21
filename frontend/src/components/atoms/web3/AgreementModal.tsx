import { Text } from "@chakra-ui/react";
import { FC } from "react";
import { useLocale } from "../../../hooks/useLocale";

type Props = {
  agreementText: string;
  };

const AgreementModal: FC<Props> = ({
  agreementText,
}) => {

  const { t } = useLocale();

  return (
    <Text color="gray.700" fontSize="sm">
    {agreementText}
    </Text>
  )
}

export default AgreementModal;