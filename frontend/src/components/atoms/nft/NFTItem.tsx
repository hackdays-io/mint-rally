import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { FC } from "react";
import { NFT } from "types/NFT";
import { ipfs2http } from "utils/ipfs2http";
import { ShareButtons } from "./ShareButtons";
import { ViewButtons } from "./ViewBottons";
import NextLink from "next/link";

type Props = {
  nft: NFT.Metadata;
  tokenId: number;
  shareURL?: boolean;
  clickable?: boolean;
  address?: string;
  showShareButtons?: boolean;
  showViewButtons?: boolean; //showOpenSeaLink >> showViewBottons
};

export const NFTItem: FC<Props> = ({
  nft,
  tokenId,
  clickable = true,
  address = "",
  showShareButtons = false,
  showViewButtons = false,
}) => {
  return (
    <>
      <Flex justifyContent="center" alignItems="center" flexDirection="column">
        <Flex
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          p={4}
          cursor={clickable ? "pointer" : "default"}
        >
          <NextLink href={`/nfts/${nft.tokenId}`} passHref>
            <a>
              <Box>
                <Image
                  width={500}
                  style={{ objectFit: "cover" }}
                  src={ipfs2http(nft.image)}
                  alt={nft.name}
                />
              </Box>
              <Box>
                <Text fontSize="md" fontWeight="bold" mt={2} textAlign="center">
                  {nft.name}
                </Text>
              </Box>
            </a>
          </NextLink>
        </Flex>
        {showShareButtons && (
          <ShareButtons
            tokenId={tokenId}
            address={address}
            twitter={true}
            facebook={true}
          />
        )}
        {showViewButtons && (
          <ViewButtons
            tokenId={tokenId}
            address={address}
            opensea={true}
          />
        )}
      </Flex>
    </>
  );
};
