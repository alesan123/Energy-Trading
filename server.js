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

//Listening for event
io.on('connection' , function(socket){
    console.log('made socket connection', socket.id);

    socket.on('logIn', function(data){
        console.log(data)
        const user1 = new User(data.username, data.password)
        users.push(user1)
        console.log('User is now in array')
    })

    //Will listen for purchase
    socket.on('purchase', function(data){
        var energyCoinJSON = JSON.parse(fs.readFileSync('blockchain.json'))
        var energyCoin = new BlockchainInstance(energyCoinJSON.chain, energyCoinJSON.pendingTransactions)

        users[0].buyEnergy(energyCoin, data.amountEntered)
        console.log(energyCoin.getBalanceOfAddress(users[0].walletAddress))
    })

});