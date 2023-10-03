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
import { XIcon } from "../icons/TwitterXicon/TwitterXicon";

type Props = {
  address: string;
  twitter?: boolean;
  facebook?: boolean;
};

export const ShareButtons: FC<Props> = ({
  address,
  twitter = null,
  facebook = null,
}) => {
  const router = useRouter();
  const shareUrl = useMemo(() => {
    return `https://mintrally.xyz/${router.locale}/users/${address}`;
  }, [router.locale, address]);
  const copyClipBoard = () => {
    const copyText: any = document.getElementById("shareURL");
    copyText?.select();
    navigator.clipboard.writeText(copyText.defaultValue);
  };

  return (
    <Flex alignItems="center">
      {/* {twitter && (
        <TwitterShareButton
          url={shareUrl}
          title={`Check out my NFT Collection on MintRally!`}
          hashtags={["MintRally"]}
          style={{ marginRight: "5px" }}
        >
          <TwitterIcon size={32} round />
        </TwitterShareButton>
      )} */}

      {/* TwitterX icon  */}
      {twitter && (
        <TwitterShareButton
          url={shareUrl}
          title={`Check out my NFT Collection on MintRally!`}
          hashtags={["MintRally"]}
          style={{ marginRight: "8px" }}
        >
          <XIcon color="black" maxWidth="18px" />
        </TwitterShareButton>
      )}

      {facebook && (
        <FacebookShareButton
          url={shareUrl}
          quote={`Check out my NFT Collection on MintRally!`}
          hashtag="#MintRally"
        >
          <FacebookIcon size={24} round />
        </FacebookShareButton>
      )}
      <Icon
        as={CopyIcon}
        onClick={() => copyClipBoard()}
        w={6}
        h={6}
        color="green.500"
        boxSize={5}
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
