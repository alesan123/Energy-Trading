//Make connection
var socket = io.connect('http://localhost:8080');

transferButton = document.getElementById("transferButton")

var startTime;
var endTime;

socket.on('init', function(data) {
    document.getElementById("username").innerHTML = data.username;
    document.getElementById("tokenAmount").innerHTML = data.tokenAmount;
    document.getElementById("energyAmount").innerHTML = data.energyAmount;
})

transferButton.addEventListener('click', function() {

    if (transferButton.innerHTML == "Stop Transfer") {
        endTime = new Date();
        transferButton.innerHTML = "Transfer Energy"
        transferButton.style.backgroundColor = "#324a5e"

        socket.emit("transfer", {
            transferStatus: false
        });
    } else {
        startTime = new Date();
        transferButton.innerHTML = "Stop Transfer"
        transferButton.style.backgroundColor = "#fc0303"

        socket.emit("transfer", {
            transferStatus: true
        });
    }

    if(startTime != null && endTime !=null)
    {
        var seconds = endTime - startTime;
        var newEnergyAmount = parseInt(document.getElementById("energyAmount").innerHTML)

        socket.emit("updateEnergyAmount", {
            newEnergyAmount: newEnergyAmount - seconds
        })

    }
});