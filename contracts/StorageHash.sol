// SPDX-License-Identifier:UNLICENSED
pragma solidity ^0.8.24;

import "./BaseRelayRecipient.sol";

contract StorageHash is BaseRelayRecipient {

    address public owner;
    mapping(bytes32 => bool) public exists;
    mapping(bytes32 => uint256) public storedAt;
    mapping(bytes32 => address) public storedBy;

    event HashStored(address indexed by, bytes32 indexed hashValue, uint256 timestamp);

    constructor() {
        owner = _msgSender();
    }

    /// Guarda un hash bytes32 sólo si no existe (inmutable por hash)
    function storeHash(bytes32 _h) public {
        require(_h != bytes32(0), "Invalid hash");
        require(!exists[_h], "Hash already stored");

        exists[_h] = true;
        storedAt[_h] = block.timestamp;
        storedBy[_h] = _msgSender();

        emit HashStored(_msgSender(), _h, block.timestamp);
    }

    function isStored(bytes32 _h) public view returns (bool) {
        return exists[_h];
    }
}

