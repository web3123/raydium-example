import {
    Connection,
    PublicKey,
    Keypair,
    TransactionMessage,
    VersionedTransaction,
    SystemProgram,
} from '@solana/web3.js';
import * as fs from "fs";

// 从文件加载钱包
export function loadWallet(walletPath: string): Keypair {
    if (!fs.existsSync(walletPath)) {
        throw new Error("Wallet file not found. Please create a wallet first.");
    }
    const walletData = JSON.parse(fs.readFileSync(walletPath, "utf-8"));

    // 将数组转换回 Uint8Array
    const secretKey = Uint8Array.from(walletData.secretKey);
    // 生成 Keypair
    return Keypair.fromSecretKey(secretKey);
}

// 创建RPC连接
// const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
// const connection = new Connection("https://mainnet-ams.chainbuff.com", "confirmed");
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// 本地导入钱包
const fromWallet = loadWallet("wallet.json");
const fromSecretKey = fromWallet.secretKey;
async function main() {

    // 目标地址
    const toAddress = new PublicKey('buffaAJKmNLao65TDTUGq8oB9HgxkfPLGqPMFQapotJ');

    // 转账指令
    const instruction = SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: toAddress,
        lamports: 1000, // 1000 lamports
    });

    // 创建v0 message
    const { blockhash } = await connection.getLatestBlockhash();
    const messageV0 = new TransactionMessage({
        payerKey: fromWallet.publicKey,
        recentBlockhash: blockhash, // 最近的区块hash
        instructions: [instruction], // 指令数组
    }).compileToV0Message();

    // 创建v0交易并签名
    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([fromWallet]);

    // 模拟交易
    const simulateResult = await connection.simulateTransaction(transaction);
    console.log("模拟交易结果: ", simulateResult);

    // 发送交易
    const signature = await connection.sendTransaction(transaction);
    console.log(`交易已发送: https://solscan.io/tx/${signature}`);
}

main();