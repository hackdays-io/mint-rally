// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/metatx/MinimalForwarderUpgradeable.sol";
import "./IMintNFT.sol";
import "./IOperationController.sol";
import "./ERC2771ContextUpgradeable.sol";
import "hardhat/console.sol";

contract EventManager is 
    OwnableUpgradeable,
    ERC2771ContextUpgradeable
{
    struct Group {
        uint256 groupId;
        address ownerAddress;
        string name;
    }

    struct EventRecord {
        uint256 eventRecordId;
        uint256 groupId;
        string name;
        string description;
        string date;
        bool useMtx;
    }

    struct MemberRole {
        address assignee;
        bool admin;
        bool collaborator;
    }

    using Counters for Counters.Counter;

    Counters.Counter private _eventRecordIds;
    Counters.Counter private _groupIds;

    Group[] private groups;
    EventRecord[] private eventRecords;

    mapping(address => uint256[]) private ownGroupIds;
    mapping(uint256 => uint256[]) private eventIdsByGroupId;
    mapping(uint256 => uint256) private groupIdByEventId;

    // Mint nft contract address
    address private mintNFTAddr;
    // Relayer address for meta transaction
    address private relayerAddr;
    // price for mtx per mint. required gas * margin * gas limit multipler
    uint256 private mtxPrice;
    // max mint limit
    uint256 private maxMintLimit;
    // OperationController contract address
    address private operationControllerAddr;

    // Roles
    bytes32 private constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 private constant COLLABORATOR_ROLE = keccak256("COLLABORATOR");
    // groupId => address => Role => bool
    mapping(uint256 => mapping(address => mapping(bytes32 => bool)))
        private memberRolesByGroupId;
    mapping(uint256 => address[]) private memberAddressesByGroupId;

    modifier onlyGroupOwner(uint256 _groupId) {
        require(_isGroupOwner(_groupId, msg.sender), "You have no permission");
        _;
    }

    modifier onlyAdminAccess(uint256 _groupId) {
        require(
            _hasAdminAccess(_groupId, msg.sender),
            "You have no permission"
        );
        _;
    }

    modifier onlyCollaboratorAccess(uint256 _groupId) {
        require(
            _hasCollaboratorAccess(_groupId, msg.sender),
            "You have no permission"
        );
        _;
    }

    modifier whenNotPaused() {
        IOperationController operationController = IOperationController(
            operationControllerAddr
        );
        require(!operationController.paused(), "Paused");
        _;
    }

    function setMintNFTAddr(address _mintNftAddr) public onlyOwner {
        require(_mintNftAddr != address(0), "mint nft address is blank");
        mintNFTAddr = _mintNftAddr;
    }

    function setRelayerAddr(address _relayerAddr) public onlyOwner {
        require(_relayerAddr != address(0), "relayer address is blank");
        relayerAddr = _relayerAddr;
    }

    function setMtxPrice(uint256 _price) public onlyOwner {
        mtxPrice = _price;
    }

    function setMaxMintLimit(uint256 _mintLimit) public onlyOwner {
        require(_mintLimit != 0, "mint limit is 0");
        maxMintLimit = _mintLimit;
    }

    function setOperationControllerAddr(
        address _operationControllerAddr
    ) public onlyOwner {
        require(
            _operationControllerAddr != address(0),
            "operation controller address is blank"
        );
        operationControllerAddr = _operationControllerAddr;
    }

    event CreateGroup(address indexed owner, uint256 groupId);
    event CreateEvent(address indexed owner, uint256 eventId);
    event TransferGroupOwner(
        address indexed prevOwner,
        address indexed newOwner,
        uint256 groupId
    );

    // Currently, reinitializer(3) was executed as constructor.
    function initialize(
        MinimalForwarderUpgradeable _trustedForwarder,
        address _owner,
        address _relayerAddr,
        uint256 _mtxPrice,
        uint256 _maxMintLimit,
        address _operationControllerAddr
    ) public reinitializer(4) {
        __Ownable_init();
        _transferOwnership(_owner);
        if (_groupIds.current() == 0 && _eventRecordIds.current() == 0) {
            _groupIds.increment();
            _eventRecordIds.increment();
        }
        __ERC2771Context_init(address(_trustedForwarder));
        relayerAddr = _relayerAddr;
        mtxPrice = _mtxPrice;
        maxMintLimit = _maxMintLimit;
        operationControllerAddr = _operationControllerAddr;
    }

    function _msgSender()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address sender)
    {
        if (isTrustedForwarder(msg.sender)) {
            // The assembly code is more direct than the Solidity version using `abi.decode`.
            /// @solidity memory-safe-assembly
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return super._msgSender();
        }
    }

    function _msgData()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 20];
        } else {
            return super._msgData();
        }
    }


    function createGroup(string memory _name) external whenNotPaused {
        uint256 _newGroupId = _groupIds.current();
        _groupIds.increment();

        groups.push(
            Group({groupId: _newGroupId, ownerAddress: msg.sender, name: _name})
        );
        ownGroupIds[msg.sender].push(_newGroupId);

        emit CreateGroup(msg.sender, _newGroupId);
    }

    function getGroups() public view returns (Group[] memory) {
        uint256 _numberOfGroups = groups.length;
        Group[] memory _groups = new Group[](_numberOfGroups);
        _groups = groups;
        return _groups;
    }

    function getOwnGroups(
        address _address
    ) public view returns (Group[] memory) {
        uint256 _numberOfOwnGroups = ownGroupIds[_address].length;
        uint256 _numberOfAllGroups = groups.length;

        Group[] memory _groups = new Group[](_numberOfOwnGroups);
        uint256 _count = 0;
        for (uint256 _i = 0; _i < _numberOfAllGroups; _i++) {
            if (groups[_i].ownerAddress == _address) {
                _groups[_count] = groups[_i];
                _count++;
            }
        }
        return _groups;
    }

    function getCollaboratorAccessGroups(
        address _address
    ) external view returns (Group[] memory) {
        uint256[] memory _targetGroupIds = new uint256[](groups.length);
        uint256 _count = 0;
        for (uint256 _groupId = 1; _groupId <= groups.length; _groupId++) {
            if (_hasCollaboratorAccess(_groupId, _address)) {
                _targetGroupIds[_count] = _groupId;
                _count++;
            }
        }

        Group[] memory _groups = new Group[](_count);
        for (uint256 _i = 0; _i < _count; _i++) {
            uint256 _groupsIndex = _targetGroupIds[_i] - 1;
            _groups[_i] = groups[_groupsIndex];
        }

        return _groups;
    }

    function transferGroupOwner(
        uint256 _groupId,
        address _newOwnerAddress
    ) external whenNotPaused onlyGroupOwner(_groupId) {
        require(_newOwnerAddress != address(0), "New owner address is blank");

        for (uint256 i = 0; i < groups.length; i++) {
            if (groups[i].groupId == _groupId) {
                groups[i].ownerAddress = _newOwnerAddress;
                break;
            }
        }

        ownGroupIds[_newOwnerAddress].push(_groupId);

        for (uint256 i = 0; i < ownGroupIds[msg.sender].length; i++) {
            if (ownGroupIds[msg.sender][i] == _groupId) {
                ownGroupIds[msg.sender][i] = ownGroupIds[msg.sender][
                    ownGroupIds[msg.sender].length - 1
                ];
                ownGroupIds[msg.sender].pop();
                break;
            }
        }

        emit TransferGroupOwner(msg.sender, _newOwnerAddress, _groupId);
    }

    function _isGroupOwner(
        uint256 _groupId,
        address _address
    ) private view returns (bool) {
        return groups[_groupId - 1].ownerAddress == _address;
    }

    function createEventRecord(
        uint256 _groupId,
        string memory _name,
        string memory _description,
        string memory _date,
        uint256 _mintLimit,
        bool _useMtx,
        bool _nonTransferable,
        bytes32 _secretPhrase,
        IMintNFT.NFTAttribute[] memory _eventNFTAttributes
    ) external payable onlyCollaboratorAccess(_groupId) whenNotPaused {
        require(
            _mintLimit > 0 && _mintLimit <= maxMintLimit,
            "mint limit is invalid"
        );

        if (_useMtx) {
            uint256 depositPrice = (_mintLimit * tx.gasprice * mtxPrice);
            require(msg.value >= depositPrice, "Not enough value");
            (bool success, ) = (relayerAddr).call{value: msg.value}("");
            require(success, "transfer failed");
        }

        uint256 _newEventId = _eventRecordIds.current();
        _eventRecordIds.increment();

        eventRecords.push(
            EventRecord({
                eventRecordId: _newEventId,
                groupId: _groupId,
                name: _name,
                description: _description,
                date: _date,
                useMtx: _useMtx
            })
        );

        IMintNFT _mintNFT = IMintNFT(mintNFTAddr);
        _mintNFT.setEventInfo(
            _newEventId,
            _mintLimit,
            _secretPhrase,
            _eventNFTAttributes
        );

        if (_nonTransferable) {
            _mintNFT.changeNonTransferable(_newEventId, true);
        }

        eventIdsByGroupId[_groupId].push(_newEventId);
        groupIdByEventId[_newEventId] = _groupId;

        emit CreateEvent(msg.sender, _newEventId);
    }

    function getEventRecordCount() public view returns (uint256) {
        return eventRecords.length;
    }

    function getEventRecords(
        uint256 _limit,
        uint256 _offset
    ) public view returns (EventRecord[] memory) {
        uint256 _numberOfEventRecords = eventRecords.length;
        if (_limit == 0) {
            _limit = 100; // default limit
        }
        require(_limit <= 100, "limit is too large");
        require(_offset <= _numberOfEventRecords, "offset is too large");
        // if limit is over the number of events, set limit to the number of events
        if (_limit + _offset > _numberOfEventRecords) {
            _limit = _numberOfEventRecords - _offset;
        }
        // create array of events
        EventRecord[] memory _eventRecords = new EventRecord[](_limit);

        // slice array of events by offset and limit
        for (uint256 i = 0; i < _limit; i++) {
            if (_numberOfEventRecords - (_offset + i + 1) >= 0) {
                _eventRecords[i] = eventRecords[
                    _numberOfEventRecords - (_offset + i + 1)
                ];
            }
        }
        return _eventRecords;
    }

    function getEventRecordsByGroupId(
        uint256 _groupId
    ) public view returns (EventRecord[] memory) {
        eventIdsByGroupId[_groupId];
        uint256 _numberOfEventRecords = eventIdsByGroupId[_groupId].length;
        EventRecord[] memory _eventRecords = new EventRecord[](
            _numberOfEventRecords
        );
        for (uint256 _i = 0; _i < _numberOfEventRecords; _i++) {
            uint256 _eventId = eventIdsByGroupId[_groupId][
                _numberOfEventRecords - _i - 1
            ];
            _eventRecords[_i] = eventRecords[_eventId - 1];
        }
        return _eventRecords;
    }

    function getEventById(
        uint256 _eventId
    ) external view returns (EventRecord memory) {
        uint256 _eventRecordIndex = _eventId - 1;
        EventRecord memory _eventRecord = eventRecords[_eventRecordIndex];
        return _eventRecord;
    }

    function hasAdminAccessByEventId(
        address _address,
        uint256 _eventId
    ) external view returns (bool) {
        uint256 _groupId = groupIdByEventId[_eventId];
        return _hasAdminAccess(_groupId, _address);
    }

    function hasCollaboratorAccessByEventId(
        address _address,
        uint256 _eventId
    ) external view returns (bool) {
        uint256 _groupId = groupIdByEventId[_eventId];
        return _hasCollaboratorAccess(_groupId, _address);
    }

    function grantRole(
        uint256 _groupId,
        address _address,
        bytes32 _role
    ) external whenNotPaused onlyAdminAccess(_groupId) {
        require(_isValidRole(_role), "Invalid role");

        memberRolesByGroupId[_groupId][_address][_role] = true;

        if (!_isRoleAddressAdded(_groupId, _address)) {
            memberAddressesByGroupId[_groupId].push(_address);
        }
    }

    function _isRoleAddressAdded(
        uint256 _groupId,
        address _address
    ) private view returns (bool) {
        address[] memory _roleAddresses = memberAddressesByGroupId[_groupId];
        for (uint256 _i = 0; _i < _roleAddresses.length; _i++) {
            if (_roleAddresses[_i] == _address) {
                return true;
            }
        }
        return false;
    }

    function revokeRole(
        uint256 _groupId,
        address _address,
        bytes32 _role
    ) external whenNotPaused onlyAdminAccess(_groupId) {
        require(_isValidRole(_role), "Invalid role");

        delete memberRolesByGroupId[_groupId][_address][_role];

        uint256 _count = memberAddressesByGroupId[_groupId].length;
        if (_count > 0 && _hasNoAssignedRoles(_groupId, _address)) {
            if (_count > 1) {
                // find and overwrite to remove
                uint256 _index;
                for (uint256 i = 0; i < _count; i++) {
                    if (memberAddressesByGroupId[_groupId][i] == _address) {
                        _index = i;
                        break;
                    }
                }
                memberAddressesByGroupId[_groupId][
                    _index
                ] = memberAddressesByGroupId[_groupId][_count - 1];
            }
            memberAddressesByGroupId[_groupId].pop();
        }
    }

    function _hasNoAssignedRoles(
        uint256 _groupId,
        address _address
    ) private view returns (bool) {
        return
            !_hasRole(_groupId, _address, ADMIN_ROLE) &&
            !_hasRole(_groupId, _address, COLLABORATOR_ROLE);
    }

    function _isValidRole(bytes32 _role) private pure returns (bool) {
        return _role == ADMIN_ROLE || _role == COLLABORATOR_ROLE;
    }

    function _hasAdminAccess(
        uint256 _groupId,
        address _address
    ) private view returns (bool) {
        require(_groupId > 0 && _groupId <= groups.length, "Invalid groupId");

        return
            _isGroupOwner(_groupId, _address) ||
            _hasRole(_groupId, _address, ADMIN_ROLE);
    }

    function _hasCollaboratorAccess(
        uint256 _groupId,
        address _address
    ) private view returns (bool) {
        require(_groupId > 0 && _groupId <= groups.length, "Invalid groupId");

        return
            _hasAdminAccess(_groupId, _address) ||
            _hasRole(_groupId, _address, COLLABORATOR_ROLE);
    }

    function _hasRole(
        uint256 _groupId,
        address _address,
        bytes32 _role
    ) private view returns (bool) {
        return memberRolesByGroupId[_groupId][_address][_role];
    }

    function getMemberRole(
        uint256 _groupId,
        address _address
    ) external view returns (MemberRole memory) {
        return
            MemberRole({
                assignee: _address,
                admin: memberRolesByGroupId[_groupId][_address][ADMIN_ROLE],
                collaborator: memberRolesByGroupId[_groupId][_address][
                    COLLABORATOR_ROLE
                ]
            });
    }

    function getMemberRoles(
        uint256 _groupId
    ) external view returns (MemberRole[] memory) {
        uint256 _count = memberAddressesByGroupId[_groupId].length;
        MemberRole[] memory _roles = new MemberRole[](_count);
        for (uint256 _i = 0; _i < _count; _i++) {
            address _address = memberAddressesByGroupId[_groupId][_i];
            _roles[_i] = MemberRole({
                assignee: _address,
                admin: memberRolesByGroupId[_groupId][_address][ADMIN_ROLE],
                collaborator: memberRolesByGroupId[_groupId][_address][
                    COLLABORATOR_ROLE
                ]
            });
        }
        return _roles;
    }
}
