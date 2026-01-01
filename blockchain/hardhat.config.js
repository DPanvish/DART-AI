require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.24", // Matches the version in Auction.sol
    networks: {
        // This tells Hardhat to use your local Ganache
        ganache: {
            url: "http://127.0.0.1:7545",
            chainId: 1337 // Common ID for Ganache
        }
    }
};