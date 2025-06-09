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
  check=false;
  wallets: ethers.Wallet[] = [];

  constructor(private router: Router){
    this.address = ''; 
    this.gasCost = BigInt(1);
    this.value = '';
    this.provider = new JsonRpcProvider('https://sepolia.infura.io/v3/5360a0b0418347f49a6a6f3f1fa51c27');

  }

  async createwallet() {
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
    this.check = true;
    console.log('Wallet Data:', walletdata);
  }

  async changewallet(){
    if (this.value === '') {
      alert('Please enter a password');
      return;
    }
    const wallet = ethers.Wallet.createRandom();
    const prikey = wallet.privateKey;
    this.address = wallet.address;
    const walnut = new ethers.Wallet(prikey, this.provider);
    this.wallets = []; 
    this.wallets.push(walnut);

    const encryptedKey = CryptoJS.AES.encrypt(prikey, this.value).toString();
    const walletdata = {
      address: this.address,
      prikey: encryptedKey
    }
    localStorage.setItem('wallet', JSON.stringify(walletdata));
    this.check = true;
  }


  async connectwallet() {

    if (this.value === '') {
      alert('Please enter a password');
      return;
    }
    const walletData = localStorage.getItem('wallet');

    if (walletData) {
      try {
        const parsedData = JSON.parse(walletData);
        const encryptedKey = parsedData?.prikey;
        this.address = parsedData?.address;

        if (!encryptedKey || !this.address) {
          console.error('Invalid wallet data format.');
          return;
        }

        const decrypted = CryptoJS.AES.decrypt(encryptedKey, this.value);
        const decryptedKey = decrypted.toString(CryptoJS.enc.Utf8);

        if (!decryptedKey) {
          console.error('Decryption failed. Possibly wrong key.');
          return;
        }

        const wallet = new ethers.Wallet(decryptedKey, this.provider);

        if (!this.wallets.some(w => w.address === wallet.address)) {
          this.wallets.push(wallet);
        }

        this.check = true;
      } catch (err) {
        console.error('Error while connecting wallet:', err);
      }
    } else {
      console.warn('No wallet found in localStorage.');
    }
}

   
  sendETH = async () => {
    if (!this.address) {
    console.error('Address is undefined. Cannot fetch balance.');
    return;
    }

    const tx = await this.wallets[0].sendTransaction({
      to: '0x7F740E3CC591db46f17DC7886014167bbea88022',
      value: ethers.parseEther("0.00001"),
      gasLimit: 21000
    });
    console.log('Transaction Hash:', tx.hash);
    await tx.wait();
    console.log('Transaction Confirmed!');
  };

  async getgasPrice() {
  const tx = {
    from:'0xE3844a5B24f942bC38C05F9D2d6FdC1Dce31D7cA', 
    to:'0x7F740E3CC591db46f17DC7886014167bbea88022',
    value: ethers.parseEther('0.001') 
  };

  const estimatedGas: bigint = await this.provider.estimateGas(tx);
  const gasPrice: bigint = BigInt(await this.provider.send("eth_gasPrice", []));
  const estimatedprice: bigint = estimatedGas * gasPrice;

  this.gasCost = estimatedprice;

  console.log('Estimated Gas:', estimatedGas.toString());
  console.log('Gas Price:', ethers.formatUnits(gasPrice, 'gwei'), 'gwei');
  console.log('Estimated Gas Cost:', ethers.formatEther(estimatedprice), 'ETH');
}


 async getBalance() {
  if (!this.address) {
    console.error('Address is undefined. Cannot fetch balance.');
    return;
  }

  try {
    const balanceBigInt = await this.provider.getBalance(this.address);
    const balance = ethers.formatEther(balanceBigInt);
    console.log('Wallet Balance:', balance, 'ETH');
  } catch (err) {
    console.error('Error fetching balance:', err);
  }
}


  async getTransactionHistory() {
    const history = await this.provider.getBlockNumber();
    console.log('Transaction History:', history);
  }


  
  
  
}
