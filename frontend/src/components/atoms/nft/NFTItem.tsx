import { Box, Flex, Image, Link, Text, useDisclosure } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import TokenModal from "src/components/molecules/user/TokenModal";
import { NFT } from "types/NFT";
import { ipfs2http } from "utils/ipfs2http";
import { ShareButtons } from "./ShareButtons";
import { useLocale } from "src/hooks/useLocale";
import { QuestionIcon } from "@chakra-ui/icons";

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
  shareURL = true,
  clickable = true,
  address = "",
  showShareButtons = false,
  showOpenSeaLink = false,
}) => {
  const { tokenid } = useRouter().query;
  const { isOpen, onOpen, onClose } = useDisclosure();
  // If tokenid parameter is same as tokenId, open modal view
  useEffect(() => {
    if (!clickable && String(tokenid) == String(tokenId)) {
      onOpen();
    }
  }, [tokenid, tokenId]);
  const { t } = useLocale();

  return (
    <>
      <Flex justifyContent="center" alignItems="center" flexDirection="column">
        <Flex
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          p={4}
          border="1px"
        >
          <Box onClick={onOpen}>
            <Image src={ipfs2http(nft.image)} alt={nft.name} />
          </Box>
          <Box onClick={onOpen}>
            <Text fontSize="md" fontWeight="bold" mt={2}>
              {nft.name}
            </Text>
          </Box>
        </Flex>
        {showShareButtons && (
          <ShareButtons tokenId={tokenId} address={address} twitter={true} />
        )}
      </Flex>
      {showOpenSeaLink && (
        <Flex>
          <QuestionIcon m={2} />
          <Link href="https://hackdays.notion.site/NFT-ea948c883ef645879d3ea86a87336598">
            {t.SHOW_NFT_ON_METAMASK}
          </Link>
        </Flex>
      )}

      {clickable && (
        <TokenModal
          nft={nft}
          tokenId={tokenId}
          isOpen={isOpen}
          onClose={onClose}
          shareURL={shareURL}
          address={address}
        />
      )}
    </>
  );
};
