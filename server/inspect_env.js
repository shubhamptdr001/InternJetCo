import dotenv from 'dotenv';
dotenv.config();

const appId = process.env.ZEGOCLOUD_APP_ID;
const secret = process.env.ZEGOCLOUD_SERVER_SECRET;

console.log('ZEGOCLOUD_APP_ID raw:', JSON.stringify(appId));
console.log('ZEGOCLOUD_APP_ID type:', typeof appId);
console.log('ZEGOCLOUD_APP_ID parsed:', Number(appId));

console.log('ZEGOCLOUD_SERVER_SECRET raw:', JSON.stringify(secret));
console.log('ZEGOCLOUD_SERVER_SECRET length:', secret ? secret.length : 0);
