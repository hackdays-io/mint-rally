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

    Group[] private groups;
    EventRecord[] private eventRecords;

    mapping(address => uint256[]) private ownGroupIds;
    mapping(uint256 => address[]) private participantAddresses;
    mapping(address => uint256[]) private eventIdsByParticipant;

    constructor() {
        console.log("init");
    }

    function createGroup(string memory _name) external {
        uint256 _newGroupId = _groupIds.current();
        groups.push(Group({groupId: _newGroupId, name: _name}));
        ownGroupIds[msg.sender].push(_newGroupId);
        _groupIds.increment();
    }

    function getGroups() public view returns (Group[] memory) {
        uint256 _numberOfGroups = groups.length;
        // create array of groups
        Group[] memory _groups = new Group[](_numberOfGroups);
        _groups = groups;
        return _groups;
    }

    function getOwnGroups() public view returns (Group[] memory) {
        uint256 _numberOfGroups = ownGroupIds[msg.sender].length;
        // create array of groups
        Group[] memory _groups = new Group[](_numberOfGroups);
        for (uint256 _i = 0; _i < _numberOfGroups; _i++) {
            _groups[_i] = groups[ownGroupIds[msg.sender][_i]];
        }
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
        bool _isGroupOwner = false;
        for (uint256 _i = 0; _i < ownGroupIds[msg.sender].length; _i++) {
            if (ownGroupIds[msg.sender][_i] == _groupId) {
                _isGroupOwner = true;
            }
        }
        require(_isGroupOwner, "Only group owners can create event records");

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

    function applyForParticipation(uint256 _eventRecordId) external {
        participantAddresses[_eventRecordId].push(msg.sender);
        eventIdsByParticipant[msg.sender].push(_eventRecordId);
    }

    function getParticipationEvents()
        external
        view
        returns (EventRecord[] memory)
    {
        uint256 _numberOfEventRecords = eventRecords.length;
        // create array of events
        EventRecord[] memory _eventRecords = new EventRecord[](
            _numberOfEventRecords
        );
        for (uint256 _i = 0; _i < _numberOfEventRecords; _i++) {
            if (participantAddresses[_i].length > 0) {
                _eventRecords[_i] = eventRecords[_i];
            }
        }
        return _eventRecords;
    }

    function countParticipationByGroup(
        address _participantAddress,
        uint256 _groupId
    ) public view returns (uint256) {
        uint256[] memory _eventIds = eventIdsByParticipant[_participantAddress];
        uint256 _numberOfEvents = _eventIds.length;
        uint256 _numberOfParticipants = 0;
        for (uint256 _i = 0; _i < _numberOfEvents; _i++) {
            if (eventRecords[_eventIds[_i]].groupId == _groupId) {
                _numberOfParticipants++;
            }
        }
        return _numberOfParticipants;
    }
}
