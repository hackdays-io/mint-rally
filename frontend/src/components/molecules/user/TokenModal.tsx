import {
  Box,
  Button,
  Divider,
  Image,
  Input,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import { BigNumber } from "ethers";
import { FC } from "react";
import { ipfs2http } from "../../../../utils/ipfs2http";
import ModalBase from "../common/ModalBase";
import { NFT } from "types/NFT";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  nft: NFT.Metadata;
  shareURL?: boolean;
};

const TokenModal: FC<Props> = ({ isOpen, onClose, nft, shareURL, tokenId }) => {
  // TODO fix this
  const address = useAddress();

  const copyClipBoard = () => {
    const copyText: any = document.getElementById("shareURL");
    copyText?.select();
    document.execCommand("copy");
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

              <Text mb={1}>Share URL</Text>
              <Textarea
                id="shareURL"
                color="mint.primary"
                rows={2}
                p={1}
                value={`https://mintrally.xyz/users/${address}?tokenid=${tokenId}`}
              ></Textarea>
              <Button
                size="small"
                p={2}
                width="full"
                mt={3}
                onClick={() => copyClipBoard()}
              >
                Copy ClipBoard
              </Button>
            </Box>
          )}
        </Box>
      )}
    </ModalBase>
  );
};

export default TokenModal;
