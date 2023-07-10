import {
  Box,
  Flex,
  Divider,
  Image,
  Link,
  Text,
  Textarea,
  Icon,
  Button,
} from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import { FC } from "react";
import { ipfs2http } from "../../../../utils/ipfs2http";
import ModalBase from "../common/ModalBase";
import { NFT } from "types/NFT";
import { OpenseaIcon } from "../../atoms/icons/opensea/OpenseaIcon";
import { TwitterShareButton, TwitterIcon } from "next-share";
import { CopyIcon } from "@chakra-ui/icons";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  nft: NFT.Metadata;
  shareURL?: boolean;
  address: string;
};

const TokenModal: FC<Props> = ({
  isOpen,
  onClose,
  nft,
  shareURL,
  tokenId,
  address,
}) => {
  const { address: urladdress } = useRouter().query;
  const myaddress = useAddress();

  if (address == "" || address == undefined) {
    if (urladdress == undefined) {
      address = String(myaddress);
    } else {
      address = String(urladdress);
    }
  }
  const copyClipBoard = () => {
    const copyText: any = document.getElementById("shareURL");
    copyText?.select();
    navigator.clipboard.writeText(copyText.value);
  };

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

          {shareURL && (
            <Box>
              <Divider my={3} />

              <Flex alignItems="center" justifyContent="center">
                <Text mb={1}>Share on</Text>
                <Box p={1}>
                  <TwitterShareButton
                    url={`https://mintrally.xyz/users/${address}?tokenid=${tokenId}`}
                    title={`Check out my NFT on Mintrally!`}
                    hashtags={["MintRally"]}
                  >
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>
                </Box>
                <Textarea
                  id="shareURL"
                  color="mint.primary"
                  hidden={true}
                  rows={2}
                  p={1}
                  value={`https://mintrally.xyz/users/${address}?tokenid=${tokenId}`}
                ></Textarea>
                <Icon
                  as={CopyIcon}
                  onClick={() => copyClipBoard()}
                  w={6}
                  h={6}
                  color="green.500"
                  size="lg"
                  m={1}
                ></Icon>
              </Flex>
            </Box>
          )}
          <Box>
            <Link
              href={`${openseaLinkByChainId()}/${
                process.env.NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER
              }/${tokenId}`}
              target="_blank"
            >
              <Button
                size="small"
                p={2}
                width="full"
                mt={3}
                leftIcon={<OpenseaIcon />}
              >
                OpenSea
              </Button>
            </Link>
          </Box>
        </Box>
      )}
    </ModalBase>
  );
};

export default TokenModal;
