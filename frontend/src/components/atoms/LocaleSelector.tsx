import { ChevronDownIcon } from "@chakra-ui/icons";
import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

const LocaleSelector = () => {
  const router = useRouter();
  const otherLocales = router.locales!.filter((l) => l !== router.locale);
  return (
    <>
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
          <FontAwesomeIcon icon={faGlobe} />
        </MenuButton>
        <MenuList>
          {otherLocales.map((locale) => {
            return (
              <MenuItem
                key={locale}
                onClick={() => {
                  router.push(
                    {
                      pathname: router.pathname,
                      query: router.query,
                    },
                    router.asPath,
                    { locale: locale }
                  );
                }}
                as={Button}
              >
                {locale}
              </MenuItem>
            );
          })}
        </MenuList>
      </Menu>
    </>
  );
};

export default LocaleSelector;
