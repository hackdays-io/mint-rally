import { Button, Flex, FormLabel, Input } from "@chakra-ui/react";
import { ChangeEvent, FC, useCallback, useMemo, useState } from "react";
import { useLocale } from "src/hooks/useLocale";
import { ipfs2http } from "utils/ipfs2http";
import { v4 as uuid } from "uuid";

type Props = {
  onChange: (file: File | undefined) => void;
  value?: string;
  removeAnimationURL: () => void;
};

const AnimationFileInput: FC<Props> = ({
  onChange,
  value,
  removeAnimationURL,
}) => {
  const { t } = useLocale();
  const [file, setFile] = useState<string>();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setFile(reader.result?.toString());
    };
  };

  const inputId = uuid();

  const previewString = useMemo(() => {
    if (file) return file;
    return typeof value === "string" ? ipfs2http(value) : "";
  }, [value, file]);

  const handleRemove = useCallback(() => {
    removeAnimationURL();
    onChange(undefined);
    setFile(undefined);
  }, []);

  return (
    <>
      <Flex gap={3}>
        <Button
          as="label"
          cursor="pointer"
          colorScheme="gray"
          size="sm"
          htmlFor={inputId}
          mb={2}
        >
          {t.EVENT_SELECT_FILE}
        </Button>
        {(file || value) && (
          <Button
            cursor="pointer"
            colorScheme="red"
            size="sm"
            mb={2}
            onClick={handleRemove}
          >
            {t.EVENT_REMOVE_FILE}
          </Button>
        )}
      </Flex>
      <Input
        id={inputId}
        display="none"
        type="file"
        accept="video/*"
        onChange={(e) => {
          handleFileChange(e);
        }}
      />
      {previewString && (
        <video width={200} height={200} src={previewString} controls />
      )}
    </>
  );
};

export default AnimationFileInput;
