// SNS share buttons for NFTs
import { Flex, Text, Textarea, Icon } from "@chakra-ui/react";
import { FC, useMemo } from "react";
import {
  TwitterShareButton,
  TwitterIcon,
  FacebookShareButton,
  FacebookIcon,
} from "next-share";
import { CopyIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { XIcon } from '../icons/TwitterXicon/TwitterXIcon.';


type Props = {
  tokenId: number;
  address: string;
  twitter?: boolean;
  facebook?: boolean;
};

export const ShareButtons: FC<Props> = ({
  tokenId,
  address,
  twitter = null,
  facebook = null,
}) => {
  const router = useRouter();
  const shareUrl = useMemo(() => {
    return `https://mintrally.xyz/${router.locale}/nfts/${tokenId}`;
  }, [router.locale, tokenId]);
  const copyClipBoard = () => {
    const copyText: any = document.getElementById("shareURL");
    copyText?.select();
    navigator.clipboard.writeText(copyText.defaultValue);
  };

  return (
    <Flex alignItems="center">
      <Text mb={1} mr={5}>
        Share on
      </Text>
      {twitter && (
        <TwitterShareButton
          url={shareUrl}
          title={`Check out my NFT on Mintrally!`}
          hashtags={["MintRally"]}
          style={{ marginRight: "5px" }}
        >
          <TwitterIcon size={32} round />
        </TwitterShareButton>
      )}
      {facebook && (
        <FacebookShareButton
          url={shareUrl}
          quote={`Check out my NFT on Mintrally!`}
          hashtag="#MintRally"
        >
          <FacebookIcon size={32} round />
        </FacebookShareButton>
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
        defaultValue={shareUrl}
      ></Textarea>
    </Flex>
  );
};
