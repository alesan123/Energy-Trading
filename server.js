const EC = require('elliptic').ec;
const express = require('express');
const socket = require('socket.io');
const User = require('./user.js')
const {Blockchain, BlockchainInstance} = require('./blockchain.js')
const fs = require('fs')

//App setup
var app = express();
var server = app.listen(8080, function(){
    console.log(' listening on port 8080');
})

//static files
app.use(express.static('public'));

//Socket set up
var io = socket(server);


//Setup Users
let users = []
let admin = new User('Admin', 'Admin')

//Listening for event
io.on('connection' , function(socket){
    console.log('made socket connection', socket.id);

    //Will listen for login
    socket.on('login', function(data){
        console.log(data)
        const user1 = new User(data.username, data.password)
        users.push(user1)
        console.log('User is now in array')
    })

    //Will listen for purchase call
    socket.on('purchase', function(data){
        //Parse json file
        var energyCoinJSON = JSON.parse(fs.readFileSync('blockchain.json'))
        var energyCoin = new BlockchainInstance(energyCoinJSON.chain, energyCoinJSON.pendingTransactions)
        
        //Will transfer tokens from admin pool to user
        admin.transferToken(energyCoin, data.amountEntered, users[0].walletAddress)
        energyCoin.minePendingTransactions(admin.walletAddress)
        console.log(energyCoin)
        console.log("the balance of user is ", energyCoin.getBalanceOfAddress(users[0].walletAddress))
        //Will save blockchain object to JSON file
        fs.writeFileSync('blockchain.json', JSON.stringify(energyCoin))
    })

    //Will listen for sell
    socket.on('sell', function(data){
        var energyCoinJSON = JSON.parse(fs.readFileSync('blockchain.json'))
        var energyCoin = new BlockchainInstance(energyCoinJSON.chain, energyCoinJSON.pendingTransactions)
        
        //Will trasnfer tokens from admin pool to user
        admin.transferToken(energyCoin, data.amountEntered, users[0].walletAddress)
        energyCoin.minePendingTransactions(admin.walletAddress)
        console.log(energyCoin)
        console.log("The balance of user is ", energyCoin.getBalanceOfAddress(users[0].walletAddress))
        //Will save blockchain object to JSON file
        fs.writeFileSync('blockchain.json', JSON.stringify(energyCoin))

    })

});