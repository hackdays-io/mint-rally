import { DefaultSeo, NextSeo } from "next-seo";
import type { NextPage } from "next";

import Head from "next/head";

const MyHead: NextPage = () => {
  const siteName = "MintRally";
  const description = "MintRally - growing NFT service";

  return (
    <>
      <DefaultSeo
        defaultTitle={siteName}
        description={description}
      ></DefaultSeo>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
    </>
  );
};

export default MyHead;
