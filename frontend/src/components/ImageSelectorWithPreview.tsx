import { Image, Flex } from "@chakra-ui/react";

import ImageIcon from "./ImageIcon";
import StyledFileInput from "./StyledFileInput";

const getImageData = (file: File): Promise<string | undefined> => {
  const fileReader = new FileReader();
  return new Promise((resolve, _reject) => {
    fileReader.readAsDataURL(file);
    fileReader.addEventListener("load", (ev) => {
      resolve(fileReader.result?.toString());
    });
  });
};

const ImageSelectorWithPreview = ({
  dataUrl,
  onChangeDataUrl,
  onChangeFile,
}: {
  dataUrl: string;
  onChangeDataUrl: (dataUrl: string) => void;
  onChangeFile: (file: File) => void;
}) => (
  <StyledFileInput
    w="100%"
    h="100%"
    bgColor="gray.300"
    previewElements={
      <Flex w="100%" h="100%" align="center" justify="center">
        {dataUrl ? (
          <Image
            src={dataUrl}
            alt="image"
            fit="contain"
            maxW="100%"
            maxH="100%"
          />
        ) : (
          <ImageIcon boxSize={16} color="gray.600" mx="auto" />
        )}
      </Flex>
    }
    onFileChange={async (file) => {
      if (!file) return;
      const dataUrl = await getImageData(file);
      if (!dataUrl) return;

      onChangeFile(file);
      onChangeDataUrl(dataUrl);
    }}
  />
);

export default ImageSelectorWithPreview;
