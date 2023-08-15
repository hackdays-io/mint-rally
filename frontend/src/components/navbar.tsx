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
  ConnectWallet,
  useAddress,
  useChainId,
  useDisconnect,
  useSwitchChain,
} from "@thirdweb-dev/react";
import NextLink from "next/link";

import router from "next/router";
import Image from "next/image";
import { useLocale } from "../hooks/useLocale";
import LocaleSelector from "./atoms/LocaleSelector";

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const address = useAddress();
  const chainId = useChainId();
  const disconnectWallet = useDisconnect();
  const requiredChainId = +process.env.NEXT_PUBLIC_CHAIN_ID!;
  const { t } = useLocale();

  const switchChain = useSwitchChain();

  const Login = () => {
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
                  onClick={() => switchChain(requiredChainId)}
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
          <ConnectWallet
            theme="light"
            btnTitle={t.SIGN_IN}
            style={{ fontWeight: "bold", backgroundColor: "#562406" }}
          />
        )}
        {address && (
          <Box marginLeft={3} cursor="pointer">
            <NextLink href="/users/me">
              <Image
                src="/user.png"
                alt="Loggedin"
                width={50}
                height={50}
                objectFit="contain"
              />
            </NextLink>
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
          <NextLink href="/">
            <a>
              <Image
                src={"/images/logo.svg"}
                height={75}
                width={200}
                objectFit="contain"
                alt="Mint Rally Logo"
              />
            </a>
          </NextLink>
        </Flex>
        <Box pr={4} display={{ base: "none", md: "block" }}>
          <NextLink href="/event-groups">
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
          </NextLink>
        </Box>
        <Box display={{ base: "none", md: "block" }}>
          <NextLink href="/events">
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
          </NextLink>
        </Box>
        <Flex
          align="center"
          fontSize="sm"
          flexGrow={2}
          display={{ base: "none", md: "flex" }}
        >
          <Spacer />
          <a
            href="https://s.c4j.jp/summit-nft"
            target="_blank"
            rel="noreferrer"
          >
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
            <Login />
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
              <a
                href="https://s.c4j.jp/summit-nft"
                target="_blank"
                rel="noreferrer"
              >
                <Button w="100%">{t.HELP}</Button>
              </a>
              <LocaleSelector></LocaleSelector>
              <Login />
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  );
};
export default Navbar;
