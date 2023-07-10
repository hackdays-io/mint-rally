// SNS share buttons for NFTs
import {
  Box,
  Button,
  Flex,
  Image,
  Text,
  Textarea,
  useDisclosure,
  Icon,
} from "@chakra-ui/react";
import { FC, useEffect } from "react";
import { TwitterShareButton, TwitterIcon } from "next-share";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { CopyIcon } from "@chakra-ui/icons";

type Props = {
  tokenId: number;
  address: string;
  twitter?: boolean;
};

export const ShareButtons: FC<Props> = ({
  tokenId,
  address,
  twitter = null,
}) => {
  const copyClipBoard = () => {
    const copyText: any = document.getElementById("shareURL");
    copyText?.select();
    navigator.clipboard.writeText(copyText.value);
  };

  return (
    <Flex alignItems="center" justifyContent="center">
      <Text mb={1}>Share on</Text>
      {twitter && (
        <Box p={1}>
          <TwitterShareButton
            url={`https://mintrally.xyz/users/${address}?tokenid=${tokenId}`}
            title={`Check out my NFT on Mintrally!`}
            hashtags={["MintRally"]}
          >
            <TwitterIcon size={32} round />
          </TwitterShareButton>
        </Box>
      )}
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
  );
};
