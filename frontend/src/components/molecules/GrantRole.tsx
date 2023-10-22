import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocale } from "src/hooks/useLocale";
import { useGrantRole } from "src/hooks/useEvent";
import AlertMessage from "src/components/atoms/form/AlertMessage";

type GrantRoleProps = {
  groupId: number;
};

type GrantRoleFormData = {
  role: string;
  address: string;
};

const DEFAULT_INPUT_ROLE = "admin";

const GrantRole: FC<GrantRoleProps> = ({ groupId }) => {
  const { t } = useLocale();
  const [formData, setFormData] = useState<GrantRoleFormData | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    register,
  } = useForm<GrantRoleFormData>({
    mode: "all",
    defaultValues: {
      role: DEFAULT_INPUT_ROLE,
      address: "",
    },
  });
  const { grantRole, isGranting, grantStatus, grantError } = useGrantRole();
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onSubmit = async (data: GrantRoleFormData) => {
    setFormData(data);
  };

  useEffect(() => {
    if (!formData) return;

    const grant = async () => {
      if (isGranting) return;
      try {
        const params = {
          groupId,
          address: formData.address,
          role: formData.role,
        };
        await grantRole(params);
      } catch (error) {
        console.error(error);
      }
    };
    grant();
  }, [formData]);

  useEffect(() => {
    if (grantStatus === "success") {
      setSuccessMessage(t.RBAC_GRANT_SUCCESS);
    }
  }, [grantStatus]);

  useEffect(() => {
    if (grantError) {
      console.error(grantError);
      setErrorMessage(t.RBAC_GRANT_ERROR);
    }
  }, [grantError]);

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
        <FormControl mb={3}>
          <FormLabel htmlFor="role">{t.RBAC_ROLE}</FormLabel>
          <Controller
            control={control}
            {...register("role")}
            name="role"
            render={({ field: { onChange, value } }) => (
              <Select id="role" value={value} onChange={onChange}>
                <option value="admin">{t.RBAC_ADMIN_ROLE}</option>
                <option value="collaborator">{t.RBAC_COLLABORATOR_ROLE}</option>
              </Select>
            )}
          />
        </FormControl>

        <FormControl mb={3}>
          <FormLabel htmlFor="address">{t.RBAC_WALLET_ADDRESS}</FormLabel>
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value }, formState: { errors } }) => (
              <>
                <Input
                  id="address"
                  onChange={onChange}
                  value={value}
                  required
                  maxLength={42}
                  pattern="^0x[a-fA-F0-9]{40}$"
                  title={t.RBAC_INPUT_ADDRESS_TITLE}
                />
              </>
            )}
          />
        </FormControl>
        <Button
          type="submit"
          isLoading={isGranting || isSubmitting}
          disabled={isGranting || isSubmitting}
          w="full"
        >
          {t.RBAC_GRANT_ROLE}
        </Button>
      </form>
    </>
  );
};

export default GrantRole;
