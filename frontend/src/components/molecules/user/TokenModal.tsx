import { Box, Divider, Image, Link, Text } from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import { FC } from "react";
import { ipfs2http } from "../../../../utils/ipfs2http";
import ModalBase from "../common/ModalBase";
import { NFT } from "types/NFT";
import { OpenseaIcon } from "../../atoms/icons/opensea/OpenseaIcon";
import { ShareButtons } from "src/components/atoms/nft/ShareButtons";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  nft: NFT.Metadata;
  address: string;
};

const TokenModal: FC<Props> = ({ isOpen, onClose, nft, tokenId, address }) => {
  const { address: urladdress } = useRouter().query;
  const myaddress = useAddress();

  if (address == "" || address == undefined) {
    if (urladdress == undefined) {
      address = String(myaddress);
    } else {
      address = String(urladdress);
    }
  }

  const openseaLinkByChainId = () => {
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID!;
    return chainId === "80001"
      ? "https://testnets.opensea.io/assets/mumbai"
      : chainId === "137"
      ? "https://opensea.io/assets/matic"
      : "localhost";
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      {nft && (
        <Box p={{ base: 5, md: 10 }}>
          <Box mb={6}>
            <Image
              width={200}
              src={ipfs2http(String(nft?.image))}
              alt={nft?.name}
              m="0 auto"
            />
          </Box>
          <Text mb={2}>
            Name：
            {nft?.name}
          </Text>
          <Text mb={2}>
            Description：
            {nft?.description}
          </Text>
          <Text mb={2}>
            Event Group ID：
            {nft?.traits.EventGroupId}
          </Text>
          <Text mb={2}>
            Token ID：
            {tokenId}
          </Text>

          <Divider my={5} />

          <ShareButtons tokenId={tokenId} address={address} twitter={true} />

          <Box mt={2}>
            <Link
              href={`${openseaLinkByChainId()}/${
                process.env.NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER
              }/${tokenId}`}
              target="_blank"
            >
              View on OpenSea
              <Box as="span" ml={2}>
                <OpenseaIcon />
              </Box>
            </Link>
          </Box>
        </Box>
      )}
    </ModalBase>
  );
};

export default TokenModal;
