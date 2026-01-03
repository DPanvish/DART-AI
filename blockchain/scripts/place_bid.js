const hre = require("hardhat");

async function main() {
    const CONTRACT_ADDRESS = "0xdd5e0fa3b23de7f4Cb639ac3a4e8Dd05c261dbF4";

    const Auction = await hre.ethers.getContractFactory("Auction");
    const auction = Auction.attach(CONTRACT_ADDRESS);

    // Get a random bidder (Account #1 in Hardhat/Ganache)
    const [admin, bidder1, bidder2] = await hre.ethers.getSigners();

    const activeBidder = Math.random() > 0.5 ? bidder1 : bidder2;
    const currentHighest = await auction.highestBid();
    console.log(`Current Highest Bid: ${hre.ethers.formatEther(currentHighest)} ETH`);

    const increment = hre.ethers.parseEther("0.5");
    const newBidAmount = currentHighest + increment;

    console.log(`Placing new bid of: ${hre.ethers.formatEther(newBidAmount)} ETH from ${activeBidder.address}...`);

    // Place Bid
    const tx = await auction.connect(activeBidder).placeBid({ value: newBidAmount });
    await tx.wait();

    console.log("Bid placed successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});