import { Box, Button, Flex, FormLabel, Input, Text } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { useResetSecretPhrase } from "src/hooks/useMintNFT";
import AlertMessage from "../atoms/form/AlertMessage";
import { useLocale } from "src/hooks/useLocale";

type Props = {
  eventId: BigNumber;
};

type FormData = {
  secretPhrase: string;
};

const ResetSecretPhrase: FC<Props> = ({ eventId }) => {
  const { t } = useLocale();
  const { reset, error, isReseting, isSuccess } = useResetSecretPhrase(eventId);

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { secretPhrase: "" },
  });

  const submit = async (data: FormData) => {
    if (!data.secretPhrase || isReseting) return;
    await reset(data.secretPhrase);
  };

  return (
    <>
      <Box>
        <form onSubmit={handleSubmit(submit)}>
          <Text fontWeight="bold">{t.SECRET_PHRASE_RESET}</Text>
          <FormLabel color="grey.600" fontSize="sm">
            {t.SECRET_PHRASE_RESET_NEW}
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
                  placeholder={t.SECRET_PHRASE_RESET_NEW}
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
              {t.EVENT_ADMIN_SUBMIT}
            </Button>
          </Flex>
        </form>
      </Box>
      {isSuccess && (
        <AlertMessage status="success" title={t.SECRET_PHRASE_RESET_SUCCESS} />
      )}

      {error && (
        <AlertMessage title={t.SECRET_PHRASE_RESET_FAIL}>
          {(error as any).reason}
        </AlertMessage>
      )}
    </>
  );
};

export default ResetSecretPhrase;
