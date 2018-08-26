# provenance of Jewellary using Block chain.
An application to help users  determine the provenance of jewellery using hyperleder fabric.
## introduction
In this application I will be using hyperledger fabric <br>
...........................
<br>
.............................

**This application has been tested on Unbuntu 16.04

## Prerequisites
- [GoLang](https://golang.org/)
- [Docker](https://www.docker.com/get-started)
- [Docker compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/en/download/)
- [Curl](https://curl.haxx.se/download.html)

## project structure
```
provenance-Jewellary
|   ReadMe.md
|---basic-network
|---chaincode
|   |   tuna-chaincode.go
|---client-app
|   |   src
|   |   public
|   |   package.json
|---server-app
|   |   controller.js
|   |   package.json
|   |   registerAdmin.js
|   |   registerUser.js
|   |   routes.js
|   |   server.js
|   |   startFabric.sh
|
```
## setup
1. ### [Download Fabric sample Images](https://hyperledger-fabric.readthedocs.io/en/release-1.1/samples.html#binaries)

    Determine a location on your machine where you want to place the Hyperledger Fabric samples applications repository and open that in a terminal window. Then, execute the following commands:
    ```
    git clone -b master https://github.com/hyperledger/fabric-samples.git
    cd fabric-samples
    git checkout {TAG}
    ```
    Please execute the following command from within the directory into which you will extract the platform-specific binaries:
    ```
    curl -sSL https://goo.gl/6wtTN5 | bash -s 1.1.0
    ```
2. ### Runing the application

- clone the project and ```cd server-app ``` folder and install all the depedencies.
- start the network by executing the following command ``` ./startFabric.sh ``` 
- Register the user on the chaincode by running the following commands
``` 
    node registerAdmin.js
    node registeruser.js
```
- run the server using the following commands
``` node server.js ```

- Run the frontEnd application.
    - cd into  "client-app" directory
    - install all the depedencies ``` npm install ```
    - start the application ``` npm start ```

