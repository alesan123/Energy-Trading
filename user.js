const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const {Transaction, Blockchain} = require('./blockchain.js');

class User {
  constructor(username, password) {
    this.username = username
    this.password = password
    this.key = ec.genKeyPair()
    this.privateKey = this.key.getPrivate('hex')
    this.publicKey = this.key.getPublic('hex')
    this.walletAddress = this.publicKey
    this.energyAmount = 1000;
    this.transferStatus = ((this.energyAmount > 0) ? true : false);
  }

  transferToken(blockchain, amount, walletAddress) {
    const tx1 = new Transaction(this.walletAddress, walletAddress, amount);
    tx1.signTransaction(this.key);
    blockchain.addTransaction(tx1);
  }

  updateEnergyAmount() {
    if (this.energyAmount > 0) {
      this.energyAmount--;
      this.transferStatus = true;
    } else {
      this.transferStatus = false;
    }
  }
}

module.exports = User;