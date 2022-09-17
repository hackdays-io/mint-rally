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
import { FC, ReactNode } from "react";
import { ipfs2http } from "../../../../utils/ipfs2http";
import { useTokenURI } from "../../../hooks/useMintNFTManager";
import ModalBase from "../common/ModalBase";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tokenId?: BigNumber;
  shareURL?: boolean;
};

const TokenModal: FC<Props> = ({ isOpen, onClose, tokenId, shareURL }) => {
  const { metaData } = useTokenURI(tokenId);
  const address = useAddress();

  const copyClipBoard = () => {
    const copyText: any = document.getElementById("shareURL");
    copyText?.select();
    document.execCommand("copy");
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      {metaData && (
        <Box p={{ base: 5, md: 10 }}>
          <Box mb={6}>
            <Image
              width={200}
              src={ipfs2http(String(metaData?.image))}
              alt={metaData?.name}
              m="0 auto"
            />
          </Box>
          <Text mb={2}>
            Name：
            {metaData?.name}
          </Text>
          <Text mb={2}>
            Description：
            {metaData?.description}
          </Text>
          <Text>
            Event Group ID：
            {metaData?.traits.EventGroupId}
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
                value={`https://mintrally.xyz/users/${address}?tokenid=${tokenId?.toNumber()}`}
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
