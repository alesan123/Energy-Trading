import RPi.GPIO as GPIO
import time
import threading
import re

from azure.iot.device import IoTHubDeviceClient, Message

CONNECTION_STRING = "HostName=speakeasy-iot-hub.azure-devices.net;DeviceId=raspberrypi;SharedAccessKey=pcVSRYjWGaKrHypPY2xyrRcmPG/9QP8YE7+/q8REIGo="
isDeviceOn = False

# setup GPIO output
channel = 21

GPIO.setmode(GPIO.BCM)
GPIO.setup(channel, GPIO.OUT)

def iothub_client_init():
    client = IoTHubDeviceClient.create_from_connection_string(CONNECTION_STRING)
    return client

def message_listener(client):
    message = client.receive_message()
    print("Message received: {}".format(message.data))
            
    temp = re.findall(r'\d+', "{}".format(message))
    result = list(map(int, temp)) 
    energyAmount = result[0]
    
    if "-" in "{}".format(message.data):
        energyAmount = energyAmount * -1
        
    print(energyAmount)
    if energyAmount > 0:
        device_on(client)
    else:
        device_off(client)
          
def device_on(client):
    # turn on the device
    GPIO.output(channel, GPIO.HIGH)
    print("Device is on")
    controllerStatus = "true"
    isDeviceOn = True
    
    # send message back to hub
    response = Message(controllerStatus)
    print("Sending response to hub: status =", controllerStatus)
    client.send_message(response)
    print("Message successfully sent")
    
def device_off(client):
    # turn off the device
    GPIO.output(channel, GPIO.LOW)
    print("\nDevice is off")
    controllerStatus = "false"
    isDeviceOn = False
    
    # send message back to hub
    response = Message(controllerStatus)
    print("Sending response to hub: status =", controllerStatus)
    client.send_message(response)
    print("Message successfully sent\n")

def main():
    print("Blockchain Energy Trading System Energy Grid Simulator")    
    client = iothub_client_init()
    
    message_listener_thread = threading.Thread(target=message_listener, args=(client,))
    message_listener_thread.daemon = True
    message_listener_thread.start()
    
    while True:
        try :
            message_listener(client)
        except:
            pass
        
if __name__ == "__main__":
    main()
