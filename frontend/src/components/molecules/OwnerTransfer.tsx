import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Text,
  } from "@chakra-ui/react";
  import { FC, useState } from "react";
  import { useForm } from "react-hook-form";
  import { useLocale } from "src/hooks/useLocale";
  import { useEffect } from 'react';
  import { useRouter } from 'next/router';
  import { useTransferGroupOwner } from "src/hooks/useEvent";
  import AlertMessage from "src/components/atoms/form/AlertMessage";
  
  type OwnerTransferProps = {
    groupId: number;
  };
  
  type OwnerTransferFormData = {
    newOwnerAddress: string;
  };
  
  const OwnerTransfer: FC<OwnerTransferProps> = ({ groupId }) => {
    const router = useRouter();
    const { t } = useLocale();
    const { handleSubmit, register, formState: { isSubmitting } } = useForm<OwnerTransferFormData>({
      mode: "all",
      defaultValues: {
        newOwnerAddress: "",
      },
    });
    const { transferGroupOwner, isTransferring, transferStatus, transferError } = useTransferGroupOwner();
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
  
    const onSubmit = async (data: OwnerTransferFormData) => {
        try {
          const params = {
            groupId,
            newOwnerAddress: data.newOwnerAddress
          };
          await transferGroupOwner(params);
        } catch (error) {
          console.error(error);
          if (transferError) {
            setErrorMessage(t.TRANSFER_OWNER_ERROR);
          }
        }
      };
      
      useEffect(() => {
        if (transferStatus === 'success') {
          setSuccessMessage(t.TRANSFER_OWNER_SUCCESS);
          router.push(`/event-groups/${groupId}`);
        } else if (transferError) {
          setErrorMessage(t.TRANSFER_OWNER_ERROR);
        }
      }, [transferStatus, transferError, groupId, router]);
  
    return (
      <>
        {successMessage && (
          <Box my={2}>
            <AlertMessage status="success" title={successMessage} />
          </Box>
        )}
        {errorMessage && (
          <Box my={2}>
            <AlertMessage status="error" title={errorMessage} />
          </Box>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl mb={5}>
            <FormLabel htmlFor="newOwnerAddress">{t.TRANSFER_OWNER_WALLET_ADDRESS}</FormLabel>
            <Input
              id="newOwnerAddress"
              {...register("newOwnerAddress", {
                required: true,
                maxLength: 42,
                pattern: /^0x[a-fA-F0-9]{40}$/,
              })}
            />
          </FormControl>
          {t.TRANSFER_OWNER_NEW_ADDRESS_INPUT}
          <Button
            type="submit"
            isLoading={isTransferring || isSubmitting}
            disabled={isTransferring || isSubmitting}
            colorScheme="mintGreen"
            w="full"
          >
            {t.TRANSFER_OWNER}
          </Button>
        </form>
      </>
    );
  };
  
  export default OwnerTransfer;
  