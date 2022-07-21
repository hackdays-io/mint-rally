import {
  CalendarIcon,
  EmailIcon,
  HamburgerIcon,
  SettingsIcon,
} from "@chakra-ui/icons";

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
  useBoolean,
  useDisclosure,
} from "@chakra-ui/react";
import {
  ChainId,
  useAddress,
  useDisconnect,
  useMetamask,
  useNetwork,
  useNetworkMismatch,
} from "@thirdweb-dev/react";
import router from "next/router";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useBoolean(false);
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const isMismatched = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const disconnectWallet = useDisconnect();

  const MetamaskLogin = () => {
    if (isMismatched && switchNetwork) {
      return (
        <Flex
          justifyContent="center"
          alignItems="center"
          mt={{ base: 5, md: 0 }}
        >
          <Button
            bg="mint.subtle"
            color="mint.font"
            borderRadius={"16px"}
            variant="solid"
            isLoading={loading}
            onClick={async () => {
              setLoading.on();
              await switchNetwork(ChainId.Mumbai);
              setLoading.off();
            }}
            size="lg"
          >
            Switch to Mumbai Testnet
          </Button>
        </Flex>
      );
    }
    if (address) {
      return (
        <Flex
          justifyContent="center"
          alignItems="center"
          mt={{ base: 5, md: 0 }}
        >
          <Button
            bg="mint.subtle"
            color="mint.font"
            borderRadius={"16px"}
            variant="solid"
            onClick={disconnectWallet}
            size="lg"
          >
            Disconnect
          </Button>
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
        </Flex>
      );
    }
    return (
      <Flex justifyContent="center" alignItems="center" mt={{ base: 5, md: 0 }}>
        <Button
          bg="mint.subtle"
          color="mint.font"
          borderRadius={"16px"}
          variant="solid"
          onClick={connectWithMetamask}
          size="lg"
        >
          Connect
        </Button>
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
              EventGroups
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
              Events
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
                Top
              </Button>
              <Button w="100%" onClick={() => router.push("/event-groups/")}>
                Event Groups
              </Button>
              <Button w="100%" onClick={() => router.push("/events/")}>
                Events
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
