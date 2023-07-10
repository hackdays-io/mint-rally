import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Input,
} from "@chakra-ui/react";
import Link from "next/link";
import { FC, useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useCreateEventGroup } from "src/hooks/useEvent";
import { useLocale } from "src/hooks/useLocale";
import AlertMessage from "src/components/atoms/form/AlertMessage";

type Props = {
  address: string;
};

interface EventGroupFormData {
  groupName: string;
}

export const CreateEventGroupForm: FC<Props> = ({ address }) => {
  const { t } = useLocale();

  const {
    createEventGroup,
    createStatus,
    isCreating,
    createError,
    createdGroupId,
  } = useCreateEventGroup(address);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<EventGroupFormData>({ defaultValues: { groupName: "" } });

  const submit = useCallback(
    async (data: EventGroupFormData) => {
      if (isSubmitting) return;
      await createEventGroup(data);
    },
    [createEventGroup]
  );

  const errorMessage = useMemo(() => {
    if (createError) {
      return createError as any;
    }
  }, [createError]);

  return createdGroupId ? (
    <>
      <Box mb={5}>{t.EVENT_GROUP_CREATED}🎉</Box>
      <Link href={`/events/new?group_id=${createdGroupId}`}>
        <Button>{t.CREATE_NEW_EVENT}</Button>
      </Link>
    </>
  ) : (
    <form onSubmit={handleSubmit(submit)}>
      <Controller
        name="groupName"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Input
            variant="outline"
            type="text"
            value={field.value}
            onChange={field.onChange}
            placeholder={t.EVENT_GROUP}
          ></Input>
        )}
      />
      <Button
        isLoading={isSubmitting}
        backgroundColor="mint.bg"
        size="md"
        width="full"
        disabled={isSubmitting || isCreating}
        mt={5}
        type="submit"
      >
        {t.CREATE_NEW_EVENT_GROUP}
      </Button>

      {errorMessage && (
        <AlertMessage>
          {errorMessage?.reason || errorMessage?.message}
        </AlertMessage>
      )}
    </form>
  );
};
