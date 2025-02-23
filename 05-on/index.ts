import {
    Connection,
    PublicKey,
    Keypair,
    Logs,
    Context,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import * as path from 'path';
import * as fs from 'fs';

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
// const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
// const connection = new Connection("https://mainnet-ams.chainbuff.com", "confirmed");

const fromWalletPath = path.join(".", "wallet.json");
const toWalletPath = path.join(".", "wallet2.json");

// 从文件加载钱包
function loadWallet(walletPath: string): Keypair {
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

// 监听账户变化
function listenForAccountChanges(pubKey: PublicKey): number {
    // 监听账户变化
    const id = connection.onAccountChange(pubKey, (accountInfo) => {
        console.log(`账户变化: ${JSON.stringify(accountInfo)}\n`);
    });

    console.log(`账户监听已启动，ID: ${id}`);
    return id;
}

// 监听账户日志
function listenOnLogs(pubKey: PublicKey): number {
    // 监听账户变化
    const id = connection.onLogs(pubKey, (logs: Logs, ctx: Context) => {
        console.log(`${pubKey} 日志: ${JSON.stringify(logs)}\n`);
    }, "confirmed");

    console.log(`日志监听已启动，ID: ${id}`);
    return id;
}

async function transferLamports(from: Keypair, to: PublicKey, amount: number) {
    // 从 from 钱包发送 SOL 到 to 钱包
    const instruction = SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: amount,
    });
    const transaction = new Transaction().add(instruction);

    const simulateResult = await connection.simulateTransaction(transaction, [from]);
    console.log(`模拟交易结果: ${JSON.stringify(simulateResult)}\n`);

    const signature = await sendAndConfirmTransaction(connection, transaction, [from]);
    console.log(`交易签名: ${signature}`);
}

async function getBalance(pubKey: PublicKey) {
    // 获取账户余额
    const balance = await connection.getBalance(pubKey);
    const sol = balance / LAMPORTS_PER_SOL;
    console.log(`账户余额: ${sol} SOL`);
    // return balance
}

async function main() {

    const from = loadWallet("wallet.json");
    const to = loadWallet("wallet2.json");

    // 监听账户变化
    listenForAccountChanges(from.publicKey);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 监听账户日志
    listenOnLogs(from.publicKey);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    transferLamports(from, to.publicKey, 100000);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    getBalance(from.publicKey);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    getBalance(to.publicKey);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 停止监听
    // connection.removeAccountChangeListener(from.publicKey);
    // connection.removeProgramAccountChangeListener(from.publicKey);
    // connection.removeSignaturesForAddress(from.publicKey);
    // connection.removeBlockSubscription();
    // connection.removeBlockHeightSubscription();

    // 5.04 - 0.000001 - 5.039994
}

main();