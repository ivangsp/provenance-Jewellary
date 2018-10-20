package main
import(
    "encoding/json"
    "github.com/hyperledger/fabric/core/chaincode/shim"
    "errors"
    "math/rand"
    "strconv"
)

// ============================================================================================================================
// Get Asset from the asset from the ledger
// ============================================================================================================================
func getProductById(stub shim.ChaincodeStubInterface, id string) (Product, error) {
	var product Product
	productBytes, err := stub.GetState(id)                  //getState retreives a key/value from the ledger
	if err != nil {                                          //this seems to always succeed, even if key didn't exist
		return product, errors.New("Failed to find product - " + id)
	}
	json.Unmarshal(productBytes, &product)                   //un stringify it aka JSON.parse()

    // test if product is actually here or just nil
	if product.Id != id {
		return product, errors.New("Marble does not exist - " + id)
	}

	return product, nil
}

// =====================================================================================================
// generate a random numeber as id
//=======================================================================================
func generate_id (stub shim.ChaincodeStubInterface) (string) {

	var id = rand.Intn(1000000)
	_, err := getProductById(stub, strconv.Itoa(id));
	if (err == nil) {
        id = rand.Intn(1000000)
        generate_id (stub)
    }
    return strconv.Itoa(id)
}