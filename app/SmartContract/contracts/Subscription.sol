// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Subscription {
    address public owner;

    uint public basicPrice = 0.001 ether;
    uint public standardPrice = 0.003 ether;
    uint public premiumPrice = 0.005 ether;

    enum Plan { NONE, BASIC, STANDARD, PREMIUM }

    mapping(address => Plan) public subscriptions;
    mapping(address => uint) public expiration;

    event Subscribed(address indexed user, Plan plan, uint expiresAt);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function subscribeBasic() external payable {
        require(msg.value == basicPrice, "Incorrect amount");
        _subscribe(Plan.BASIC, 30 days);
    }

    function subscribeStandard() external payable {
        require(msg.value == standardPrice, "Incorrect amount");
        _subscribe(Plan.STANDARD, 45 days);
    }

    function subscribePremium() external payable {
        require(msg.value == premiumPrice, "Incorrect amount");
        _subscribe(Plan.PREMIUM, 60 days);
    }

    function _subscribe(Plan plan, uint duration) internal {
        uint newExpiration = block.timestamp + duration;

        if (subscriptions[msg.sender] != Plan.NONE && expiration[msg.sender] > block.timestamp) {
            newExpiration = expiration[msg.sender] + duration;
        }

        subscriptions[msg.sender] = plan;
        expiration[msg.sender] = newExpiration;
        emit Subscribed(msg.sender, plan, newExpiration);
    }

    function checkSubscription(address user) external view returns (Plan, uint) {
        return (subscriptions[user], expiration[user]);
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
