import { ListItem, UnorderedList, textDecoration } from "@chakra-ui/react";

export const MintGuide = () => (
  <>
    <UnorderedList>
      <ListItem>
        MetaMaskの利用が初めての方は
        <a
          href="https://hackdays.notion.site/Way-to-Mint-9583d30c43e6441b877128e39804253a#3d86c1130e78407292a04d4647da17df"
          target="help"
          style={{ textDecoration: "underline" }}
        >
          こちら
        </a>
        をクリック。
      </ListItem>
      <ListItem>
        あいことばが分からない方はイベント主催者に確認してください。
      </ListItem>
      <ListItem>
        MintRally についてのよくある質問は
        <a
          href="https://hackdays.notion.site/WIP-d9872519b9254933b641a3428c697192"
          target="help"
          style={{ textDecoration: "underline" }}
        >
          こちら
        </a>
      </ListItem>
    </UnorderedList>
  </>
);
