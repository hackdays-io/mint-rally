import { CalendarIcon, EmailIcon, HamburgerIcon, SettingsIcon } from "@chakra-ui/icons";

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
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";
import router from "next/router";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();

  const MetamaskLogin = () => {
    return (
      <>
        <Flex alignItems="center">
          <Box marginRight="3">
            {address ? (
              <Button bg="mint.subtle" color="mint.font" borderRadius={'16px'} variant='solid' onClick={disconnectWallet} size="lg">
                Sign out
              </Button>
            ) : (
              <Button bg="mint.subtle" color="mint.font" borderRadius={'16px'} variant='solid' onClick={connectWithMetamask} size="lg">
                Sign in
              </Button>
            )}
          </Box>{" "}
          {address ? (
            <Flex as="a" marginLeft="3" href={"/users/" + address}>
              <Image
                src="/user.png"
                alt="Loggedin"
                width={65.78}
                height={65.78}
                objectFit="contain"
              />
            </Flex>
          ) : (
            <Flex marginLeft="3">
              <Image
                src="/images/guest.svg"
                alt="guest"
                width={65.78}
                height={65.78}
                objectFit="contain"
              />
            </Flex>
          )}
        </Flex>
      </>
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
        height={'120px'}
        padding={{ base: 3, md: 5 }}
      >
        <Flex
          align="center"
          as="a"
          href="/"
          me={8}
          _hover={{ cursor: "pointer" }}
        >
          <Image
            src={'/images/logo.svg'}
            height={110}
            width={295}
            objectFit="contain"
            alt="Mint Rally Logo"
          />
        </Flex>
        <Flex
          align="center"
          fontSize="sm"
          flexGrow={2}
          display={{ base: "none", md: "flex" }}
        >
          <Box mr={8}>
            <Link href="/event-groups">
              <Button leftIcon={<SettingsIcon />} bg="mint.white" color="mint.font" borderRadius={'16px'} variant='solid' disabled={!address} size="lg">
                EventGroups
              </Button>
            </Link>
          </Box>
          <Box>
            <Link href="/events">
              <Button leftIcon={<CalendarIcon />} bg="mint.white" color="mint.font" borderRadius={'16px'} variant='solid' size="lg">
                Events
              </Button>
            </Link>
          </Box>
          <Spacer />
          <Box pr={4}>
            <MetamaskLogin></MetamaskLogin>
          </Box>
        </Flex>
        <IconButton
          aria-label="Menu"
          icon={<HamburgerIcon />}
          size="sm"
          variant="unstyled"
          display={{ base: "block", md: "none" }}
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
