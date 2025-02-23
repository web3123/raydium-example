import { Keypair } from "@solana/web3.js";
import * as fs from "fs";
import { Buffer } from 'buffer';

function createAndSaveWallet(walletPath: string) {
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

async function main() {
    console.log("main");
    const walletPath = "./wallet2.json";
    if (!fs.existsSync(walletPath)) {
        console.log("Can not find wallet.json");
        createAndSaveWallet(walletPath);
    } else {
        console.log("Loading wallet from wallet.json");
    }   
}

main()

// 创建钱包
// const wallet = Keypair.generate();

// 获取公钥和私钥
// const publicKey = wallet.publicKey.toBase58();
// const secretKey = wallet.secretKey; // 一个 Uint8Array

// 打印
// console.log("钱包公钥:", publicKey);
// console.log("钱包私钥:", secretKey);
// console.log("钱包私钥(base64):", Buffer.from(secretKey).toString("base64"));

// 保存Uint8Array私钥
// fs.writeFileSync("wallet.json", JSON.stringify(Array.from(secretKey)));

// 导入钱包
// const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync("wallet.json")));
// const wallet = Keypair.fromSecretKey(secretKey);

// console.log("钱包公钥:", wallet.publicKey.toString());
// console.log("钱包私钥:", wallet.secretKey);
// console.log("钱包私钥(base64):", Buffer.from(secretKey).toString("base64"));