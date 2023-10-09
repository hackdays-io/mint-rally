import { FC } from "react";
import { UserEntity } from "../../components/organisms/UserEntity";
import { useRouter } from "next/router";
import { Container } from "@chakra-ui/react";

const UserByAddress: FC = () => {
  const {
    query: { address },
  } = useRouter();

  return address ? (
    <Container maxWidth={1000} mt={10}>
      <UserEntity address={String(address)} />
    </Container>
  ) : (
    <></>
  );
};

export default UserByAddress;
