import { Box, HTMLChakraProps } from "@chakra-ui/react";
import styled from "@emotion/styled";

const noop = () => {};

const LabelForStyledInput = styled.label`
  display: block;
  width: 100%;
  height: 100%;
  &:hover {
    cursor: pointer;
  }
`;

const StyledFileInput = ({
  previewElements,
  onFileChange = noop,
  ...rest
}: {
  previewElements: JSX.Element;
  onFileChange: (file: File | undefined | null) => void;
} & HTMLChakraProps<"div">) => (
  <Box {...rest}>
    <LabelForStyledInput>
      {previewElements}
      <input
        style={{ display: "none" }}
        type="file"
        accept="image/*"
        onChange={(e) => {
          onFileChange(e.target.files?.item(0));
        }}
      />
    </LabelForStyledInput>
  </Box>
);

export default StyledFileInput;
