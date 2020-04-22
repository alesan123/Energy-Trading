const EC = require('elliptic').ec;
const express = require('express');
const socket = require('socket.io');
const User = require('./user.js')
const {Blockchain, BlockchainInstance} = require('./blockchain.js')
const fs = require('fs')
const Client = require('azure-iothub').Client;
const Message = require('azure-iot-common').Message

// IoT Hub setup
var connectionString = 'HostName=speakeasy-iot-hub.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=Sc/aHK6H1LTtn/zRcfkEIm0NzQtURh3GnCfrvPowPfA='
var targetDevice = 'raspberrypi'

var serviceClient = Client.fromConnectionString(connectionString)

//App setup
var app = express();
var server = app.listen(8080, function() {
    console.log(' listening on port 8080');
})

//static files
app.use(express.static('public'));

//Socket set up
var io = socket(server);

//Setup Users
let users = []
let admin = new User('Admin', 'Admin')

// functions for communicating with the device
function transferEnergy() {
    serviceClient.open(function (err) {
        if (err) {
          console.error('Could not connect: ' + err.message);
        } else {
          console.log('Service client connected');
          var message = new Message("1");
          message.ack = 'full';
          console.log('Sending message: ' + message.getData());
          serviceClient.send(targetDevice, message);
        }
    });
}

function stopTransferEnergy() {
    serviceClient.open(function (err) {
        if (err) {
          console.error('Could not connect: ' + err.message);
        } else {
          console.log('Service client connected');
          var message = new Message("-1")
          message.ack = 'full';
          console.log('Sending message: ' + message.getData());
          serviceClient.send(targetDevice, message);
        }
    });
}

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

    //Will listen for purchase
    socket.on('purchase', function(data){
        //Convert energy entered to tokens
        users[0].energyAmount += parseFloat(data.amountEntered)
        tokens = parseFloat(data.amountEntered / 100)

        //Will read blockchain from JSON file
        var energyCoinJSON = JSON.parse(fs.readFileSync('blockchain.json'))
        var energyCoin = new BlockchainInstance(energyCoinJSON.chain, energyCoinJSON.pendingTransactions)
        
        //Will transfer tokens from user to admin pool
        //admin.transferToken(energyCoin, tokens, users[0].walletAddress)
        users[0].transferToken(energyCoin, tokens, admin.walletAddress)
        energyCoin.minePendingTransactions(admin.walletAddress)
        console.log(energyCoin)
        console.log("the balance of user is ", energyCoin.getBalanceOfAddress(users[0].walletAddress))
        //Will save blockchain object to JSON file
        fs.writeFileSync('blockchain.json', JSON.stringify(energyCoin))
    })

    //Will listen for sell
    socket.on('sell', function(data){
        users[0].energyAmount -= parseFloat(data.amountEntered)
        tokens = parseFloat(data.amountEntered / 100)

        //Will read blockchain from JSON file
        var energyCoinJSON = JSON.parse(fs.readFileSync('blockchain.json'))
        var energyCoin = new BlockchainInstance(energyCoinJSON.chain, energyCoinJSON.pendingTransactions)
        
        //Will trasnfer tokens from admin pool to user
        admin.transferToken(energyCoin, tokens, users[0].walletAddress)
        energyCoin.minePendingTransactions(admin.walletAddress)
        console.log(energyCoin)
        console.log("The balance of user is ", energyCoin.getBalanceOfAddress(users[0].walletAddress))
        //Will save blockchain object to JSON file
        fs.writeFileSync('blockchain.json', JSON.stringify(energyCoin))
    })

    socket.on("transfer", function(data) {
        users[0].transferStatus = data.transferStatus

        if (users[0].transferStatus == true) {
            console.log("transferring")
            transferEnergy()
        } else {
            console.log("stopping")
            stopTransferEnergy()
        }
    })

    socket.on("updateEnergyAmount", function(data){
        users[0].energyAmount = data.newEnergyAmount
        console.log("sdklasdjflkasdjflkasjlkdf")
    })

    //Will wait for user to be created
    if(users[0] != undefined){
        var energyCoinJSON = JSON.parse(fs.readFileSync('blockchain.json'))
        var energyCoin = new BlockchainInstance(energyCoinJSON.chain, energyCoinJSON.pendingTransactions)
        
        //Will send data to the client
        socket.emit('init',{
            username : users[0].username,
            energyAmount : users[0].energyAmount,
            tokenAmount : energyCoin.getBalanceOfAddress(users[0].walletAddress),
            transferStatus : users[0].transferStatus
    })}
});