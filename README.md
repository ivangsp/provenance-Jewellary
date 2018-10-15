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
|---network
|---chaincode
|   |   tradeworkflow_v1.go
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

### 1. [Setting up the Network](network)

### 2. [setting up the smart contract or chain code](chaincode)

### 3. The [middleware](middleware) folder contains wrapper functions that use the Fabric SDK library to implement channel and chaincode operations.



