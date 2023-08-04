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
import { NFT } from "types/NFT";
import ordinal from "ordinal";

type Props = {
  control: Control<any, any>;
  nfts: NFT.NFTImage[];
  append: (v: any) => void;
  remove: UseFieldArrayRemove;
};

const NFTAttributesForm: FC<Props> = ({ control, nfts, append, remove }) => {
  const { t, locale } = useLocale();

  const validateUniqRequiredParticipateCount = (v: number) => {
    const vals = nfts.map((nft) => nft.requiredParticipateCount);
    if (vals.filter((val) => val == v).length > 1) {
      return "required participate count should be unique";
    } else {
      return true;
    }
  };

  const validateHasImage = (nft: NFT.NFTImage) => {
    if (nft.fileObject || nft.image) {
      return true;
    } else {
      return "NFT image is required";
    }
  };

  const parseErrorJson = (errors: any, index: number, key: string) => {
    if (errors.nfts && errors.nfts[index]) {
      return errors.nfts[index][key]?.message;
    }
  };

  return (
    <Box>
      {nfts.map((nft, index) => (
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
              name={`nfts.${index}.fileObject`}
              rules={{
                validate: {
                  required: () => validateHasImage(nfts[index]),
                },
              }}
              render={({
                field: { onChange, value },
                formState: { errors },
              }) => (
                <>
                  <ImageSelectorWithPreview
                    onChangeData={(newFile) => {
                      onChange(newFile);
                    }}
                    value={nfts[index].image || value}
                  />
                  <ErrorMessage>
                    {parseErrorJson(errors, index, "fileObject")}
                  </ErrorMessage>
                </>
              )}
            />
          </Box>
          <Box ml={{ md: 5, base: 0 }} width="100%">
            <Box>
              <Text>{t.NFT_NAME}</Text>
              <Controller
                control={control}
                name={`nfts.${index}.name`}
                rules={{
                  required: "NFT name is required",
                }}
                render={({
                  field: { onChange, value },
                  formState: { errors },
                }) => (
                  <>
                    <Input
                      variant="outline"
                      value={value || nfts[index].name}
                      onChange={(e) => {
                        onChange(e.target.value);
                      }}
                    />
                    <ErrorMessage>
                      {parseErrorJson(errors, index, "name")}
                    </ErrorMessage>
                  </>
                )}
              />
            </Box>
            <Box mt={2}>
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
                      value={value || nfts[index].description}
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
                      // 追加用のNFTは2回目の追加様なので、2回目以上の数字(内部値でいうと0)のみ設定可能とする。
                      // 表示値ではなくて内部値でチェックするので2回目を意味する1よりも大きい数となる様にバリデーションを行っている。
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
                          // 内部的に1回目の参加でMintさせたい場合は内部的には0と設定する必要があるが、利用者へ伝わらないので表示状が1となる様にする。
                          // その為、画面上に表示されているから1引いた値を内部値へ反映させる。
                          value={value + 1}
                          min={2}
                          onChange={(__, num) => {
                            // 内部的に1回目の参加でMintさせたい場合は内部的には0と設定する必要があるが、利用者へ伝わらないので表示状が1となる様にする。
                            // その為、画面上に表示されているから1引いた値を内部値へ反映させる。
                            onChange(num - 1);
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
                  <Text mt={1} fontWeight="bold">
                    {locale === "ja" ? (
                      <>
                        {nft.requiredParticipateCount + 1}
                        回目参加する参加者に配布されます。
                      </>
                    ) : (
                      <>
                        It will be distributed to participants who attend a{" "}
                        {ordinal(nft.requiredParticipateCount + 1)} time.
                      </>
                    )}
                  </Text>
                </>
              ) : (
                <Text fontWeight="bold">{t.NFT_DEFAULT}</Text>
              )}
            </Box>
          </Box>
          {index !== 0 && (
            <IconButton
              position="absolute"
              right="0"
              top="-20px"
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
              // 内部的に1回目の参加でMintさせたい場合は内部的には0と設定する必要があるが、利用者へ伝わらないので表示状が1となる様にする。
              // 上記前提の元、入力欄を追加した時に利用者から見てキリの良い数字(10)が表示される事を目的に初期値を9としている。
              requiredParticipateCount: 4,
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
