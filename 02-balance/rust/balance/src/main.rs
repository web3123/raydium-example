use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    commitment_config::CommitmentConfig,
};
use solana_client::rpc_client::RpcClient;
use std::fs;
use std::path::Path;
use serde::{Serialize, Deserialize};
use tokio;

const LAMPORTS_PER_SOL: u64 = 1_000_000_000;

#[derive(Serialize, Deserialize)]
struct WalletData {
    #[serde(rename = "secretKey")]
    secret_key: Vec<u8>,
}

// 连接到 Solana 开发链
fn get_connection() -> RpcClient {
    RpcClient::new("https://api.devnet.solana.com".to_string())
}

// 生成新账户并保存到文件
fn create_and_save_wallet(wallet_path: &str) -> Keypair {
    let new_account = Keypair::new();

    let wallet_data = WalletData {
        secret_key: new_account.to_bytes().to_vec(),
    };

    fs::write(wallet_path, serde_json::to_string(&wallet_data).unwrap()).expect("Unable to write file");

    println!("New wallet created and saved to {}", wallet_path);
    println!("Public Key: {}", new_account.pubkey());

    new_account
}

// 从文件加载钱包
fn load_wallet(wallet_path: &str) -> Keypair {
    let wallet_data: WalletData = serde_json::from_str(&fs::read_to_string(wallet_path).expect("Unable to read file")).unwrap();
    Keypair::from_bytes(&wallet_data.secret_key).unwrap()
}

// 空投 SOL 到新账户的函数
async fn airdrop_sol(connection: &RpcClient, public_key: &Pubkey, amount_in_sol: u64) {
    let lamports = amount_in_sol * LAMPORTS_PER_SOL;

    // 使用 request_airdrop 方法
    let signature = connection.request_airdrop(public_key, lamports).unwrap();
    println!("Airdrop requested with signature: {}", signature);

    // 确认交易
    connection.confirm_transaction(&signature).unwrap();
    println!("Airdrop successful!");
}

// 获取账户余额的函数
async fn get_account_balance(connection: &RpcClient, public_key: &Pubkey) {
    let balance_in_lamports = connection.get_balance(public_key).unwrap();
    let balance_in_sol = balance_in_lamports as f64 / LAMPORTS_PER_SOL as f64;

    println!("Account Balance: {} SOL, {} Lamports", balance_in_sol, balance_in_lamports);
}

#[tokio::main]
async fn main() {
    let wallet_path = "./wallet.json";

    let connection = get_connection();

    let new_account = if !Path::new(wallet_path).exists() {
        println!("Cannot find wallet.json");
        create_and_save_wallet(wallet_path)
    } else {
        println!("Loading wallet from wallet.json");
        load_wallet(wallet_path)
    };

    println!("New Account Public Key: {}", new_account.pubkey());

    // 空投 SOL 到新账户
    // airdrop_sol(&connection, &new_account.pubkey(), 2).await;

    // 查询新账户的余额
    get_account_balance(&connection, &new_account.pubkey()).await;
}