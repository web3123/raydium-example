import { Connection, PublicKey, LAMPORTS_PER_SOL, } from "@solana/web3.js";
import { mainModule } from "process";

const WSS_ENDPOINT = 'wss://shy-methodical-butterfly.solana-devnet.quiknode.pro/xxx'; // replace with your URL
const HTTP_ENDPOINT = 'https://shy-methodical-butterfly.solana-devnet.quiknode.pro/xxxx'; // replace with your URL
const solanaConnection = new Connection(HTTP_ENDPOINT, { wsEndpoint: WSS_ENDPOINT });
const sleep = (ms:number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const ACCOUNT_TO_WATCH = new PublicKey('vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg');
    const subscriptionId = await solanaConnection.onAccountChange(
        ACCOUNT_TO_WATCH,
        (updatedAccountInfo) =>
            console.log(`---Event Notification for ${ACCOUNT_TO_WATCH.toString()}--- \nNew Account Balance:`, updatedAccountInfo.lamports / LAMPORTS_PER_SOL, ' SOL'),
        "confirmed"
    );
    console.log('Starting web socket, subscription ID: ', subscriptionId);
    await sleep(10000); //Wait 10 seconds for Socket Testing
    await solanaConnection.requestAirdrop(ACCOUNT_TO_WATCH, LAMPORTS_PER_SOL);
    await sleep(10000); //Wait 10 for Socket Testing
    await solanaConnection.removeAccountChangeListener(subscriptionId);
    console.log(`Websocket ID: ${subscriptionId} closed.`);
 }

main();