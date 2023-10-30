import { Box, Button, Flex, Heading, Tooltip } from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";
import { useLocale } from "src/hooks/useLocale";
import { useRevokeRole, useRolesByGroupId } from "src/hooks/useEvent";
import AlertMessage from "src/components/atoms/form/AlertMessage";

type CollaboratorsProps = {
  groupId: number;
};

type RevokeInput = {
  address: string;
  role: string;
};

const Collaborators: FC<CollaboratorsProps> = ({ groupId }) => {
  const { t } = useLocale();
  const { rolesList, getRolesByGroupId } = useRolesByGroupId();
  const { revokeRole, isRevoking, revokeStatus, revokeError } = useRevokeRole();
  const [revokeInput, setRevokeInput] = useState<RevokeInput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const isSelectedRevokeInput = (address: string, role: string) => {
    if (revokeInput === null) return false;
    return revokeInput.address === address && revokeInput.role === role;
  };

  const updateRevokeInput = async (address: string, role: string) => {
    if (
      revokeInput !== null &&
      revokeInput?.address == address &&
      revokeInput?.role == role
    ) {
      setRevokeInput(null); // clear input
    } else {
      setRevokeInput({ address, role });
    }
  };

  const handleRevoke = async () => {
    if (revokeInput === null) return;

    const revoke = async () => {
      if (isRevoking) return;
      try {
        const params = {
          groupId,
          address: revokeInput.address,
          role: revokeInput.role,
        };
        await revokeRole(params);
      } catch (error) {
        console.error(error);
      }
    };
    revoke();
  };

  useEffect(() => {
    getRolesByGroupId(groupId);
  }, [groupId]);

  useEffect(() => {
    if (revokeStatus === "success") {
      setRevokeInput(null);
      setErrorMessage("");
    }
  }, [revokeStatus]);

  useEffect(() => {
    if (revokeError) {
      console.error(revokeError);
      setErrorMessage(t.RBAC_REVOKE_ERROR);
    }
  }, [revokeError]);

  return (
    <>
      {errorMessage && (
        <Box my={2}>
          <AlertMessage status="error" title={errorMessage} />
        </Box>
      )}

      <Heading as="h3" size="md" mb={2}>
        {t.RBAC_ADMINS}
      </Heading>
      <Flex flexWrap="wrap" columnGap={1} rowGap={1} mb={4}>
        {rolesList
          ?.filter((roles) => {
            return roles.admin === true;
          })
          .map((roles) => (
            <Tooltip
              label={roles.assignee}
              backgroundColor="white"
              color="yellow.900"
              fontSize="xs"
              key={`${roles.assignee}`}
            >
              <Box
                as="span"
                px={3}
                py={1}
                fontSize="xs"
                borderRadius="full"
                border="2px solid lightgray"
                backgroundColor={
                  isSelectedRevokeInput(roles.assignee, "admin")
                    ? "mint.primary"
                    : "white"
                }
                onClick={() => updateRevokeInput(roles.assignee, "admin")}
              >
                {roles.assignee.slice(0, 5)}...{roles.assignee.slice(-3)}
              </Box>
            </Tooltip>
          ))}
      </Flex>

      <Heading as="h3" size="md" mb={2}>
        {t.RBAC_COLLABORATORS}
      </Heading>
      <Flex flexWrap="wrap" columnGap={1} rowGap={1}>
        {rolesList
          ?.filter((roles) => {
            return roles.collaborator === true;
          })
          .map((roles) => (
            <Tooltip
              label={roles.assignee}
              backgroundColor="white"
              color="yellow.900"
              fontSize="xs"
              key={`${roles.assignee}`}
            >
              <Box
                as="span"
                px={3}
                py={1}
                fontSize="xs"
                borderRadius="full"
                border="2px solid lightgray"
                backgroundColor={
                  isSelectedRevokeInput(roles.assignee, "collaborator")
                    ? "mint.primary"
                    : "white"
                }
                onClick={() =>
                  updateRevokeInput(roles.assignee, "collaborator")
                }
              >
                {roles.assignee.slice(0, 5)}...{roles.assignee.slice(-3)}
              </Box>
            </Tooltip>
          ))}
      </Flex>

      <Button
        onClick={handleRevoke}
        isLoading={isRevoking}
        disabled={isRevoking || revokeInput === null}
        w="full"
        mt={4}
      >
        {t.RBAC_REVOKE_ROLE}
      </Button>
    </>
  );
};

export default Collaborators;
