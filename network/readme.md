# setting up the network

- Download the fabric-samples ie `git clone -b issue-6978 https://github.com/sstone1/fabric-samples.git`

- Download Docker images and Download the platform binaries, including cryptogen. 

    `curl -sSL https://goo.gl/6wtTN5 | bash -s 1.1.0 1.1.0  0.4.6`


## genearte cryptographic materials

`./byfn.sh -m generate`

## starting the Network

Naviaget to `network` folder and enter the folloing commands

`./byfn.sh -m up -s couchdb -a`

## stoping the network

`./byfn.sh -m down`
