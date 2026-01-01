// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Auction {
    address public admin;
    bool public auctionEnded;
    address public highestBidder;
    uint public highestBid;

    // These are the "signals" your Node.js backend will listen for
    event LogBid(address indexed bidder, uint amount, uint timestamp);
    event FraudDetected(address indexed fraudster, string reason);

    constructor() {
        admin = msg.sender;
    }

    // Place a Bid
    function placeBid() public payable {
        require(!auctionEnded, "Auction ended");
        require(msg.value > highestBid, "Bid too low");

        // Refund the previous bidder automatically
        if (highestBidder != address(0)) {
            payable(highestBidder).transfer(highestBid);
        }

        highestBidder = msg.sender;
        highestBid = msg.value;

        // Emit event so Python/Node.js can see this bid
        emit LogBid(msg.sender, msg.value, block.timestamp);
    }

    // Admin (AI) calls this if fraud is confirmed
    function flagFraud(address _fraudster) public {
        require(msg.sender == admin, "Only AI Admin can flag fraud");

        emit FraudDetected(_fraudster, "Shill Bidding Detected by DART AI");

        // If the current winner is the fraudster, cancel their win
        if (highestBidder == _fraudster) {
            highestBidder = address(0);
            highestBid = 0;
        }
    }

    // End the auction
    function endAuction() public {
        require(msg.sender == admin, "Only Admin can end");
        require(!auctionEnded, "Already ended");
        auctionEnded = true;
    }
}