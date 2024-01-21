import { FC } from "react";
import { Button, FormLabel, Textarea, Text, Box } from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { Event } from "types/Event";
import { useDropNFTs } from "src/hooks/useDropNFTs";
import { useLocale } from "src/hooks/useLocale";
import AlertMessage from "src/components/atoms/form/AlertMessage";

type Props = {
  event: Event.EventRecord;
  address: string;
};

type FormData = {
  addresses: string;
};

const DropNFTs: FC<Props> = ({ event, address }) => {
  const { t } = useLocale();
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { addresses: "" },
  });
  const { dropNFTs, dropNFTsMTX, error, isLoading, status, isDroppedComplete } =
    useDropNFTs(event, address);
  const submit = async (data: FormData) => {
    if (!data.addresses || isLoading) return;
    if (data.addresses.trim().split("\n").length > 100) {
      alert(t.YOU_CAN_DROP_UP_TO_100_NFTS_AT_ONCE);
      return;
    }
    if (event.useMtx) {
      await dropNFTsMTX(data.addresses.trim().split("\n"));
    } else {
      await dropNFTs(data.addresses.trim().split("\n"));
    }
  };
  return (
    <Box>
      <form onSubmit={handleSubmit(submit)}>
        <FormLabel mb={0} fontWeight="bold" htmlFor="addressList">
          {t.DROP_NFTS}
        </FormLabel>
        <Text color="grey.600" fontSize="sm" mb={3}>
          {t.PLEASE_ENTER_WALLET_ADDRESSES}
        </Text>
        <Controller
          control={control}
          name="addresses"
          render={({ field }) => (
            <Textarea
              backgroundColor="white"
              maxW={500}
              value={field.value}
              onChange={field.onChange}
              placeholder="0xD238C2bCeB99BBac56647b852A..."
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
          isLoading={isLoading}
          disabled={isLoading}
        >
          {t.DROPNFT_SUBMIT}
        </Button>
      </form>
      {status == "success" && !isDroppedComplete && (
        <AlertMessage status="loading" title={t.DROPPING_NFTS} />
      )}
      {status == "success" && isDroppedComplete && (
        <AlertMessage status="success" title={t.DROP_NFTS_SUCCESS} />
      )}
      {error && (
        <>
          <AlertMessage
            status="error"
            title={t.ERROR_MINTING_PARTICIPATION_NFT}
          >
            {error.reason && (
              <Text className="linebreak">: {error.reason}</Text>
            )}
          </AlertMessage>
        </>
      )}
    </Box>
  );
};

export default DropNFTs;
