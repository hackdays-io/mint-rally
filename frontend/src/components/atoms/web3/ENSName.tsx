import Link from "next/link";
import Image from "next/image";
import { FC } from "react";
import { useEnsName } from "wagmi";
import { Tooltip, position } from "@chakra-ui/react";
import { User } from "react-feather";
type Props = {
  address: string;
  enableUserLink?: boolean;
  enableEtherScanLink?: boolean;
};
const ENSName: FC<Props> = ({
  address,
  enableEtherScanLink,
  enableUserLink,
}) => {
  const ensName = useEnsName({ address: address as `0x${string}` });
  const UserName = (
    <>
      {enableUserLink ? (
        <Link href={`/users/${address}`}>
          <a>{ensName.data || address}</a>
        </Link>
      ) : (
        <>{ensName.data || address}</>
      )}
    </>
  );

  return (
    <>
      {UserName}{" "}
      {enableEtherScanLink && (
        <>
          <Link href={`https://polygonscan.com/address/${address}`} passHref>
            <a target="_blank">
              <Tooltip
                label="View on PolygonScan"
                aria-label="A tooltip"
                placement="right-start"
              >
                <span style={{ position: "relative" }}>
                  <Image
                    src="/images/polygonscan.svg"
                    alt="View on Polygonscan"
                    width={16}
                    height={16}
                  ></Image>
                </span>
              </Tooltip>
            </a>
          </Link>
        </>
      )}
    </>
  );
};

export default ENSName;
