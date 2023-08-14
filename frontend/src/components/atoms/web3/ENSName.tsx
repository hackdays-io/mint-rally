import Link from "next/link";
import Image from "next/image";
import { FC } from "react";
import { useEnsName } from "wagmi";
type Props = {
  address: string;
  enableLink?: boolean;
};
const ENSName: FC<Props> = ({ address, enableLink }) => {
  const ensName = useEnsName({ address: address as `0x${string}` });
  return (
    <>
      {enableLink ? (
        <>
          {ensName.data || address}
          <br />
          <Link href={`https://polygonscan.com/address/${address}`} passHref>
            <a target="_blank">
              <Image
                src="/images/polygonscan.svg"
                alt="View on Polygonscan"
                width={16}
                height={16}
              ></Image>{" "}
              View on PolygonScan
            </a>
          </Link>
        </>
      ) : (
        <>{ensName.data || address}</>
      )}
    </>
  );
};

export default ENSName;
