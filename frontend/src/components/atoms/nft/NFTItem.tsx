import { Box, Flex, Image, Text, useDisclosure } from "@chakra-ui/react";
import { FC } from "react";
import TokenModal from "src/components/molecules/user/TokenModal";
import { NFT } from "types/NFT";
import { ipfs2http } from "utils/ipfs2http";

type Props = {
  nft: NFT.Metadata;
  tokenId: number;
  shareURL?: boolean;
};

export const NFTItem: FC<Props> = ({ nft, tokenId, shareURL = true }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Flex
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        onClick={onOpen}
      >
        <Box>
          <Image src={ipfs2http(nft.image)} alt={nft.name} />
        </Box>
        <Box>
          <Text fontSize="md" fontWeight="bold" mt={2}>
            {nft.name}
          </Text>
        </Box>
      </Flex>
      <TokenModal
        nft={nft}
        tokenId={tokenId}
        isOpen={isOpen}
        onClose={onClose}
        shareURL={shareURL}
      />
    </>
  );
};
