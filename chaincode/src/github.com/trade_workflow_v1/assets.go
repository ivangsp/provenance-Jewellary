/*
 * Copyright 2018 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package main

import (
	"time"
)

type Product struct {
	ObjectType   string    `json:"docType"` // field for couchdb
	Id           string    `json:"id"`
	Name         string    `json:"name"`
	Timestamp    time.Time `json:"timestamp"`
	Owner        Owner     `json:"owner"`
	Location     string    `json:"location"`
	Price 		 float32 	`json:"price"`
	Description	 string		`json:"description"`	 
}

// ----- Owner ----- //
type Owner struct {
	ObjectType string `json:"docType"` // field for couchdb
	Id         string `json:"id"`
	Username   string `json:"username"`
}

// Trade agreement
type TradeAgreement  struct {
	Product					Product					`json:"product"`
	Timestamp    			time.Time  				`json:"timestamp"`
	Buyer					string					`json:"buyer"`
	Status             		string 					`json:"status"`
	Location 				string					`json:"location"`
	LetterOfCredit    		LetterOfCredit 			`json:"letterOfCredit"`
	Amount 					float32 				`json:"amount"`
	Payment 				float32 				`json:"payment"`
}


type LetterOfCredit struct {
	ExpirationDate string   	`json:"expirationDate"`
	Beneficiary    string   	`json:"beneficiary"`
	Amount         float32      `json:"amount"`
	Status         string   	`json:"status"`
}

type ShipmentReceipt struct {
	Id                 			string		 `json:"id"`
	TradeAgreementId 			string		 `json:"tradeAgreementId"`
	ExpectedDateOfArrival     	string 		 `json:"expirationDate"`
	Exporter           			string 		 `json:"exporter"`
	Carrier            			string		 `json:"carrier"`
	DescriptionOfGoods 			string 		 `json:"descriptionOfGoods"`
	Fee             			float32    	 `json:"amount"`
	Beneficiary        			string 		 `json:"beneficiary"`
	Destination    				string 		 `json:"destinationPort"`
	Status 						string		 `json:"status"`
	
}
