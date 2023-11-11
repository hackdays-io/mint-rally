import { Box, Button, Flex, Heading, Text, Tooltip } from "@chakra-ui/react";
import { FC, useEffect, useMemo, useState } from "react";
import { useLocale } from "src/hooks/useLocale";
import { useRevokeRole, useMemberRoles } from "src/hooks/useEvent";
import AlertMessage from "src/components/atoms/form/AlertMessage";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Event } from "types/Event";

type CollaboratorsProps = {
  groupId: number;
};

type RevokeInput = {
  address: string;
  role: string;
};

const Collaborators: FC<CollaboratorsProps> = ({ groupId }) => {
  const { t } = useLocale();
  const { memberRoles, isLoading } = useMemberRoles(groupId);
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

  const admins = useMemo(() => {
    return memberRoles?.filter((memberRole: Event.MemberRole) => {
      return memberRole.admin === true;
    });
  }, [memberRoles]);

  const collaborators = useMemo(() => {
    return memberRoles?.filter((memberRole: Event.MemberRole) => {
      return memberRole.collaborator === true;
    });
  }, [memberRoles]);

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
        {admins?.length === 0 && <Text>{t.RBAC_NO_ADMINS}</Text>}
        {admins?.map((memberRole: Event.MemberRole) => (
          <Tooltip
            label={memberRole.assignee}
            backgroundColor="white"
            color="yellow.900"
            fontSize="xs"
            key={`${memberRole.assignee}`}
          >
            <Box
              as="span"
              px={3}
              py={1}
              fontSize="xs"
              borderRadius="full"
              border="2px solid lightgray"
              backgroundColor={
                isSelectedRevokeInput(memberRole.assignee, "admin")
                  ? "yellow.400"
                  : "white"
              }
              cursor="pointer"
              onClick={() => updateRevokeInput(memberRole.assignee, "admin")}
            >
              <Box as="span" mr={1}>
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  color={
                    isSelectedRevokeInput(memberRole.assignee, "admin")
                      ? "white"
                      : "lightgray"
                  }
                />
              </Box>
              {memberRole.assignee.slice(0, 5)}...
              {memberRole.assignee.slice(-3)}
            </Box>
          </Tooltip>
        ))}
      </Flex>

      <Heading as="h3" size="md" mb={2}>
        {t.RBAC_COLLABORATORS}
      </Heading>
      <Flex flexWrap="wrap" columnGap={1} rowGap={1}>
        {collaborators?.length === 0 && <Text>{t.RBAC_NO_COLLABORATORS}</Text>}
        {collaborators?.map((memberRole: Event.MemberRole) => (
          <Tooltip
            label={memberRole.assignee}
            backgroundColor="white"
            color="yellow.900"
            fontSize="xs"
            key={`${memberRole.assignee}`}
          >
            <Box
              as="span"
              px={3}
              py={1}
              fontSize="xs"
              borderRadius="full"
              border="2px solid lightgray"
              backgroundColor={
                isSelectedRevokeInput(memberRole.assignee, "collaborator")
                  ? "yellow.400"
                  : "white"
              }
              cursor="pointer"
              onClick={() =>
                updateRevokeInput(memberRole.assignee, "collaborator")
              }
            >
              <Box as="span" mr={1}>
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  color={
                    isSelectedRevokeInput(memberRole.assignee, "collaborator")
                      ? "white"
                      : "lightgray"
                  }
                />
              </Box>
              {memberRole.assignee.slice(0, 5)}...
              {memberRole.assignee.slice(-3)}
            </Box>
          </Tooltip>
        ))}
      </Flex>

      <Button
        onClick={handleRevoke}
        isLoading={isRevoking}
        disabled={isRevoking || revokeInput === null}
        w="full"
        mt={5}
        colorScheme="red"
      >
        {t.RBAC_REVOKE_ROLE}
      </Button>
    </>
  );
};

export default Collaborators;
