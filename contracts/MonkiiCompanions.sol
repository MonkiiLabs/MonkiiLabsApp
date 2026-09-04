// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MonkiiCompanions (ERC-721)
 * @notice Official Companion Collectibles on Robinhood Chain (Arbitrum Orbit L2)
 * @dev Gas-only free mint: users pay zero mint price, only native network gas.
 */
contract MonkiiCompanions {
    string public name = "Monkii Companions";
    string public symbol = "MCOMP";

    address public owner;
    uint256 public nextTokenId = 1;
    string public baseURI = "https://api.monkiilabs.app/api/companions/metadata/";

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => uint256) public companionTypeOf;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event CompanionMinted(address indexed minter, uint256 indexed tokenId, uint256 indexed companionTypeId);

    modifier onlyOwner() {
        require(msg.sender == owner, "not_owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Free mint function: user pays zero ETH mint fee, only standard network gas.
     * @param companionTypeId The archetype ID (1: Cyber-Chimp, 2: Nano-Baboon, 3: Plasma-Lemur, 4: Mecha-Mandrill, 5: Quantum-Ape, 6: Celestial-King)
     */
    function mint(uint256 companionTypeId) external returns (uint256) {
        require(companionTypeId >= 1 && companionTypeId <= 6, "invalid_companion_type");

        uint256 tokenId = nextTokenId++;
        _owners[tokenId] = msg.sender;
        _balances[msg.sender] += 1;
        companionTypeOf[tokenId] = companionTypeId;

        emit Transfer(address(0), msg.sender, tokenId);
        emit CompanionMinted(msg.sender, tokenId, companionTypeId);

        return tokenId;
    }

    function totalSupply() external view returns (uint256) {
        return nextTokenId - 1;
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "token_does_not_exist");
        return tokenOwner;
    }

    function balanceOf(address account) external view returns (uint256) {
        require(account != address(0), "zero_address");
        return _balances[account];
    }

    function approve(address to, uint256 tokenId) external {
        address tokenOwner = ownerOf(tokenId);
        require(msg.sender == tokenOwner || isApprovedForAll(tokenOwner, msg.sender), "not_authorized");
        _tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        require(_owners[tokenId] != address(0), "token_does_not_exist");
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) external {
        require(operator != msg.sender, "approve_to_caller");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address tokenOwner, address operator) public view returns (bool) {
        return _operatorApprovals[tokenOwner][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "not_authorized");
        require(ownerOf(tokenId) == from, "incorrect_owner");
        require(to != address(0), "transfer_to_zero_address");

        _tokenApprovals[tokenId] = address(0);
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address tokenOwner = ownerOf(tokenId);
        return (spender == tokenOwner || isApprovedForAll(tokenOwner, spender) || getApproved(tokenId) == spender);
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_owners[tokenId] != address(0), "token_does_not_exist");
        return string(abi.encodePacked(baseURI, _toString(tokenId)));
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
