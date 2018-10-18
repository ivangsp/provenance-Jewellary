package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type TradeChaincode struct{
	testMode bool
}

//	create an assset on the blockchain
//	@params - Array of length 4
//	name of the asset		Description of the asset	price  			owner
//	"marble"				"golden marble"				"20.0"			"ivan oj"
func (t *TradeChaincode) createAsset(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var err error

	// Access control: Only an Importer Org member can invoke this transaction
	if !authenticateImporterOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Caller not a member of Importer Org. Access denied.")
	}

	if len(args) != 4 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 4 {productName, Amount, Description of Goods, location}. Found %d", len(args)))
		return shim.Error(err.Error())
	}
	price, err := strconv.ParseFloat(args[2], 32)

	id := generate_id(stub)
	product := &Product{Id: id, Name: args[0], Description: args[1], Price: float32(price), Owner: Owner{Username: args[3]}}
	productBytes, err := json.Marshal(product)
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

/*
	* This is invoked by the exporter when he wants to get in trade with the artisan(importer)
	* @params - [productId,  buyerName, location, date of expiration]

*/
func (t *TradeChaincode) requestTrade(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var err error
	var tradeKey string
	
	// Access control: Only an Importer(buyer) Org member can invoke this transaction
	if !authenticateImporterOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Caller not a member of exporter Org. Access denied.")
	}

	if len(args) != 4 {
		err := errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 4 {productId,  buyerName, location}. Found %d", len(args)))
		return shim.Error(err.Error())
	}
	
	product, err := getProductById(stub, args[0]);

	if err != nil {
		err := errors.New(fmt.Sprintf("Product with Id : %s", args[0]))
		return shim.Error(err.Error())
	}

	// create  letter of credit
	// lcId := generate_id(stub);
	// letterOfCredit := LetterOfCredit{Id: lcId, Amount: product.Price, Beneficiary: product.Name, ExpirationDate: args[3], Status: REQUESTED}

	// letterOfCreditBytes, err := json.Marshal(letterOfCredit)
	// err = stub.PutState(lcId, letterOfCreditBytes)

	// Write the state to the ledger
	tradeId := generate_id(stub)
	tradeKey, err = getTradeKey(stub, tradeId)
	if err != nil {
		return shim.Error(err.Error())
	}


	tradeAgreement := TradeAgreement{Buyer: args[1], Product: product, Status: REQUESTED, Timestamp: time.Now(), Location: args[2] }
	tradeAgreementBytes, err := json.Marshal(tradeAgreement)

	if err != nil {
		return shim.Error("Error marshaling tradeAgreement  structure")
	}

	err = stub.PutState(tradeKey, tradeAgreementBytes);
	if (err != nil) {
		return shim.Error("Error occured when saving the tradeAgreement");
	}
	return shim.Success(nil);

}

// * accept trade agreement
// * param [tradeId]
func (t *TradeChaincode) acceptTrade(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var tradeKey string
	var tradeAgreement *TradeAgreement
	var tradeAgreementBytes []byte
	var err error

	// Access control: Only an Exporting Entity Org member can invoke this transaction
	if !t.testMode && !authenticateExportingEntityOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Caller not a member of Exporting Entity Org. Access denied.")
	}

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {ID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	tradeAgreementBytes, err = stub.GetState(args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(tradeAgreementBytes) == 0 {
		err = errors.New(fmt.Sprintf("No record found for trade ID %s", args[0]))
		return shim.Error(err.Error())
	}

	// Unmarshal the JSON
	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	if tradeAgreement.Status == ACCEPTED {
		fmt.Printf("Trade %s already accepted", args[0])
	} else {
		tradeAgreement.Status = ACCEPTED
		tradeAgreementBytes, err = json.Marshal(tradeAgreement)
		if err != nil {
			return shim.Error("Error marshaling trade agreement structure")
		}
		// Write the state to the ledger
		err = stub.PutState(args[0], tradeAgreementBytes)
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	fmt.Printf("Trade %s acceptance recorded\n", args[0])

	return shim.Success(nil)

}



/*
	* request letter of credit
	* This action is performed by member of the importer Org
*/
func (t *TradeWorkflowChaincode) requestLC(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var tradeKey, lcKey string
	var tradeAgreementBytes, letterOfCreditBytes, exporterBytes []byte
	var tradeAgreement *TradeAgreement
	var letterOfCredit *LetterOfCredit
	var err error

	// Access control: Only an Importer Org member can invoke this transaction
	if !t.testMode && !authenticateImporterOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Caller not a member of Importer Org. Access denied.")
	}

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {Trade ID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	// Lookup trade agreement from the ledger
	tradeAgreementBytes, err = stub.GetState(args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(tradeAgreementBytes) == 0 {
		err = errors.New(fmt.Sprintf("No record found for trade ID %s", args[0]))
		return shim.Error(err.Error())
	}

	// Unmarshal the JSON
	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	// Verify that the trade has been agreed to
	if tradeAgreement.Status != ACCEPTED {
		return shim.Error("Trade has not been accepted by the parties")
	}

	// Lookup exporter (L/C beneficiary)
	beneficiary := tradeAgreement.Product.Owner.Username
	amount := tradeAgreement.Product.Price;

	letterOfCredit = &LetterOfCredit{Beneficiary: beneficiary, Amount: amount, Status: REQUESTED, ExpirationDate: ""}
	letterOfCreditBytes, err = json.Marshal(letterOfCredit)
	if err != nil {
		return shim.Error("Error marshaling letter of credit structure")
	}

	// Write the state to the ledger
	lcKey, err = getLCKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutState(lcKey, letterOfCreditBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("Letter of Credit request for trade %s recorded\n", args[0])

	return shim.Success(nil)
}

// Issue an L/C
func (t *TradeWorkflowChaincode) issueLC(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var lcKey string
	var letterOfCreditBytes []byte
	var letterOfCredit *LetterOfCredit
	var err error

	// Access control: Only Bank Org member can invoke this transaction
	if !t.testMode && !authenticateBankOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Caller not a member of Bank Org. Access denied.")
	}

	if len(args) < 2 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting at least 2: { L/C ID, Expiry Date}, Found %d", len(args)))
		return shim.Error(err.Error())
	}

	// Lookup L/C from the ledger
	letterOfCreditBytes, err = stub.GetState(args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	// Unmarshal the JSON
	err = json.Unmarshal(letterOfCreditBytes, &letterOfCredit)
	if err != nil {
		return shim.Error(err.Error())
	}

	if letterOfCredit.Status == ISSUED {
		fmt.Printf("L/C for trade %s already issued", args[0])
	} else if letterOfCredit.Status == ACCEPTED {
		fmt.Printf("L/C for trade %s already accepted", args[0])
	} else {
		letterOfCredit.ExpirationDate = args[1]
		letterOfCredit.Status = ISSUED
		letterOfCreditBytes, err = json.Marshal(letterOfCredit)
		if err != nil {
			return shim.Error("Error marshaling L/C structure")
		}
		// Write the state to the ledger
		err = stub.PutState(args[0], letterOfCreditBytes)
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	fmt.Printf("L/C issuance for trade %s recorded\n", args[0])

	return shim.Success(nil)
}

// Accept an L/C
func (t *TradeWorkflowChaincode) acceptLC(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var lcKey string
	var letterOfCreditBytes []byte
	var letterOfCredit *LetterOfCredit
	var err error

	// Access control: Only an Exporter Org member can invoke this transaction
	if !t.testMode && !authenticateExporterOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Caller not a member of Exporter Org. Access denied.")
	}

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {Trade ID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	// Lookup L/C from the ledger
	// lcKey, err = getLCKey(stub, args[0])
	// if err != nil {
	// 	return shim.Error(err.Error())
	// }
	letterOfCreditBytes, err = stub.GetState(args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	// Unmarshal the JSON
	err = json.Unmarshal(letterOfCreditBytes, &letterOfCredit)
	if err != nil {
		return shim.Error(err.Error())
	}

	if letterOfCredit.Status == ACCEPTED {
		fmt.Printf("L/C for trade %s already accepted", args[0])
	} else if letterOfCredit.Status == REQUESTED {
		fmt.Printf("L/C for trade %s has not been issued", args[0])
		return shim.Error("L/C not issued yet")
	} else {
		letterOfCredit.Status = ACCEPTED
		letterOfCreditBytes, err = json.Marshal(letterOfCredit)
		if err != nil {
			return shim.Error("Error marshaling L/C structure")
		}
		// Write the state to the ledger
		err = stub.PutState(args[0], letterOfCreditBytes)
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	fmt.Printf("L/C acceptance for trade %s recorded\n", args[0])

	return shim.Success(nil)
}