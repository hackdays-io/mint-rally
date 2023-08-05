// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

interface ISecretPhraseVerifier {
    function submitProof(
        uint256[24] calldata _proof,
        uint256 _eventId
    ) external;

    function verifyProof(
        uint256[24] calldata _proof,
        uint256[1] calldata _pubSignals,
        uint256 _eventId
    ) external view returns (bool);
}
