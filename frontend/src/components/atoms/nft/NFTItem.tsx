import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FC } from "react";
import { NFT } from "types/NFT";
import { ipfs2http } from "utils/ipfs2http";
import { ShareButtons } from "./ShareButtons";
import { useLocale } from "src/hooks/useLocale";
import NextLink from "next/link";

type Props = {
  nft: NFT.Metadata;
  tokenId: number;
  shareURL?: boolean;
  clickable?: boolean;
  address?: string;
  showShareButtons?: boolean;
  showOpenSeaLink?: boolean;
};

export const NFTItem: FC<Props> = ({
  nft,
  tokenId,
  clickable = true,
  address = "",
  showShareButtons = false,
}) => {
  const { tokenid } = useRouter().query;
  const { t } = useLocale();
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
                <Image src={ipfs2http(nft.image)} alt={nft.name} />
              </Box>
              <Box>
                <Text fontSize="md" fontWeight="bold" mt={2}>
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
      </Flex>
    </>
  );
};
