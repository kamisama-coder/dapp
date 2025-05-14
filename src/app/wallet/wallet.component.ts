import { Component } from '@angular/core';
import { ethers, JsonRpcProvider, Wallet } from 'ethers';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import CryptoJS from 'crypto-js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wallet',
  imports: [FormsModule, CommonModule],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css'
})

export class WalletComponent {
  provider: JsonRpcProvider;
  address: string;
  gasCost: bigint;
  value: string;
  walletavalaible: () => void;
  wallets: ethers.Wallet[] = [];

  constructor(private router: Router){
    this.address = ''; 
    this.gasCost = BigInt(0);
    this.value = '';
    this.provider = new JsonRpcProvider('https://mainnet.infura.io/v3/bfa5a2bc97234897a5f2280e878918e6');
    this.walletavalaible = () => {
      const walletData = localStorage.getItem('wallet');
      if (walletData) {
        this.router.navigate(['/dashboard']);
      } 
    }
    
  }

  async connectwallet() {
    if (this.value === '') {
      alert('Please enter a password');
      return;
    }
    if(localStorage.getItem('wallet')){
      return;
    }
    const wallet = ethers.Wallet.createRandom();
    const prikey = wallet.privateKey;
    this.address = wallet.address;
    const walnut = new ethers.Wallet(prikey, this.provider);
    this.wallets.push(walnut);

    const encryptedKey = CryptoJS.AES.encrypt(prikey, this.value).toString();
    const walletdata = {
      address: this.address,
      prikey: encryptedKey
    }
    localStorage.setItem('wallet', JSON.stringify(walletdata));
    console.log('Wallet Data:', walletdata);
  }

  
  async decryptWallet(): Promise<string | undefined> {
    if (!this.value) {
      console.error('No password provided for decryption');
      return undefined; 
    }
    const walletData = localStorage.getItem('wallet');
    console.log('Wallet Data:', walletData);
    if (walletData) {
      try {
        const parsedData = JSON.parse(walletData);
        const encryptedKey = parsedData.prikey;
        const decrypted = CryptoJS.AES.decrypt(encryptedKey, this.value);
        const decryptedKey = decrypted.toString(CryptoJS.enc.Utf8);
        const walnut = new ethers.Wallet(decryptedKey, this.provider);
        this.address = parsedData.address;
        this.wallets.push(walnut);
        console.log('Decrypted Private Key:', decryptedKey);
        return decryptedKey || undefined; 
      } catch (error) {
        console.error('Failed to decrypt wallet:', error);
        return undefined; 
      }
    }
  
    return undefined; 
  }
   
  sendETH = async () => {
    const tx = await this.wallets[0].sendTransaction({
      to: '0x7F740E3CC591db46f17DC7886014167bbea88022',
      value: ethers.parseEther("0.01"),
      gasLimit: 21000
    });
    console.log('Transaction Hash:', tx.hash);
    await tx.wait();
    console.log('Transaction Confirmed!');
  };

  async getgasPrice() {
    const tx = {
      from: '0xYourWalletAddress',  // optional but helpful
      to: '0x7F740E3CC591db46f17DC7886014167bbea88022',
      value: ethers.parseEther('0.01') 
    };
    const estimatedGas = await this.provider.estimateGas(tx);
    const gasPrice = await this.provider.send("eth_gasPrice", []);
    this.gasCost = estimatedGas*gasPrice;
  
  }

  async getBalance() {
    const balanceBigInt = await this.provider.getBalance(this.address);
    const balance = ethers.formatEther(balanceBigInt);
    console.log('Wallet Balance:', balance, 'ETH');
  }

  async getTransactionHistory() {
    const history = await this.provider.getBlockNumber();
    console.log('Transaction History:', history);
  }


  
  
  
}
