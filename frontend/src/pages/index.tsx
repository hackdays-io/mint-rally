import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Layout from '../components/layout';
import { useAddress } from '@thirdweb-dev/react';
import { Box } from '@chakra-ui/react';

const Home: NextPage = () => {
  const address = useAddress();

  return (
    <Layout>
      
      hoge
      <Box>{address}</Box>  
    </Layout>
  )
}

export default Home
