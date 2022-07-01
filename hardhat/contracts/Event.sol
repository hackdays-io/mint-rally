// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract EventManager {
    struct Group {
        uint256 groupId;
        string name;
    }

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

    using Counters for Counters.Counter;

    Counters.Counter private _eventRecordIds;
    Counters.Counter private _groupIds;

    Group[] public groups;
    EventRecord[] public eventRecords;

    constructor() {
        console.log("init");
    }

    function createGroup(string memory _name) external {
        uint256 _newGroupId = _groupIds.current();
        groups.push(Group({groupId: _newGroupId, name: _name}));
        _groupIds.increment();
    }

    function getGroups() public view returns (Group[] memory) {
        uint256 _numberOfGroups = groups.length;
        // create array of groups
        Group[] memory _groups = new Group[](_numberOfGroups);
        _groups = groups;
        return _groups;
    }

    function createEventRecord(
        uint256 _groupId,
        string memory _name,
        string memory _description,
        string memory _date,
        string memory _startTime,
        string memory _endTime,
        string memory _secretPhrase
    ) external {
        uint256 _newEventId = _eventRecordIds.current();
        bytes memory hexSecretPhrase = bytes(_secretPhrase);
        bytes32 encryptedSecretPhrase = keccak256(hexSecretPhrase);
        eventRecords.push(
            EventRecord({
                eventRecordId: _newEventId,
                groupId: _groupId,
                name: _name,
                description: _description,
                date: _date,
                startTime: _startTime,
                endTime: _endTime,
                secretPhrase: encryptedSecretPhrase
            })
        );
        _eventRecordIds.increment();
    }

    function getEventRecords() public view returns (EventRecord[] memory) {
        uint256 _numberOfEventRecords = eventRecords.length;
        // create array of events
        EventRecord[] memory _eventRecords = new EventRecord[](
            _numberOfEventRecords
        );
        _eventRecords = eventRecords;
        return _eventRecords;
    }
}
