import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

// 连接到 Solana 开发链
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// const walletPath = path.join(__dirname, "wallet.json");
const walletPath = path.join(".", "wallet.json");
// 生成新账户并保存到文件
function createAndSaveWallet() {
    // 生成一个新的 Solana 账户
    const newAccount = Keypair.generate();

    // 将私钥保存到文件
    const walletData = {
        secretKey: Array.from(newAccount.secretKey), // 将 Uint8Array 转换为数组
    };
    fs.writeFileSync(walletPath, JSON.stringify(walletData));

    console.log("New wallet created and saved to wallet.json");
    console.log("Public Key:", newAccount.publicKey.toString());
}

// 从文件加载钱包
function loadWallet(): Keypair {
    if (!fs.existsSync(walletPath)) {
        throw new Error("Wallet file not found. Please create a wallet first.");
    }

    // 读取钱包文件
    const walletData = JSON.parse(fs.readFileSync(walletPath, "utf-8"));

    // 将数组转换回 Uint8Array
    const secretKey = Uint8Array.from(walletData.secretKey);

    // 生成 Keypair
    return Keypair.fromSecretKey(secretKey);
}

// 空投 SOL 到新账户的函数
async function airdropSol(publicKey: PublicKey, amountInSol: number) {
    try {
        // 将 SOL 转换为 Lamports
        const lamports = amountInSol * LAMPORTS_PER_SOL;
        let size = new Uint32Array([lamports]).byteLength;
        console.log("Memo size:", size, "bytes");
        // 请求空投
        const signature = await connection.requestAirdrop(publicKey, lamports);
        console.log(`Airdrop requested with signature: ${signature}`);

        // 确认交易
        const result = await connection.confirmTransaction(signature);
        console.log("Airdrop successful!", result);
    } catch (error) {
        console.error("Error during airdrop:", error);
    }
}

// 获取账户余额的函数
async function getAccountBalance(publicKey: PublicKey) {
    try {
        // 查询账户余额
        const balanceInLamports = await connection.getBalance(publicKey);
        // 将余额从 Lamports 转换为 SOL
        const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

        console.log(`Account Balance: ${balanceInSOL} SOL, ${balanceInLamports} Lamports`);
    } catch (error) {
        console.error("Error fetching account balance:", error);
    }
}

// 主函数
async function main() {
    //判断如果 wallet.json 不存在，就创建一个新的钱包，否则从 wallet.json 加载钱包
    if (!fs.existsSync(walletPath)) {
        console.log("Can not find wallet.json");
        createAndSaveWallet();
    } else {
        console.log("Loading wallet from wallet.json");
    }   
    const newAccount = loadWallet();
    // 打印新账户的公钥和私钥
    console.log("New Account Public Key:", newAccount.publicKey.toString());
    // console.log("New Account Private Key:", newAccount.secretKey);

    // 空投 SOL 到新账户
    // await airdropSol(newAccount.publicKey, 2);

    // 查询新账户的余额
    await getAccountBalance(newAccount.publicKey);
}

// 运行主函数
main();