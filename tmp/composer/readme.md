# network configuration

## delete all the available cards

```bash
composer card delete -c <cardName>
rm -fr $HOME/.composer
```

## copy the cryptographic materials

### export ca

```bash
export EXPORTER_CA_CERT=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' network/crypto-config/peerOrganizations/exporterorg.trade.com/peers/peer0.exporterorg.trade.com/tls/ca.crt)
perl -p -i -e 's@INSERT_EXPORTER_CA_CERT@$ENV{EXPORTER_CA_CERT}@g' tmp/composer/byfn-network.json
```

```bash
export IMPORTER_CA_CERT=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' network/crypto-config/peerOrganizations/importerorg.trade.com/peers/peer0.importerorg.trade.com/tls/ca.crt)
perl -p -i -e 's@INSERT_IMPORTER_CA_CERT@$ENV{IMPORTER_CA_CERT}@g' tmp/composer/byfn-network.json
```

```bash
export REGULATOR_CA_CERT=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' network/crypto-config/peerOrganizations/regulatororg.trade.com/peers/peer0.regulatororg.trade.com/tls/ca.crt)
perl -p -i -e 's@INSERT_REGULATOR_CA_CERT@$ENV{REGULATOR_CA_CERT}@g' tmp/composer/byfn-network.json
```

```bash
export BANK_CA_CERT=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' network/crypto-config/peerOrganizations/bankorg.trade.com/peers/peer0.bankorg.trade.com/tls/ca.crt)
perl -p -i -e 's@INSERT_BANK_CA_CERT@$ENV{BANK_CA_CERT}@g' tmp/composer/byfn-network.json
```

```bash
export CARRIER_CA_CERT=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' network/crypto-config/peerOrganizations/carrierorg.trade.com/peers/peer0.carrierorg.trade.com/tls/ca.crt)
perl -p -i -e 's@INSERT_CARRIER_CA_CERT@$ENV{CARRIER_CA_CERT}@g' tmp/composer/byfn-network.json
```

```bash
export ORDER_CA_CERT=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' network/crypto-config/ordererOrganizations/trade.com/orderers/orderer.trade.com/tls/ca.crt)
perl -p -i -e 's@INSERT_ORDER_CA_CERT@$ENV{ORDER_CA_CERT}@g' tmp/composer/byfn-network.json
```

## change the config for each organisation

`tmp/composer/exporter/byfn-network-exporter.json`

## Locate the user certificate and private key

```bash
export Exporter=network/crypto-config/peerOrganizations/exporterorg.trade.com/users/Admin@exporterorg.trade.com/msp

cp -p $Exporter/signcerts/A*.pem tmp/composer/exporter

cp -p $Exporter/keystore/*_sk tmp/composer/exporter

export Importer=network/crypto-config/peerOrganizations/importerorg.trade.com/users/Admin@importerorg.trade.com/msp

cp -p $Importer/signcerts/A*.pem tmp/composer/importer

cp -p $Importer/keystore/*_sk tmp/composer/importer


export Bank=network/crypto-config/peerOrganizations/bankorg.trade.com/users/Admin@bankorg.trade.com/msp

cp -p $Bank/signcerts/A*.pem tmp/composer/bank

cp -p $Bank/keystore/*_sk tmp/composer/bank


export Carrier=network/crypto-config/peerOrganizations/carrierorg.trade.com/users/Admin@carrierorg.trade.com/msp

cp -p $Carrier/signcerts/A*.pem tmp/composer/carrier

cp -p $Carrier/keystore/*_sk tmp/composer/carrier

export Regulator=network/crypto-config/peerOrganizations/regulatororg.trade.com/users/Admin@regulatororg.trade.com/msp

cp -p $Regulator/signcerts/A*.pem tmp/composer/regulator

cp -p $Regulator/keystore/*_sk tmp/composer/regulator
```

## creating business cards for the Hyperledger Fabric adminis for different organisation

```bash
composer card create -p tmp/composer/exporter/byfn-network-exporter.json -u PeerAdmin -c tmp/composer/exporter/Admin@exporterorg.trade.com-cert.pem -k tmp/composer/exporter/*_sk -r PeerAdmin -r ChannelAdmin -f PeerAdmin@byfn-network-exporterorg.card

composer card create -p tmp/composer/importer/byfn-network-importer.json -u PeerAdmin -c tmp/composer/importer/Admin@importerorg.trade.com-cert.pem -k tmp/composer/importer/*_sk -r PeerAdmin -r ChannelAdmin -f PeerAdmin@byfn-network-importerorg.card

composer card create -p tmp/composer/bank/byfn-network-bank.json -u PeerAdmin -c tmp/composer/bank/Admin@bankorg.trade.com-cert.pem -k tmp/composer/bank/*_sk -r PeerAdmin -r ChannelAdmin -f PeerAdmin@byfn-network-bankorg.card

composer card create -p tmp/composer/regulator/byfn-network-regulator.json -u PeerAdmin -c tmp/composer/regulator/Admin@regulatororg.trade.com-cert.pem -k tmp/composer/regulator/*_sk -r PeerAdmin -r ChannelAdmin -f PeerAdmin@byfn-network-regulatororg.card

composer card create -p tmp/composer/carrier/byfn-network-carrier.json -u PeerAdmin -c tmp/composer/carrier/Admin@carrierorg.trade.com-cert.pem -k tmp/composer/carrier/*_sk -r PeerAdmin -r ChannelAdmin -f PeerAdmin@byfn-network-carrierorg.card

```

## import the bussinness cards into Hyperledger Fabric administrator for each organisation

### exporter org

`composer card import -f PeerAdmin@byfn-network-exporterorg.card --card PeerAdmin@byfn-network-exporterorg`

`composer card import -f PeerAdmin@byfn-network-importerorg.card --card PeerAdmin@byfn-network-importerorg`

`composer card import -f PeerAdmin@byfn-network-bankorg.card --card PeerAdmin@byfn-network-bankorg`

`composer card import -f PeerAdmin@byfn-network-carrierorg.card --card PeerAdmin@byfn-network-carrierorg`

`composer card import -f PeerAdmin@byfn-network-regulatororg.card --card PeerAdmin@byfn-network-regulatororg`

## install the bussiness network onto Hyperledger Fabric Peer Nodes

### export peer

`composer network install --card PeerAdmin@byfn-network-exporterorg --archiveFile trade-network.bna`

********** **trade-network.bna is the bussiness network that we want to install** *********

Repeat this for all the peer nodes [importer, bank, carrier, regulator]

## creating new network admins for each organization

``` bash
composer identity request -c PeerAdmin@byfn-network-exporterorg -u admin -s adminpw -d exporterAdmin
composer identity request -c PeerAdmin@byfn-network-importerorg -u admin -s adminpw -d importerAdmin
composer identity request -c PeerAdmin@byfn-network-regulatororg -u admin -s adminpw -d regulatorAdmin
composer identity request -c PeerAdmin@byfn-network-carrierorg -u admin -s adminpw -d carrierAdmin
composer identity request -c PeerAdmin@byfn-network-bankorg -u admin -s adminpw -d bankAdmin

```

## starting the Network

```bash
composer network start -c PeerAdmin@byfn-network-exporterorg -n trade-network -V 0.0.1 -o endorsementPolicyFile=tmp/composer/endorsement-policy.json -A exporter -C  exporter/admin-pub.pem -A importerAdmin -C importerAdmin/admin-pub.pem -A regAdmin -C regAdmin/admin-pub.pem -A carrierAdmin -C carrierAdmin/admin-pub.pem -A regAdmin -C regAdmin/admin-pub.pem -A bankAdmin -C bankAdmin/admin-pub.pem
```

### to interact with the network create cards for the admins created above

```bash
composer card create -p tmp/composer/exporter/byfn-network-exporter.json -u exporterAdmin  -n trade-network -c  exporter/admin-pub.pem -k exporter/admin-priv.pem

composer card create -p tmp/composer/importer/byfn-network-importer.json -u importerAdmin -n trade-network  -c  importerAdmin/admin-pub.pem -k importerAdmin/admin-priv.pem

composer card create -p tmp/composer/carrier/byfn-network-carrier.json -u carrierAdmin -n trade-network  -c  carrierAdmin/admin-pub.pem -k carrierAdmin/admin-priv.pem

composer card create -p tmp/composer/bank/byfn-network-bank.json -u bankadmin -n trade-network  -c  bankAdmin/admin-pub.pem -k bankAdmin/admin-priv.pem

composer card create -p tmp/composer/regulator/byfn-network-regulator.json -u regulatorAdmin -n trade-network  -c regulatorAdmin/admin-pub.pem -k regulatorAdmin/admin-priv.pem

```

### import the cards

```bash
composer card import -f exporterAdmin@trade-network.card

composer card import -f importerAdmin@trade-network.card

composer card import -f regAdmin@trade-network.card

composer card import -f carrierAdmin@trade-network.card

composer card import -f bankAdmin@trade-network.card

```

```bash
sed -e 's/localhost:7050/10.0.0.1:7050/' -e 's/localhost:7053/10.0.0.1:7053/'  -e 's/localhost:7054/10.0.0.1:7054/' -e 's/localhost:10051/10.0.0.1:10051/'  -e 's/localhost:8051/10.0.0.1:8051/' -e 's/localhost:9051/10.0.0.1:9051/' -e  's/localhost:11051/10.0.0.1:11051/' -e 's/localhost:10054/10.0.0.1:10054/' -e 's/localhost:8054/10.0.0.1:8054/' -e 's/localhost:9054/10.0.0.1:9054/' -e 's/localhost:11054/10.0.0.1:11054/'    < $HOME/.composer/cards/exporterAdmin@trade-network/connection.json  > tmp/composer/exporter/connection.json && cp -p tmp/composer/exporter/connection.json $HOME/.composer/cards/exporterAdmin@trade-network/

```

[rest click here more](https://hyperledger.github.io/composer/v0.19/tutorials/deploy-to-fabric-multi-org)