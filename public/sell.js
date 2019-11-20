//Make connection
var socket = io.connect('http://localhost:8080');

//Query DOM
amountEntered = document.getElementById('amountEntered')
sellButton = document.getElementById('sellButton')
tokenAmount = document.getElementById('tokenOutput')

 //Emit event

 sellButton.addEventListener('click', function(){

     socket.emit("sell", {
         amountEntered: amountEntered.value
     });
 });