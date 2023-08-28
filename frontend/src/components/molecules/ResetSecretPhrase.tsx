import { Box, Button, Flex, FormLabel, Input, Text } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { useResetSecretPhrase } from "src/hooks/useMintNFT";
import AlertMessage from "../atoms/form/AlertMessage";

type Props = {
  eventId: BigNumber;
};

type FormData = {
  secretPhrase: string;
};

const ResetSecretPhrase: FC<Props> = ({ eventId }) => {
  const { reset, error, isReseting, isSuccess } = useResetSecretPhrase(eventId);

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { secretPhrase: "" },
  });

  const submit = async (data: FormData) => {
    if (!data.secretPhrase || isReseting) return;
    await reset(data.secretPhrase);
  };

  return (
    <Box>
      <form onSubmit={handleSubmit(submit)}>
        <Text fontWeight="bold" mb={2}>
          あいことばのリセット
        </Text>
        <FormLabel fontWeight="bold" fontSize="sm">
          新しいあいことば
        </FormLabel>
        <Flex alignItems="center">
          <Controller
            control={control}
            name="secretPhrase"
            render={({ field }) => (
              <Input
                backgroundColor="white"
                maxW={300}
                value={field.value}
                onChange={field.onChange}
                placeholder="新しいあいことばを入力"
              />
            )}
          />
          <Button
            ml={3}
            size="sm"
            backgroundColor="transparent"
            border="1px solid"
            borderColor="yellow.800"
            color="yellow.800"
            type="submit"
            isLoading={isReseting}
            disabled={isReseting}
          >
            変更する
          </Button>
        </Flex>
        {isSuccess && (
          <AlertMessage status="success" title="あいことばをリセットしました" />
        )}

        {error && (
          <AlertMessage title="あいことばのリセット中にエラーが発生しました">
            {(error as any).reason}
          </AlertMessage>
        )}
      </form>
    </Box>
  );
};

export default ResetSecretPhrase;
