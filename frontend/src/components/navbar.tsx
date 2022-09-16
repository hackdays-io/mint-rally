import { CalendarIcon, HamburgerIcon, SettingsIcon } from "@chakra-ui/icons";

import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  IconButton,
  Link,
  Spacer,
  useDisclosure,
} from "@chakra-ui/react";
import {
  useAddress,
  useChainId,
  useDisconnect,
  useMetamask,
} from "@thirdweb-dev/react";
import NextLink from "next/link";

import router from "next/router";
import Image from "next/image";
import { switchNetwork } from "./atoms/web3/LoginRequired";
import { useLocale } from "../hooks/useLocale";
import LocaleSelector from "./atoms/LocaleSelector";

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const address = useAddress();
  const chainId = useChainId();
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();
  const requiredChainId = +process.env.NEXT_PUBLIC_CHAIN_ID!;
  const { t } = useLocale();

  const MetamaskLogin = () => {
    return (
      <Flex justifyContent="center" alignItems="center" mt={{ base: 5, md: 0 }}>
        {address ? (
          <>
            {chainId !== requiredChainId ? (
              <Box pr={4}>
                <Button
                  bg="mint.subtle"
                  color="mint.font"
                  borderRadius={"16px"}
                  variant="solid"
                  onClick={switchNetwork}
                  size="md"
                >
                  {t.SWITCH_NETWORK}
                </Button>
              </Box>
            ) : (
              <></>
            )}
            <Button
              bg="mint.subtle"
              color="mint.font"
              borderRadius={"16px"}
              variant="solid"
              onClick={disconnectWallet}
              size="md"
            >
              {t.SIGN_OUT}
            </Button>
          </>
        ) : (
          <Button
            bg="mint.subtle"
            color="mint.font"
            borderRadius={"16px"}
            variant="solid"
            onClick={connectWithMetamask}
            size="md"
          >
            {t.SIGN_IN}
          </Button>
        )}
        {address && (
          <Box marginLeft={3} cursor="pointer">
            <Link href="/users/me" as={NextLink}>
              <Image
                src="/user.png"
                alt="Loggedin"
                width={50}
                height={50}
                objectFit="contain"
              />
            </Link>
          </Box>
        )}
      </Flex>
    );
  };

  return (
    <>
      <Flex
        as="nav"
        bg="mint.bg"
        align="center"
        color="mint.front"
        justify="space-between"
        px={{ base: 3, md: 5 }}
        pr={{ base: 0, md: 5 }}
      >
        <Flex
          justifyContent="center"
          width={{ base: "150px", md: "auto" }}
          pr={8}
        >
          <Link href="/">
            <Image
              src={"/images/logo.svg"}
              height={75}
              width={200}
              objectFit="contain"
              alt="Mint Rally Logo"
            />
          </Link>
        </Flex>
        <Box pr={4} display={{ base: "none", md: "block" }}>
          <Link href="/event-groups" as={NextLink}>
            <Button
              leftIcon={<SettingsIcon />}
              bg="mint.white"
              color="mint.font"
              borderRadius={"16px"}
              variant="solid"
              size="md"
            >
              {t.EVENTGROUPS}
            </Button>
          </Link>
        </Box>
        <Box display={{ base: "none", md: "block" }}>
          <Link href="/events" as={NextLink}>
            <Button
              leftIcon={<CalendarIcon />}
              bg="mint.white"
              color="mint.font"
              borderRadius={"16px"}
              variant="solid"
              size="md"
            >
              {t.EVENTS}
            </Button>
          </Link>
        </Box>
        <Flex
          align="center"
          fontSize="sm"
          flexGrow={2}
          display={{ base: "none", md: "flex" }}
        >
          <Spacer />
          <a href="https://s.c4j.jp/summit-nft" as={NextLink} target="_blank">
            <Button
              bg="mint.subtle"
              color="mint.font"
              borderRadius={"16px"}
              variant="solid"
              size="md"
              mr={4}
            >
              {t.HELP}
            </Button>
          </a>
          <LocaleSelector></LocaleSelector>
          <Box px={4}>
            <MetamaskLogin></MetamaskLogin>
          </Box>
        </Flex>

        <IconButton
          aria-label="Menu"
          icon={<HamburgerIcon />}
          size="lg"
          variant="unstyled"
          display={{ base: "flex", md: "none" }}
          onClick={onOpen}
        />
      </Flex>
      <Drawer placement="left" size="xs" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay>
          <DrawerContent>
            <DrawerBody p={0} bg="gray.100" textAlign="center">
              <Button w="100%" onClick={() => router.push("/")}>
                {t.TOP}
              </Button>
              <Button w="100%" onClick={() => router.push("/event-groups/")}>
                {t.EVENTGROUPS}
              </Button>
              <Button w="100%" onClick={() => router.push("/events/")}>
                {t.EVENTS}
              </Button>
              <Link
                href="https://hackdays.notion.site/MintRally-60edfe77fe8e43668f0179d9693dc7b0"
                as={NextLink}
                target="_blank"
              >
                <Button w="100%">{t.HELP}</Button>
              </Link>
              <LocaleSelector></LocaleSelector>
              <MetamaskLogin></MetamaskLogin>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  );
};
export default Navbar;
