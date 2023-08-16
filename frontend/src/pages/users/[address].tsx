import { FC } from "react";
import { UserEntity } from "../../components/organisms/UserEntity";
import { useRouter } from "next/router";

const UserByAddress: FC = () => {
  const {
    query: { address },
  } = useRouter();

  return address ? <UserEntity address={String(address)} /> : <></>;
};

export default UserByAddress;
