package main

import (
	"strings"
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


func (t *TradeChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Initializing Trade Workflow")
	return shim.Success(nil)
}

func (t *TradeChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	var creatorOrg, creatorCertIssuer string
	var err error

	fmt.Println("TradeWorkflow Invoke")

	if !t.testMode {
		creatorOrg, creatorCertIssuer, err = getTxCreatorInfo(stub)
		if err != nil {
			err = fmt.Errorf("Error extracting creator identity info: %s\n", err.Error())
			return shim.Error(err.Error())
		}
		fmt.Printf("TradeWorkflow Invoke by '%s', '%s'\n", creatorOrg, creatorCertIssuer)
	}

	function, args := stub.GetFunctionAndParameters()
	if function == "createAsset" {
		// Exporter creates an asset on the ledger
		return t.createAsset(stub, creatorOrg, creatorCertIssuer, args)	
	} else if function == "requestTrade" {
		// Importer requests a trade
		return t.requestTrade(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "acceptTrade" {
		// Exporter accepts a trade
		return t.acceptTrade(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "requestLC" {
		// Importer requests for L/c
		return t.requestLC(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "issueLC" {
		// Bank issues the letter of credit
		return t.issueLC(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "requestShipment" {
		// carried out by the exporter org
		return t.requestShipment(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "acceptShipment" {
		// carried out by the Carrier org
		return t.acceptShipment(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "makePayment" {
		// The bank makes payment to the exporter
		return t.makePayment(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "updateShipment" {
		// Carrier updates the shipment location
		return t.updateShipment(stub, creatorOrg, creatorCertIssuer, args)
	}


	return shim.Error("Invalid invoke function name")
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
func (t *TradeChaincode) requestLC(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var tradeAgreementBytes []byte
	var tradeAgreement *TradeAgreement
	var letterOfCredit LetterOfCredit
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
	// amount := tradeAgreement.Product.Price;

	letterOfCredit = LetterOfCredit{Beneficiary: beneficiary, Status: REQUESTED, ExpirationDate: ""}
	tradeAgreement.LetterOfCredit = letterOfCredit

	tradeAgreementBytes, err = json.Marshal(tradeAgreement)
	if err != nil {
		return shim.Error("Error marshaling trade agreement structure")
	}

	// write to the ledger
	err = stub.PutState(args[0], tradeAgreementBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("Letter of Credit request for trade %s recorded\n", args[0])

	return shim.Success(nil)
}

// Issue an L/C
func (t *TradeChaincode) issueLC(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var tradeAgreementBytes []byte
	// var letterOfCredit *LetterOfCredit
	var tradeAgreement *TradeAgreement
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
	tradeAgreementBytes, err = stub.GetState(args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	// Unmarshal the JSON
	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	letterOfCredit := tradeAgreement.LetterOfCredit

	if letterOfCredit.Status == ISSUED {
		fmt.Printf("L/C for trade %s already issued", args[0])
	} else if letterOfCredit.Status == ACCEPTED {
		fmt.Printf("L/C for trade %s already accepted", args[0])
	} else {
		letterOfCredit.ExpirationDate = args[1]
		letterOfCredit.Status = ISSUED
		amount, err := strconv.ParseFloat(args[2], 32)
		letterOfCredit.Amount = float32(amount)

		tradeAgreementBytes, err = json.Marshal(tradeAgreement)
		if err != nil {
			return shim.Error("Error marshaling L/C structure")
		}
		// Write the state to the ledger
		err = stub.PutState(args[0], tradeAgreementBytes)
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	fmt.Printf("L/C issuance for trade %s recorded\n", args[0])

	return shim.Success(nil)
}

// Accept an L/C
// This is performed Bank org
func (t *TradeChaincode) acceptLC(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var tradeAgreementBytes []byte
	var tradeAgreement *TradeAgreement
	var err error

	// Access control: Only an Exporter Org member can invoke this transaction
	if !t.testMode && !authenticateBankOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Caller not a member of Bank Org. Access denied.")
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
	tradeAgreementBytes, err = stub.GetState(args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	// Unmarshal the JSON
	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	letterOfCredit := tradeAgreement.LetterOfCredit

	if letterOfCredit.Status == ACCEPTED {
		fmt.Printf("L/C for trade %s already accepted", args[0])
	} else if letterOfCredit.Status == REQUESTED {
		fmt.Printf("L/C for trade %s has not been issued", args[0])
		return shim.Error("L/C not issued yet")
	} else {
		letterOfCredit.Status = ACCEPTED
		tradeAgreement.LetterOfCredit = letterOfCredit

		tradeAgreementBytes, err = json.Marshal(tradeAgreement)
		if err != nil {
			return shim.Error("Error marshaling tradeAgreement structure")
		}
		// Write the state to the ledger
		err = stub.PutState(args[0], tradeAgreementBytes)
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	fmt.Printf("L/C acceptance for trade %s recorded\n", args[0])

	return shim.Success(nil)
}

// request for shipment of goods to the buyer(importer)
// @param [tradeAgreementId, exporterName]
func (t *TradeChaincode) requestShipment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var err error
	var tradeAgreement *TradeAgreement
	var tradeAgreementBytes []byte

	// Access control: Only an Exporting  Org member can invoke this transaction
	if !t.testMode && !authenticateExporterOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Caller not a member of Exporting  Org. Access denied.")
	}

	if len(args) != 2 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {Trade ID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	// Lookup tradeAgreement from the ledger
	tradeAgreementBytes, er := stub.GetState(args[0]);
	if err != nil {
		err = errors.New(fmt.Sprintf("tradeAgreement Id does not exist, %s", args[0]))
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

	descriptionOfGoods := tradeAgreement.Product.Description
	destination := tradeAgreement.Location
	beneficiary := tradeAgreement.Buyer

	shipmentReceipt := &ShipmentReceipt{
		Destination: destination, Beneficiary: beneficiary,
		DescriptionOfGoods: descriptionOfGoods, Exporter: args[1],
		Status: REQUESTED,
	}

	shipmentReceiptBytes, er := json.Marshal(shipmentReceipt)
	if er != nil {
		return shim.Error("Error marshaling shipmentReceipt  structure")	
	}

	shipmentReceiptId := generate_id(stub)
	// Write the state to the ledger
	err = stub.PutState(shipmentReceiptId, shipmentReceiptBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("Shipment preparation for trade %s recorded\n", args[0])

	return shim.Success(nil)
	
}

// accept shipment of goods
// @param [shipmentId, carrierName, fee]
func (t *TradeChaincode) acceptShipment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var err error
	var shipmentReceipt *ShipmentReceipt
	var shipmentReceiptBytes []byte

	// Access control: Only an Exporting Entity Org member can invoke this transaction
	if !t.testMode && !authenticateCarrierOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Caller not a member of Carrier Org. Access denied.")
	}

	if len(args) != 3 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {Trade ID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	// Lookup tradeAgreement from the ledger
	shipmentReceiptBytes, er := stub.GetState(args[0]);
	if err != nil {
		err = errors.New(fmt.Sprintf("shipmenteceipt Id does not exist, %s", args[0]))
		return shim.Error(err.Error())
	}

	if len(shipmentReceiptBytes) == 0 {
		err = errors.New(fmt.Sprintf("No record found for shipmentReceiptBytes ID %s", args[0]))
		return shim.Error(err.Error())
	}

	// Unmarshal the JSON
	err = json.Unmarshal(shipmentReceiptBytes, &shipmentReceipt)
	if err != nil {
		return shim.Error(err.Error())
	}

	// Verify that the trade has been agreed to
	if shipmentReceipt.Status != ACCEPTED {
		return shim.Error("shipmentReceipt has  already been accepted")
	}

	fee, er := strconv.ParseFloat(args[2], 32)
	if er != nil {
		return shim.Error("Error while converting fee to float")
	}


	shipmentReceipt.Status 	 = ACCEPTED
	shipmentReceipt.Fee		 = float32(fee)
	shipmentReceipt.Carrier  = args[1]

	shipmentReceipt.Id		 = args[0]

	shipmentReceiptBytes, err = json.Marshal(shipmentReceipt)
	if err != nil {
		return shim.Error("Error marshaling shipmentReceipt  structure")	
	}

	// Write the state to the ledger
	err = stub.PutState(args[0], shipmentReceiptBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("Shipment accepted and shipment Receipt issued")

	return shim.Success(nil)
	
}

// make payment
// @params [shipmentReceiptId]
// transfer ownership if product has been delivered
func (t *TradeChaincode) makePayment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var tradeAgreement *TradeAgreement
	var err error
	var tradeAgreementBytes []byte
	var shipmentReceipt *ShipmentReceipt
	var amount float32

	// Access control: Only an Bank  Org member can invoke this transaction
	if !t.testMode && !authenticateBankOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Caller not a member of Bank  Org. Access denied.")
	}

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {Trade ID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	// Lookup shipment location from the ledger
	shipmentReceiptBytes, err := stub.GetState(args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(shipmentReceiptBytes) == 0 {
		fmt.Printf("Shipment for trade %s has not been prepared yet", args[0])
		return shim.Error("Shipment not prepared yet")
	}

	// Unmarshal the JSON
	err = json.Unmarshal(shipmentReceiptBytes, &shipmentReceipt)
	if err != nil {
		return shim.Error(err.Error())
	}

	if shipmentReceipt.Status != ACCEPTED || shipmentReceipt.Status != DELIVERED {
		return shim.Error("The shipment receipt has not been confirmed");
	}

	// Lookup trade agreement from the ledger
	tradeAgreementBytes, err = stub.GetState(shipmentReceipt.TradeAgreementId)
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

	if shipmentReceipt.Status == ACCEPTED {
		amount = tradeAgreement.Amount
		tradeAgreement.Payment = amount

		// update the ledger
		tradeAgreementBytes, err = json.Marshal(tradeAgreement)
		if err != nil {
			return shim.Error("Error marshaling tradeAgreement  structure")	
		}
		// update the tradeAgreement with  the new paymen
		err = stub.PutState(shipmentReceipt.TradeAgreementId, tradeAgreementBytes)
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(nil)

	} else if (shipmentReceipt.Status == DELIVERED) {
		amount = tradeAgreement.Amount
		tradeAgreement.Payment = amount

		// update the ledger
		tradeAgreementBytes, err = json.Marshal(tradeAgreement)
		if err != nil {
			return shim.Error("Error marshaling tradeAgreement  structure")	
		}
		// update the tradeAgreement with  the new paymen
		err = stub.PutState(shipmentReceipt.TradeAgreementId, tradeAgreementBytes)
		if err != nil {
			return shim.Error(err.Error())
		}

		// transfer ownership
		product := tradeAgreement.Product
		product.Owner.Username = tradeAgreement.Buyer
		productBytes, er := json.Marshal(product)
		if er != nil {
			return shim.Error("Error marshalling product structure")
		}
		
		// write to the ledger
		err = stub.PutState(product.Id, productBytes)
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(nil)

	}
	return shim.Error("Invalid shipment Status")
	
}


// Update shipment location; we will only allow SOURCE and DESTINATION as valid locations for this contract
// @param [shipmentId, shipmenntStatus]
func (t *TradeChaincode) updateShipment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var shipmentReceipt ShipmentReceipt
	var shipmentReceiptBytes []byte
	var err error

	// Access control: Only a Carrier Org member can invoke this transaction
	if !t.testMode && !authenticateCarrierOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Caller not a member of Carrier Org. Access denied.")
	}

	if len(args) != 2 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {Trade ID, Location}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	shipmentReceiptBytes, err = stub.GetState(args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(shipmentReceiptBytes) == 0 {
		fmt.Printf("Shipment for trade %s has not been prepared yet", args[0])
		return shim.Error("Shipment not prepared yet")
	}

	// Unmarshal the JSON
	err = json.Unmarshal(shipmentReceiptBytes, &shipmentReceipt)
	if err != nil {
		return shim.Error(err.Error())
	}
	shipmentReceipt.Status = strings.ToUpper(args[1])

	shipmentReceiptBytes, err = json.Marshal(shipmentReceipt)
	if err != nil {
		return shim.Error("Error marshaling shipmentReceipt  structure")	
	}

	// Write the state to the ledger
	err = stub.PutState(args[0], shipmentReceiptBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("Shipment accepted and shipment Receipt issued")

	return shim.Success(nil)
}

func main() {
	twc := new(TradeChaincode)
	twc.testMode = false
	err := shim.Start(twc)
	if err != nil {
		fmt.Printf("Error starting Trade Workflow chaincode: %s", err)
	}
}
