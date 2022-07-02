
import { HamburgerIcon } from "@chakra-ui/icons"

import { Box, Button, Drawer, DrawerBody, DrawerContent, DrawerOverlay, Flex, Heading, IconButton, Link, Spacer, useDisclosure } from "@chakra-ui/react"

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
        <Flex align="center" as="a" me={8} _hover={{ cursor: "pointer" }}>
          <Heading as="h1" fontSize={{ base: "md", md: "lg" }}>
            Mint Rally
          </Heading>
        </Flex>
        <Flex
          align="center"
          fontSize="sm"
          flexGrow={2}
          display={{ base: "none", md: "flex" }}
        >
          <Box pr={4}>
            <Link>Events</Link>
          </Box>
          <Spacer/>
          <Box pr={4}>
            <Link>Login</Link>
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
              <Button w="100%">Top</Button>
              <Button w="100%">Events</Button>
              <Button w="100%">Login</Button>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
  </>
)}
export default Navbar