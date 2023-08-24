import { ListItem, UnorderedList, textDecoration } from "@chakra-ui/react";
import { useLocale } from "src/hooks/useLocale";

export const MintGuide = () => {
  const { t } = useLocale();
  const guide = t.MINTGUIDE;
  return (
    <UnorderedList
      pl={0}
      mt={{ base: 3, md: 0 }}
      listStyleType={{ base: "inherit", md: "none" }}
      color="text.black"
    >
      <>
        {guide.map((item, index) => (
          <ListItem key={index} className="renderlinkunderline" mb={2}>
            <p dangerouslySetInnerHTML={{ __html: item }} />
          </ListItem>
        ))}
      </>
    </UnorderedList>
  );
};
