import { FC } from "react";
import { useEnsName } from "wagmi";
type Props = {
  address: string;
};
const ENSName: FC<Props> = ({ address }) => {
  const ensName = useEnsName({ address: address as `0x${string}` });
  return <>{ensName.data || address}</>;
};

export default ENSName;
