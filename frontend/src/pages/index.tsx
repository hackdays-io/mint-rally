import type { NextPage } from "next";
import { useAddress } from "@thirdweb-dev/react";
import { Box } from "@chakra-ui/react";
import Image
  from "next/image";
const Home: NextPage = () => {
  const address = useAddress();
  return (
    <>
      <div>
        {/* <div
          style={{
            width: '100vw',
            height: '960px',
            maxHeight: '500px',
            backgroundImage: 'url("/images/mainImg.png")',
            backgroundRepeat: "no-repeat, no-repeat, no-repeat",
            backgroundSize: "auto, cover, cover",
            backgroundPosition: "left, center, center"
          }}
        /> */}
        <Image
          src="/images/mainImg.png"
          width={1920}
          height={960}
          alt="mainImg"
        />
      </div>
    </>
  );
};

export default Home;
