// SNS share buttons for NFTs
import { Box, Flex, Text, Textarea, Icon, IconButton } from "@chakra-ui/react";
import { FC } from "react";
import { TwitterShareButton, TwitterIcon } from "next-share";
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
    <Flex alignItems="center">
      <Text mb={1} mr={5}>
        Share on
      </Text>
      {twitter && (
        <TwitterShareButton
          url={`https://mintrally.xyz/users/${address}?tokenid=${tokenId}`}
          title={`Check out my NFT on Mintrally!`}
          hashtags={["MintRally"]}
        >
          <TwitterIcon size={32} round />
        </TwitterShareButton>
      )}
      <Icon
        as={CopyIcon}
        onClick={() => copyClipBoard()}
        w={6}
        h={6}
        color="green.500"
        size="lg"
        mx={2}
        cursor="pointer"
      />
      <Textarea
        id="shareURL"
        color="mint.primary"
        hidden={true}
        rows={2}
        p={1}
        value={`https://mintrally.xyz/users/${address}?tokenid=${tokenId}`}
      ></Textarea>
    </Flex>
  );
};
