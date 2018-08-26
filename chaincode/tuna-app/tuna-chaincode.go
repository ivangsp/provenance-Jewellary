// SPDX-License-Identifier: Apache-2.0

/*
  Sample Chaincode based on Demonstrated Scenario

 This code is based on code written by the Hyperledger Fabric community.
  Original code can be found here: https://github.com/hyperledger/fabric-samples/blob/release/chaincode/fabcar/fabcar.go
*/

package main

/* Imports
* 4 utility libraries for handling bytes, reading and writing JSON,
formatting, and string manipulation
* 2 specific Hyperledger Fabric specific libraries for Smart Contracts
*/
import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define the Smart Contract structure
type SmartContract struct {
}

/* Define Tuna structure, with 4 properties.
Structure tags are used by encoding/json library
*/
type Product struct {
	ObjectType string        `json:"docType"` // field for couchdb
	ID         string        `json:"id"`
	Name       string        `json:"name"`
	Timestamp  time.Time        `json:"timestamp"`
	Owner      OwnerRelation `json:"owner"`
}

// ----- Owner ----- //
type Owner struct {
	ObjectType string `json:"docType"` // field for couchdb
	ID         string `json:"id"`
	Username   string `json:"username"`
	Company    string `json:"company"`
}

// "OwnerRelation..."
type OwnerRelation struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Company  string `json:"company"`
}

/*
 * The Init method *
 called when the Smart Contract "tuna-chaincode" is instantiated by the network
 * Best practice is to have any Ledger initialization in separate function
 -- see initLedger()
*/
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

/*
 * The Invoke method *
 called when an application requests to run the Smart Contract "tuna-chaincode"
 The app also specifies the specific smart contract function to call with args
*/
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {
	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger
	if function == "queryProduct" {
		return s.queryProduct(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "recordProduct" {
		return s.recordProduct(APIstub, args)
	} else if function == "queryAllProducts" {
		return s.queryAllProducts(APIstub)
	} else if function == "changeProductHolder" {
		return s.changeProductHolder(APIstub, args)
	} else if function == "getHistory" {
		return s.getHistory(APIstub, args);
	}

	return shim.Error(function)
}


// ============================================================================================================================
// Get Marble - get a marble asset from ledger
// ============================================================================================================================
func get_product(APIstub shim.ChaincodeStubInterface, id string) (Product, error) {
	var prod Product
	prodBytes, err := APIstub.GetState(id) //getState retreives a key/value from the ledger
	if err != nil {                        //this seems to always succeed, even if key didn't exist
		return prod, errors.New("Failed to find Product - " + id)
	}
	json.Unmarshal(prodBytes, &prod) //un stringify it aka JSON.parse()

	if prod.ID != id { //test if marble is actually here or just nil
		return prod, errors.New("product does not exist - " + id)
	}

	return prod, nil
}

/*
 * The queryTuna method *
Used to view the records of one particular tuna
It takes one argument -- the key for the tuna in question
*/
func (s *SmartContract) queryProduct(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	tunaAsBytes, _ := APIstub.GetState(args[0])
	if tunaAsBytes == nil {
		return shim.Error("Could not locate tuna")
	}
	return shim.Success(tunaAsBytes)
}

/*
 * The initLedger method *
Will add test data (10 tuna catches)to our network
*/
func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	tuna := []Product{
		Product{ID: "1", Timestamp: time.Now(), Name: "gold ornament", ObjectType: "product",
			Owner: OwnerRelation{ID: "1", Username: "ivan", Company: "A"},
		},
		Product{ID: "2", Timestamp: time.Now(), Name: "silver ornament", ObjectType: "product",
			Owner: OwnerRelation{ID: "2", Username: "james", Company: "B"},
		},
	}

	i := 0
	for i < len(tuna) {
		fmt.Println("i is ", i)
		tunaAsBytes, _ := json.Marshal(tuna[i])
		APIstub.PutState(strconv.Itoa(i+1), tunaAsBytes)
		fmt.Println("Added", tuna[i])
		i = i + 1
	}

	return shim.Success(nil)
}

/*
 * The recordTuna method *
Fisherman like Sarah would use to record each of her tuna catches.
This method takes in five arguments (attributes to be saved in the ledger).
*/
func (s *SmartContract) recordProduct(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 6 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	//check if marble id already exists
	prod, err := get_product(APIstub, args[0])
	if err == nil {
		fmt.Println("This product already exists - " )
		fmt.Println(prod)
		return shim.Error("This product already exists - ") //all stop a marble by this id exists
	}

	var tuna = Product{ID: args[0], Timestamp: time.Now(), Name: args[2], ObjectType: "product",
		Owner: OwnerRelation{ID: args[3], Username: args[4], Company: args[5]}}

	tunaAsBytes, _ := json.Marshal(tuna)
	err = APIstub.PutState(args[0], tunaAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to record : %s", args[2]))
	}

	return shim.Success(nil)
}

/*
 * The queryAllTuna method *
allows for assessing all the records added to the ledger(all tuna catches)
This method does not take any arguments. Returns JSON string containing results.
*/
func (s *SmartContract) queryAllProducts(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "0"
	endKey := "999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add comma before array members,suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllTuna:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

/*
 * The changeTunaHolder method *
The data in the world state can be updated with who has possession.
This function takes in 2 arguments, tuna id and new holder name.
*/
func (s *SmartContract) changeProductHolder(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 6 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	tunaAsBytes, _ := APIstub.GetState(args[0])
	if tunaAsBytes == nil {
		return shim.Error("Could not locate tuna")
	}
	prod := Product{}

	json.Unmarshal(tunaAsBytes, &prod)

	// check the credentials of the owner to asertain if is the true owner
	// prevOwner, err := get_owner(APIstub, owner_id)
	prevOwner := prod.Owner
	if (prevOwner.ID != args[1] && prevOwner.Username != args[2]) {
		return shim.Error("Invalid User, could not confirm the owner")
	}
	var newOwner OwnerRelation
	newOwner.ID = args[3]
	newOwner.Username = args[4]
	newOwner.Company = args[5]


	prod.Owner = newOwner
	prod.Timestamp = time.Now()

	tunaAsBytes, _ = json.Marshal(prod)
	err := APIstub.PutState(args[0], tunaAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to change tuna holder: %s", args[0]))
	}

	return shim.Success(nil)
}

/* get the all the blocks of a transaction

*/
func (s *SmartContract) getHistory(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	type AuditHistory struct {
		TxId    string   `json:"txId"`
		Value   Product   `json:"value"`
	}
	var history []AuditHistory;
	var prod Product

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	prodID := args[0]
	// Get History 
	resultsIterator, err := stub.GetHistoryForKey(prodID)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	for resultsIterator.HasNext() {
		historyData, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		var tx AuditHistory
		tx.TxId = historyData.TxId                     //copy transaction id over
		json.Unmarshal(historyData.Value, &prod)     //un stringify it aka JSON.parse()
		if historyData.Value == nil {                  //marble has been deleted
			var emptyProd Product
			tx.Value = emptyProd                 //copy nil marble
		} else {
			json.Unmarshal(historyData.Value, &prod) //un stringify it aka JSON.parse()
			tx.Value = prod                      //copy marble over
		}
		history = append(history, tx)              //add this tx to the list
	}
	fmt.Printf("- getHistoryForMarble returning:\n%s", history)

	//change to array of bytes
	historyAsBytes, _ := json.Marshal(history)     //convert to array of bytes
	return shim.Success(historyAsBytes)
}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
