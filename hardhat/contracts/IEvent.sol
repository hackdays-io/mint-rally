//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IEventManager {
    function applyForParticipation(uint256 _eventRecordId) external;

    function verifySecretPhrase(
        string memory _secretPhrase,
        uint256 _eventRecordId
    ) external returns (bool);

    struct EventRecord {
        uint256 eventRecordId;
        uint256 groupId;
        string name;
        string description;
        string date;
        string startTime;
        string endTime;
        bytes32 secretPhrase;
    }

    function getEventById(uint256 _eventId)
        external
        view
        returns (EventRecord memory);
}
