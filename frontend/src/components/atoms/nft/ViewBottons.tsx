//View Buttons for NFTs
import { Flex, Text } from "@chakra-ui/react";
import { FC } from "react";
import { useRouter } from "next/router";
import { OpenseaIcon } from "../icons/opensea/OpenseaIcon";

type Props = {
  tokenId: number;
  address: string;
  opensea?: boolean;
};

export const ViewButtons: FC<Props> = ({
  tokenId,
  address,
  opensea = true,
}) => {
  const router = useRouter();

  const openseaUrl = `https://opensea.io/assets/matic/${process.env.NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER}/${tokenId}`;

  return (
    <Flex alignItems="center" my={2}>
      <Text mb={1} mr={5}>
        View on
      </Text>

      {opensea && (
        <button
          onClick={() => window.open(openseaUrl, "_blank")}
          style={{ marginRight: "12px", cursor: "pointer", border: "none", background: "none" }}
        >
          <OpenseaIcon />
        </button>
      )}
    </Flex>
  );
};

