import { useContract, useContractRead } from "@thirdweb-dev/react";
import operationControllerABI from "../contracts/OperationController.json";

export const useOperationControllerContract = () => {
  const {
    contract: operationControllerContract,
    isLoading,
    error,
  } = useContract(
    process.env.NEXT_PUBLIC_CONTRACT_OPERATION_CONTROLLER!,
    operationControllerABI.abi
  );

  return { operationControllerContract, isLoading, error };
};

export const useIsPaused = () => {
  const { operationControllerContract } = useOperationControllerContract();
  const {
    isLoading,
    data: isPaused,
    error,
  } = useContractRead(operationControllerContract, "paused");

  return { isLoading, isPaused, error };
};
