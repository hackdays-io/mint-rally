import type { NextPage } from 'next'
import { useAddress } from '@thirdweb-dev/react';
import { Box } from '@chakra-ui/react';

const Home: NextPage = () => {
  const address = useAddress();
  return (
    <>
      hoge
      <Box>{address}</Box>  
    </>      
  )
}

export default Home
