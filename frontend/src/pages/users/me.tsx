import { Container } from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import { FC } from "react";
import LoginRequired from "src/components/atoms/web3/LoginRequired";
import { UserEntity } from "src/components/organisms/UserEntity";
import { useLocale } from "src/hooks/useLocale";

const User: FC = () => {
  const address = useAddress();
  const { t } = useLocale();

  return (
    <Container maxWidth={1000} mt={{ base: 5, md: 10 }}>
      <LoginRequired forbiddenText={t.PLEASE_SIGN_IN}>
        {address && <UserEntity address={address} />}
      </LoginRequired>
    </Container>
  );
};

export default User;
