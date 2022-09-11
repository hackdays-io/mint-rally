//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

library Hashing {
    function hashingAddressUint256(address _address, uint256 _id)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_address, _id));
    }

    function hashingDoubleUint256(uint256 _arg1, uint256 _arg2)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_arg1, _arg2));
    }
}
