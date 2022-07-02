import { HamburgerIcon } from "@chakra-ui/icons";

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
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";
import router from "next/router";
import Image from "next/image";

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();

  const MetamaskLogin = () => {
    return (
      <>
        {address ? (
          <>
            <Flex>
              <Box marginRight="3">
                <button onClick={disconnectWallet}>Disconnect Wallet</button>{" "}
              </Box>{" "}
              |
              <Flex as="a" marginLeft="3" href={"/users/" + address}>
                <Image
                  src="/user.png"
                  alt="Loggedin"
                  width={28}
                  height={28}
                  objectFit="contain"
                />
              </Flex>
            </Flex>
          </>
        ) : (
          <button onClick={connectWithMetamask}>Connect Wallet</button>
        )}
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
        padding={{ base: 3, md: 5 }}
      >
        <Flex
          align="center"
          as="a"
          href="/"
          me={8}
          _hover={{ cursor: "pointer" }}
        >
          Mint Rally
        </Flex>
        <Flex
          align="center"
          fontSize="sm"
          flexGrow={2}
          display={{ base: "none", md: "flex" }}
        >
          <Box pr={4}>
            <Link href="/event-groups/">EventGroups</Link>
          </Box>
          <Box pr={4}>
            <Link href="/events/">Events</Link>
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
