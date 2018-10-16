package main

import (
	"fmt"
	"errors"
	"strconv"
	"encoding/json"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type TradeWorkflowChaincode struct {}

//	create an assset on the blockchain
//	@params - Array of length 4
//	name of the asset		Description of the asset	price  			owner
//	"marble"				"golden marble"				"20.0"			"ivan oj"
func (t *TradeWorkflowChaincode) createAsset(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var tradeKey string
	var tradeAgreement *TradeAgreement
	var tradeAgreementBytes []byte
	var amount int
	var err error

	// Access control: Only an Importer Org member can invoke this transaction
	if !authenticateImporterOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Caller not a member of Importer Org. Access denied.")
	}

	if len(args) != 4 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 4 {productName, Amount, Description of Goods, location}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	amount, err = strconv.Atoi(string(args[3]))
	if err != nil {
		return shim.Error(err.Error())
	}
	
	id := generate_id(stub);
	product = &Product{ID: id , Name: args[0], Description: args[1], Price: args[2], Owner: Owner{Username: args[3] }}
	productBytes, err = json.Marshal(product)
	if err != nil {
		return shim.Error("Error marshaling trade product structure")
	}

	// Write the state to the ledger

	err = stub.PutState(id, productBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("Asset with id %s recorded\n", id)

	return shim.Success(nil)
}