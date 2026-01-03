import { ethers } from "ethers";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTRACT_ADDRESS = "0xdd5e0fa3b23de7f4Cb639ac3a4e8Dd05c261dbF4";

const RPC_URL = "http://127.0.0.1:7545";

const contractJson = JSON.parse(fs.readFileSync("./Auction.json"));
const ABI = contractJson.abi;

async function main() {
    // CONNECT TO BLOCKCHAIN
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // DEBUG: Check if we can see the block number
    const blockNumber = await provider.getBlockNumber();
    console.log(`Current Block Number on Ganache: ${blockNumber}`);

    // We need a signer (wallet) to send transactions (like flagging fraud)
    // In Ganache, we can just use the first account's private key (or any account)
    // NOTE: In a real app, use a private key from .env. Here we use a hardcoded Ganache key for demo.
    // Go to Ganache -> Accounts -> Click 'key' icon on correct account -> Copy Private Key
    const signer = await provider.getSigner();

    const auctionContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    console.log(`DART Listener is running...`);
    console.log(`Watching contract at: ${CONTRACT_ADDRESS}`);

    // LISTEN FOR EVENTS
    // event LogBid(address indexed bidder, uint amount, uint timestamp);
    auctionContract.on("LogBid", (bidder, amount, timestamp) => {
        try {
        console.log(`\n[NEW BID DETECTED]`);
        console.log(`Bidder: ${bidder}`);
        console.log(`Amount: ${ethers.formatEther(amount)} ETH`);

        // PREPARE DATA FOR AI
        // Since the Blockchain only gives us raw data, we must calculate the 9 features.
        // For this Prototype, we will generate SIMULATED features to test the pipeline.
        // In Phase 5, we can make this smarter.

        // Simulating a "Legit" user stats (mostly low numbers)
        // We can tweak these manually to test "Fraud" detection
        const features = [
            0.1,  // Bidder_Tendency
            0.1,  // Bidding_Ratio
            0.0,  // Successive_Outbidding
            0.1,  // Last_Bidding
            0.1,  // Auction_Bids
            0.5,  // Starting_Price_Average
            0.0,  // Early_Bidding
            0.5,  // Winning_Ratio
            5.0   // Auction_Duration
        ];

        // Convert array to string arguments for Python
        const args = features.map(f => f.toString());

        // CALL PYTHON SCRIPT
        // Adjust path to where your predict.py actually is
        const pythonExecutable = path.resolve(__dirname, "../ai_engine/venv/Scripts/python.exe");
        const scriptPath = path.resolve(__dirname, "../ai_engine/predict.py");

        console.log(`DEBUG: Trying to spawn Python at: ${pythonExecutable}`);
        console.log(`DEBUG: Script path: ${scriptPath}`);

        const pythonProcess = spawn(pythonExecutable, [scriptPath, ...args]);

        // LISTEN FOR DATA (Success)
        pythonProcess.stdout.on('data', (data) => {
            console.log(`AI Verdict: ${data.toString().trim()}`);
        });

        // LISTEN FOR PYTHON ERRORS (Script Crashes)
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });

        // LISTEN FOR SPAWN ERRORS (Node fails to find Python) <--- NEW & CRITICAL
        pythonProcess.on('error', (err) => {
            console.error("❌ FAILED TO START PYTHON PROCESS.");
            console.error(`Error Details: ${err.message}`);
            console.error("Suggestion: Check if the path to 'python.exe' is correct.");
        });

        // LISTEN FOR EXIT
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.log(`Python process exited with code ${code}`);
            }
        });
        } catch (error) {
            console.error("❌ Error inside event listener:", error);
        }
    });
}

main();