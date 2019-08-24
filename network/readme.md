### Network Setup
- Download Hyperledger fabric samples and all the Docker images required using the command below. 

    `curl -sSL https://goo.gl/6wtTN5 | bash -s 1.1.0 1.1.0  0.4.6`

- clone the repository `git clone https://github.com/ivangsp/provenance-Jewellary`.

- move to the network folder ie `cd provenance-Jewellary/network/`.

- Generate certificates for all the peers and order by running this command `./byfn.sh -m generate`

- starting the Network  using this command `./byfn.sh -m up -s couchdb -a`. This will create all the  docker containers required. 

- If you want to stop the network, use `./byfn.sh -m down`