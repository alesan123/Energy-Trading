//Make connection
var socket = io.connect('http://localhost:8080');

//Query DOM
username = document.getElementById('username')
password = document.getElementById('password')
logInButton = document.getElementById('logInButton')


 //Emit event

 logInButton.addEventListener('click', function(){

     socket.emit("logIn", {
         username: username.value,
         password: password.value
     });
 });
 