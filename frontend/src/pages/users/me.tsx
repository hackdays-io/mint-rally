import { useAddress } from "@thirdweb-dev/react";
import { FC } from "react";
import { UserEntity } from "src/components/organisms/UserEntity";

const User: FC = () => {
  const address = useAddress();

  return address ? <UserEntity address={address} /> : <></>;
};

export default User;
