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
  Spacer,
  useDisclosure,
} from "@chakra-ui/react";
import {
  useAddress,
  useChainId,
  useDisconnect,
  useMetamask,
} from "@thirdweb-dev/react";
import router from "next/router";
import Image from "next/image";
import Link from "next/link";
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
                  size="lg"
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
              size="lg"
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
            size="lg"
          >
            {t.SIGN_IN}
          </Button>
        )}
        {address && (
          <Box marginLeft={3} cursor="pointer">
            <Link href="/users/me">
              <Image
                src="/user.png"
                alt="Loggedin"
                width={65.78}
                height={65.78}
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
              height={93.5}
              width={250}
              objectFit="contain"
              alt="Mint Rally Logo"
            />
          </Link>
        </Flex>
        <Box pr={4} display={{ base: "none", md: "block" }}>
          <Link href="/event-groups">
            <Button
              leftIcon={<SettingsIcon />}
              bg="mint.white"
              color="mint.font"
              borderRadius={"16px"}
              variant="solid"
              size="lg"
            >
              {t.EVENTGROUPS}
            </Button>
          </Link>
        </Box>
        <Box display={{ base: "none", md: "block" }}>
          <Link href="/events">
            <Button
              leftIcon={<CalendarIcon />}
              bg="mint.white"
              color="mint.font"
              borderRadius={"16px"}
              variant="solid"
              size="lg"
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
          <Box pr={4}>
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
            <DrawerBody p={0} bg="gray.100">
              <Button w="100%" onClick={() => router.push("/")}>
                {t.TOP}
              </Button>
              <Button w="100%" onClick={() => router.push("/event-groups/")}>
                {t.EVENTGROUPS}
              </Button>
              <Button w="100%" onClick={() => router.push("/events/")}>
                {t.EVENTS}
              </Button>
              <MetamaskLogin></MetamaskLogin>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  );
};
export default Navbar;
