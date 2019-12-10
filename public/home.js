//Make connection
var socket = io.connect('http://localhost:8080');




socket.on('init', function(data){
    document.getElementById("username").innerHTML = data.username;
    document.getElementById("energyAmount").innerHTML = data.energyAmount;
    document.getElementById("tokenAmount").innerHTML = data.tokenAmount;
 })