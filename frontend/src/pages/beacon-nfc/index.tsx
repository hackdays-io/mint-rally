import { Box, Button } from "@chakra-ui/react";
import { NextPage } from "next";
import { useCallback, useEffect } from "react";

const BeaconNFC: NextPage = () => {
  const requestDevice = useCallback(() => {
    const getDevice = async () => {
      // const device = await navigator.bluetooth.requestDevice({
      //   filters: [{ name: "FSC-BP104D" }],
      // });
      // console.log(device);
      const scanned = await navigator.bluetooth.requestLEScan({
        acceptAllAdvertisements: true,
      });
      alert(scanned);
    };
    getDevice();
  }, []);

  return (
    <Box>
      <Button onClick={() => requestDevice()}>うけとる</Button>
    </Box>
  );
};

export default BeaconNFC;
