import { Text } from "@chakra-ui/react";
import { FC } from "react";
import { useLocale } from "../../../hooks/useLocale";

type Props = {
  welcomeText: string;
  };

const WelcomeModal: FC<Props> = ({
  welcomeText,
}) => {

  const { t } = useLocale();

  return (
    <Text color="gray.700" fontSize="xl">
    {welcomeText}
    </Text>
  )
}

export default WelcomeModal;