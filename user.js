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
  }

  buyEnergy(amount) {
    const tx1 = new Transaction(this.walletAddress, '', amount);
    tx1.signTransaction(this.privateKey);
    energyCoin.addTransaction(tx1);
  }
}

module.exports = User;