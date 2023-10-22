import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";
import { useGrantRole } from "src/hooks/useEvent";
import { useLocale } from "src/hooks/useLocale";
import AlertMessage from "src/components/atoms/form/AlertMessage";

type GrantRoleProps = {
  groupId: number;
};

const DEFAULT_INPUT_ROLE = "admin";

const GrantRole: FC<GrantRoleProps> = ({ groupId }) => {
  const { t } = useLocale();
  const [role, setRole] = useState<string>(DEFAULT_INPUT_ROLE);
  const [address, setAddress] = useState<string>("");
  const { grantRole, isGranting, grantStatus, grantError } = useGrantRole();
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleGrant = async () => {
    if (isGranting) return;
    try {
      await grantRole({ groupId, address, role });
    } catch (error) {
      console.error(error);
    }
  };

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
      <form>
        <FormControl mb={3}>
          <FormLabel htmlFor="role">{t.RBAC_ROLE}</FormLabel>
          <Select
            id="role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
            }}
          >
            <option value="admin">{t.RBAC_ADMIN_ROLE}</option>
            <option value="collaborator">{t.RBAC_COLLABORATOR_ROLE}</option>
          </Select>
        </FormControl>
        <FormControl mb={3}>
          <FormLabel htmlFor="address">{t.RBAC_WALLET_ADDRESS}</FormLabel>
          <Input
            id="address"
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
            }}
          />
        </FormControl>
        <Button
          isLoading={isGranting}
          disabled={!role || !address}
          onClick={handleGrant}
          w="full"
        >
          {t.RBAC_GRANT_ROLE}
        </Button>
      </form>
    </>
  );
};

export default GrantRole;
