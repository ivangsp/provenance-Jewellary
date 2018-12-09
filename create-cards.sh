#! /bin/bash
set -e

## delete the old cards
# composer card delete -c <cardName>

cd tmp/composer

# delete old configuration
rm -fr $HOME/.composer
find * ! -name 'byfn-network-example.json' ! -name 'endorsement-policy.json' ! -name 'readme.md' ! -name '*.bna' -type f -exec rm -f {} +
find *  -type d -exec rm -r {} +


# create new directories
mkdir bank regulator importer exporter carrier

# copy the example for the network configuration to byfn-network.json
cat byfn-network-example.json >>byfn-network.json

## copy the cryptographic materials into the network configuration file byfn-network.json
export EXPORTER_CA_CERT=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' ../../network/crypto-config/peerOrganizations/exporterorg.trade.com/peers/peer0.exporterorg.trade.com/tls/ca.crt)
perl -p -i -e 's@INSERT_EXPORTER_CA_CERT@$ENV{EXPORTER_CA_CERT}@g' byfn-network.json
export IMPORTER_CA_CERT=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' ../../network/crypto-config/peerOrganizations/importerorg.trade.com/peers/peer0.importerorg.trade.com/tls/ca.crt)
perl -p -i -e 's@INSERT_IMPORTER_CA_CERT@$ENV{IMPORTER_CA_CERT}@g' byfn-network.json
export REGULATOR_CA_CERT=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' ../../network/crypto-config/peerOrganizations/regulatororg.trade.com/peers/peer0.regulatororg.trade.com/tls/ca.crt)
perl -p -i -e 's@INSERT_REGULATOR_CA_CERT@$ENV{REGULATOR_CA_CERT}@g' byfn-network.json
export BANK_CA_CERT=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' ../../network/crypto-config/peerOrganizations/bankorg.trade.com/peers/peer0.bankorg.trade.com/tls/ca.crt)
perl -p -i -e 's@INSERT_BANK_CA_CERT@$ENV{BANK_CA_CERT}@g' byfn-network.json
export CARRIER_CA_CERT=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' ../../network/crypto-config/peerOrganizations/carrierorg.trade.com/peers/peer0.carrierorg.trade.com/tls/ca.crt)
perl -p -i -e 's@INSERT_CARRIER_CA_CERT@$ENV{CARRIER_CA_CERT}@g' byfn-network.json
export ORDER_CA_CERT=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' ../../network/crypto-config/ordererOrganizations/trade.com/orderers/orderer.trade.com/tls/ca.crt)
perl -p -i -e 's@INSERT_ORDER_CA_CERT@$ENV{ORDER_CA_CERT}@g' byfn-network.json

# loop through all directories
for d in * ; do
    echo "$d"
    if [ "$d" = "importer" ] ; then
        cp -v "byfn-network.json"  importer/byfn-network-importer.json
        sed -i 's/ORGANISATION_NAME/importerorg/g' importer/byfn-network-importer.json
        
        # copy the user certificates into the respective organisation folder
        export Importer=../../network/crypto-config/peerOrganizations/importerorg.trade.com/users/Admin@importerorg.trade.com/msp
        cp -p $Importer/signcerts/A*.pem importer
        cp -p $Importer/keystore/*_sk importer
    fi
    if [ "$d" = "exporter" ] ; then
        cp -v "byfn-network.json"  exporter/byfn-network-exporter.json
        sed -i 's/ORGANISATION_NAME/exporterorg/g' exporter/byfn-network-exporter.json

        # copy the user certificates into the respective organisation folder
        export Exporter=../../network/crypto-config/peerOrganizations/exporterorg.trade.com/users/Admin@exporterorg.trade.com/msp
        cp -p $Exporter/signcerts/A*.pem exporter
        cp -p $Exporter/keystore/*_sk exporter
    fi
    if [ "$d" = "regulator" ] ; then
        cp -v "byfn-network.json"  regulator/byfn-network-regulator.json
        sed -i 's/ORGANISATION_NAME/regulatororg/g' regulator/byfn-network-regulator.json

        # copy the user certificates into the respective organisation folder
        export Regulator=../../network/crypto-config/peerOrganizations/regulatororg.trade.com/users/Admin@regulatororg.trade.com/msp
        cp -p $Regulator/signcerts/A*.pem regulator
        cp -p $Regulator/keystore/*_sk regulator
    fi
    if [ "$d" = "carrier" ] ; then
        cp -v "byfn-network.json"  carrier/byfn-network-carrier.json
        sed -i 's/ORGANISATION_NAME/carrierorg/g' carrier/byfn-network-carrier.json

        # copy the user certificates into the respective organisation folder
        export Carrier=../../network/crypto-config/peerOrganizations/carrierorg.trade.com/users/Admin@carrierorg.trade.com/msp
        cp -p $Carrier/signcerts/A*.pem carrier
        cp -p $Carrier/keystore/*_sk carrier
    fi
    if [ "$d" = "bank" ] ; then
        cp -v "byfn-network.json" bank/byfn-network-bank.json
        sed -i 's/ORGANISATION_NAME/bankorg/g' bank/byfn-network-bank.json

        # copy the user certificates into the respective organisation folder
        export Bank=../../network/crypto-config/peerOrganizations/bankorg.trade.com/users/Admin@bankorg.trade.com/msp
        cp -p $Bank/signcerts/A*.pem bank
        cp -p $Bank/keystore/*_sk bank
    fi
done

# create cards
echo "========================================creating cards========================================="
composer card create -p exporter/byfn-network-exporter.json -u PeerAdmin -c exporter/Admin@exporterorg.trade.com-cert.pem -k exporter/*_sk -r PeerAdmin -r ChannelAdmin -f PeerAdmin@byfn-network-exporterorg.card

composer card create -p importer/byfn-network-importer.json -u PeerAdmin -c importer/Admin@importerorg.trade.com-cert.pem -k importer/*_sk -r PeerAdmin -r ChannelAdmin -f PeerAdmin@byfn-network-importerorg.card

composer card create -p bank/byfn-network-bank.json -u PeerAdmin -c bank/Admin@bankorg.trade.com-cert.pem -k bank/*_sk -r PeerAdmin -r ChannelAdmin -f PeerAdmin@byfn-network-bankorg.card

composer card create -p regulator/byfn-network-regulator.json -u PeerAdmin -c regulator/Admin@regulatororg.trade.com-cert.pem -k regulator/*_sk -r PeerAdmin -r ChannelAdmin -f PeerAdmin@byfn-network-regulatororg.card

composer card create -p carrier/byfn-network-carrier.json -u PeerAdmin -c carrier/Admin@carrierorg.trade.com-cert.pem -k carrier/*_sk -r PeerAdmin -r ChannelAdmin -f PeerAdmin@byfn-network-carrierorg.card


## import the bussinness cards into Hyperledger Fabric administrator for each organisation
echo "=====================================================importing the cards=============================================="
composer card import -f PeerAdmin@byfn-network-exporterorg.card --card PeerAdmin@byfn-network-exporterorg

composer card import -f PeerAdmin@byfn-network-importerorg.card --card PeerAdmin@byfn-network-importerorg

composer card import -f PeerAdmin@byfn-network-bankorg.card --card PeerAdmin@byfn-network-bankorg

composer card import -f PeerAdmin@byfn-network-carrierorg.card --card PeerAdmin@byfn-network-carrierorg

composer card import -f PeerAdmin@byfn-network-regulatororg.card --card PeerAdmin@byfn-network-regulatororg

# Installing the business network on the Peer nodes
echo "================================================= Installing the businness network======================================"
composer network install --card PeerAdmin@byfn-network-importerorg --archiveFile ../../chaincode/trade-network/*.bna
composer network install --card PeerAdmin@byfn-network-exporterorg --archiveFile  ../../chaincode/trade-network/*.bna
composer network install --card PeerAdmin@byfn-network-bankorg --archiveFile  ../../chaincode/trade-network/*.bna
composer network install --card PeerAdmin@byfn-network-carrierorg --archiveFile  ../../chaincode/trade-network/*.bna
composer network install --card PeerAdmin@byfn-network-regulatororg --archiveFile  ../../chaincode/trade-network/*.bna

# creating network admins to interact with the network
echo "================================================= creating network admins to interact with the network ====================="
composer identity request -c PeerAdmin@byfn-network-exporterorg -u admin -s adminpw -d artisanAdmin
composer identity request -c PeerAdmin@byfn-network-importerorg -u admin -s adminpw -d traderAdmin
composer identity request -c PeerAdmin@byfn-network-regulatororg -u admin -s adminpw -d regulatorAdmin
composer identity request -c PeerAdmin@byfn-network-carrierorg -u admin -s adminpw -d carrierAdmin
composer identity request -c PeerAdmin@byfn-network-bankorg -u admin -s adminpw -d bankAdmin

# starting the Network
echo "================================================starting the Network, this may take some time===================================="
composer network start -c PeerAdmin@byfn-network-exporterorg -n trade-network -V 1.0.0 -o endorsementPolicyFile=endorsement-policy.json -A artisanAdmin -C  artisanAdmin/admin-pub.pem -A traderAdmin -C traderAdmin/admin-pub.pem -A regulatorAdmin -C regulatorAdmin/admin-pub.pem -A carrierAdmin -C carrierAdmin/admin-pub.pem -A bankAdmin -C bankAdmin/admin-pub.pem

# create cards for the admins inorder  for them to interact with the network
echo "==============================================creating cards for the admins========================================================"
composer card create -p exporter/byfn-network-exporter.json -u artisanAdmin  -n trade-network -c  artisanAdmin/admin-pub.pem -k artisanAdmin/admin-priv.pem

composer card create -p importer/byfn-network-importer.json -u traderAdmin -n trade-network  -c  traderAdmin/admin-pub.pem -k traderAdmin/admin-priv.pem

composer card create -p carrier/byfn-network-carrier.json -u carrierAdmin -n trade-network  -c  carrierAdmin/admin-pub.pem -k carrierAdmin/admin-priv.pem

composer card create -p bank/byfn-network-bank.json -u bankadmin -n trade-network  -c  bankAdmin/admin-pub.pem -k bankAdmin/admin-priv.pem

composer card create -p regulator/byfn-network-regulator.json -u regulatorAdmin -n trade-network  -c regulatorAdmin/admin-pub.pem -k regulatorAdmin/admin-priv.pem

# import the cards
echo "===========================================importing the cards ============================================================="
composer card import -f artisanAdmin@trade-network.card
composer card import -f traderAdmin@trade-network.card
composer card import -f regulatorAdmin@trade-network.card
composer card import -f carrierAdmin@trade-network.card
#composer card import -f bankAdmin@trade-network.card

echo "====================finished setting up the network, you can run composer card list to see all the available cards========================="

