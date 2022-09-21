import { CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
} from "@chakra-ui/react";
import { FC } from "react";
import { Controller, Control, UseFieldArrayRemove } from "react-hook-form";
import { useLocale } from "../../hooks/useLocale";
import ErrorMessage from "../atoms/form/ErrorMessage";
import ImageSelectorWithPreview from "../ImageSelectorWithPreview";

type Props = {
  control: Control<any, any>;
  nfts: {
    description: string;
    fileObject?: File | null;
    image?: string;
    requiredParticipateCount: number;
  }[];
  append: (v: any) => void;
  remove: UseFieldArrayRemove;
};

const NFTAttributesForm: FC<Props> = ({ control, nfts, append, remove }) => {
  const { t } = useLocale();

  const validateUniqRequiredParticipateCount = (v: number) => {
    const vals = nfts.map((nft) => nft.requiredParticipateCount);
    if (vals.filter((val) => val == v).length > 1) {
      return "required participate count should be unique";
    } else {
      return true;
    }
  };

  const parseErrorJson = (errors: any, index: number, key: string) => {
    if (errors.nfts && errors.nfts[index]) {
      return errors.nfts[index][key]?.message;
    }
  };

  return (
    <Box>
      {nfts.map((_, index) => (
        <Flex
          key={index}
          w="full"
          flexDirection={{ base: "column", md: "row" }}
          mb={10}
          position="relative"
        >
          <Box flexBasis="300px" flexShrink="0" minH="300px" mb={3}>
            <Controller
              control={control}
              name={`nfts.${index}.image`}
              rules={{ required: "NFT Image is required" }}
              render={({
                field: { onChange, value },
                formState: { errors },
              }) => (
                <>
                  <ImageSelectorWithPreview
                    onChangeData={(newFile) => {
                      onChange(newFile);
                    }}
                    value={value}
                  />
                  <ErrorMessage>
                    {parseErrorJson(errors, index, "fileObject")}
                  </ErrorMessage>
                </>
              )}
            />
          </Box>
          <Box ml={{ md: 5, base: 0 }}>
            <Box>
              <Text>{t.NFT_DESC}</Text>
              <Controller
                control={control}
                name={`nfts.${index}.description`}
                rules={{
                  required: "NFT description is required",
                }}
                render={({
                  field: { onChange, value },
                  formState: { errors },
                }) => (
                  <>
                    <Input
                      variant="outline"
                      value={value}
                      onChange={(e) => {
                        onChange(e.target.value);
                      }}
                    />
                    <ErrorMessage>
                      {parseErrorJson(errors, index, "description")}
                    </ErrorMessage>
                  </>
                )}
              />
            </Box>
            <Box mt={2}>
              {index > 0 ? (
                <>
                  <Text>{t.TIMES_PARTICIPATE}</Text>
                  <Controller
                    control={control}
                    name={`nfts.${index}.requiredParticipateCount`}
                    rules={{
                      required: "Times participation is required",
                      min: 1,
                      validate: {
                        uniq: (v) => validateUniqRequiredParticipateCount(v),
                      },
                    }}
                    render={({
                      field: { onChange, value },
                      formState: { errors },
                    }) => (
                      <>
                        <NumberInput
                          value={value}
                          min={1}
                          onChange={(__, num) => {
                            onChange(num);
                          }}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <ErrorMessage>
                          {parseErrorJson(
                            errors,
                            index,
                            "requiredParticipateCount"
                          )}
                        </ErrorMessage>
                      </>
                    )}
                  />
                </>
              ) : (
                <Text>{t.NFT_DEFAULT}</Text>
              )}
            </Box>
          </Box>
          {index !== 0 && (
            <IconButton
              position="absolute"
              right="0"
              top="0"
              borderRadius="full"
              aria-label=""
              icon={<Icon as={CloseIcon} color="mint.primary" />}
              onClick={() => remove(index)}
            />
          )}
        </Flex>
      ))}
      <Box textAlign="center">
        <Button
          width="400px"
          maxWidth="90%"
          rounded="full"
          onClick={() =>
            append({
              description: "",
              fileObject: null,
              requiredParticipateCount: 10,
            })
          }
        >
          {t.EVENT_GROUP_APPEND_NFT}
        </Button>
      </Box>
    </Box>
  );
};

export default NFTAttributesForm;
