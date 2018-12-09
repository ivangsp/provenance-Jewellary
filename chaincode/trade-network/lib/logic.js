/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/* global getFactory getAssetRegistry getParticipantRegistry emit */
/**
 * 
 * @param {org.trade.com.InitialTradeRequest} initialTradeRequest
 * @transaction
 */
async function initialTradeRequest(tradeRequest) {
    const factory = getFactory();
    const namespace = 'org.trade.com';

    const tradeAgreement = factory.newResource(namespace, "TradeAgreement", tradeRequest.id);
    tradeAgreement.product = factory.newRelationship(namespace, "Product", tradeRequest.product.getIdentifier());
    tradeAgreement.buyer = factory.newRelationship(namespace, "Trader", tradeRequest.buyer.getIdentifier());
    tradeAgreement.seller = factory.newRelationship(namespace, "Trader", tradeRequest.seller.getIdentifier());
    tradeAgreement.quantity = tradeRequest.quantity;
    tradeAgreement.rules = tradeRequest.rules;
    tradeAgreement.status =  'AWAITING_APPROVAL';

    //save the tradeAgreement
    const assetRegistry = await getAssetRegistry(tradeAgreement.getFullyQualifiedType());
    await assetRegistry.add(tradeAgreement);

    // emit event
    const tradeAgreementEvent = factory.newEvent(namespace, 'InitialTradeRequestEvent');
    tradeAgreementEvent.tradeAgreement = tradeAgreement;
    emit(tradeAgreementEvent);   
}


/**
 * @desc approve or reject tradeAgreement
 * @param {org.trade.com.ApproveTradeRequest} approveTradeRequest
 * @transaction
 */
async function ApproveTradeRequest(trade) {
    const factory = getFactory();
    const namespace = 'org.trade.com';

    const tradeAgreement = trade.tradeAgreement;
    if (tradeAgreement.status !== 'AWAITING_APPROVAL') {
        throw new Error("trade Agreement has been " + tradeAgreement.status);
    }
    try {
        if (trade.approvingPerson.getIdentifier() === tradeAgreement.seller.getIdentifier()) {
            tradeAgreement.status = trade.status;
            if (trade.reason) {
              tradeAgreement.reason = trade.reason;
            }
        }
    } catch (err) {
        // ignore error as they don't have rights to access that participant
        throw new Error('You do not own this product');
    }

    // update tradeAgreement
    const assetRegistry = await getAssetRegistry(trade.tradeAgreement.getFullyQualifiedType());
    await assetRegistry.update(tradeAgreement);

    // emit event
    const approveEvent = factory.newEvent(namespace, 'ApproveTradeRequestEvent');
    approveEvent.tradeAgreement = tradeAgreement;
    if (trade.reason) {
    approveEvent.reason = trade.reason;
    }
    emit(approveEvent);

}


/**
 * Create the letter asset
 * @param {org.trade.com.RequestLetterOfCredit} requestLetterOfCredit - the InitialApplication transaction
 * @transaction
 */
async function requestLetterOfCredit(application) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    if (application.tradeAgreement.status !== "APPROVED") {
        throw new Error('the trde Agreement is not yet confirmed');
    }

    const letter = factory.newResource(namespace, 'LetterOfCredit', application.letterId);
    letter.applicant = factory.newRelationship(namespace, 'Trader', application.applicant.getIdentifier());
    letter.benefitiary = factory.newRelationship(namespace, 'Trader', application.benefitiary.getIdentifier());
    letter.issuingBank = factory.newRelationship(namespace, 'Bank', application.applicant.bank.getIdentifier());
    letter.exportingBank = factory.newRelationship(namespace, 'Bank', application.benefitiary.bank.getIdentifier());
    letter.rules = application.rules;
    letter.tradeAgreement = application.tradeAgreement;
    letter.approval = [factory.newRelationship(namespace, 'Trader', application.applicant.getIdentifier())];
    letter.status = 'AWAITING_APPROVAL';
	letter.evidence = [];

    //save the application
    const assetRegistry = await getAssetRegistry(letter.getFullyQualifiedType());
    await assetRegistry.add(letter);

    // emit event
    const applicationEvent = factory.newEvent(namespace, 'RequestLetterOfCreditEvent');
    applicationEvent.letter = letter;
    emit(applicationEvent);
}

/**
 * Update the letter to show that it has been approved by a given person
 * @param {org.trade.com.ApproveLetterOfCredit} approveLetterOfCredit
 * @transaction
 */
async function approveLetterOfCredit(approveRequest) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    let letter = approveRequest.letter;

    if (letter.status === 'CLOSED' || letter.status === 'REJECTED') {
        throw new Error ('This letter of credit has already been closed');
    } else if (letter.approval.length === 3) {
        throw new Error ('All 3 parties have already approved this letter of credit');
    } else if (letter.approval.includes(approveRequest.approvingParty)) {
        throw new Error ('This person has already approved this letter of credit');
    } else if (approveRequest.approvingParty.getType() === 'BankEmployee') {
        
      	
      	if (approveRequest.approvingParty.bank.getIdentifier() === letter.applicant.bank.getIdentifier()) {
          letter.status = 'APPROVED';
        } 
      // else if (approveRequest.approvingParty.bank.getIdentifier() === letter.benefitiary.bank.getIdentifier() && letter.status == 'APPROVED') {
     //     letter.status = 'ACCEPTED';
      //  }
    }

    letter.approval.push(factory.newRelationship(namespace, approveRequest.approvingParty.getType(), approveRequest.approvingParty.getIdentifier()));
    // update the status of the letter if everyone has approved
     if (letter.approval.length === 3) {
         letter.status = 'ACCEPTED';
   }

    // update approval[]
    const assetRegistry = await getAssetRegistry(approveRequest.letter.getFullyQualifiedType());
    await assetRegistry.update(letter);

    // emit event
    const approveEvent = factory.newEvent(namespace, 'ApproveLetterOfCreditEvent');
    approveEvent.letter = approveRequest.letter;
    approveEvent.approvingParty = approveRequest.approvingParty;
    emit(approveEvent);
}

/**
 * Reject the letter
 * @param {org.trade.com.RejectLetterOfCredit} rejectLetterOfCredit - the Reject transaction
 * @transaction
 */
async function rejectLetterOfCredit(rejectRequest) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    let letter = rejectRequest.letter;

    if (letter.status === 'CLOSED' || letter.status === 'REJECTED') {
        throw new Error('This letter of credit has already been closed');
    } else if (letter.status === 'APPROVED') {
        throw new Error('This letter of credit has already been approved');
    } else {
        letter.status = 'REJECTED';
        letter.closeReason = rejectRequest.closeReason;

        // update the status of the letter
        const assetRegistry = await getAssetRegistry(rejectRequest.letter.getFullyQualifiedType());
        await assetRegistry.update(letter);

        // emit event
        const rejectEvent = factory.newEvent(namespace, 'RejectLetterOfCreditEvent');
        rejectEvent.letter = rejectRequest.letter;
        rejectEvent.closeReason = rejectRequest.closeReason;
        emit(rejectEvent);
    }
}

// /**
//  * Suggest changes to the current rules in the letter
//  * @param {org.trade.com.SuggestChanges} suggestChanges - the SuggestChanges transaction
//  * @transaction
//  */
// async function suggestChanges(changeRequest) { // eslint-disable-line no-unused-vars
//     const factory = getFactory();
//     const namespace = 'org.trade.com';

//     let letter = changeRequest.letter;

//     if (letter.status === 'CLOSED' || letter.status === 'REJECTED') {
//         throw new Error ('This letter of credit has already been closed');
//     } else if (letter.status === 'APPROVED') {
//         throw new Error('This letter of credit has already been approved');
//     } else if (letter.status === 'SHIPPED' || letter.status === 'RECEIVED' || letter.status === 'READY_FOR_PAYMENT') {
//         throw new Error ('The product has already been shipped');
//     } else {
//         letter.rules = changeRequest.rules;
//         // the rules have been changed - clear the approval array and update status
//         letter.approval = [changeRequest.suggestingParty];
//         letter.status = 'AWAITING_APPROVAL';

//         // update the letter with the new rules
//         const assetRegistry = await getAssetRegistry(changeRequest.letter.getFullyQualifiedType());
//         await assetRegistry.update(letter);

//         // emit event
//         const changeEvent = factory.newEvent(namespace, 'SuggestChangesEvent');
//         changeEvent.letter = changeRequest.letter;
//         changeEvent.rules = changeRequest.rules;
//         changeEvent.suggestingParty = changeRequest.suggestingParty;
//         emit(changeEvent);
//     }
// }

/**
 * "Ship" the product
 * @param {org.trade.com.ShipProduct} shipProduct - the ShipProduct transaction
 * @transaction
 */
async function shipProduct(shipRequest) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    let letter = shipRequest.letter;

    if (letter.status === 'ACCEPTED') {
        letter.status = 'SHIPPED';
        letter.evidence.push(shipRequest.evidence);

        //update the status of the letter
        const assetRegistry = await getAssetRegistry(shipRequest.letter.getFullyQualifiedType());
        await assetRegistry.update(letter);

        // emit event
        const shipEvent = factory.newEvent(namespace, 'ShipProductEvent');
        shipEvent.letter = shipRequest.letter;
        emit(shipEvent);
    } else if (letter.status === 'AWAITING_APPROVAL') {
        throw new Error ('This letter needs to be fully approved before the product can be shipped');
    } else if (letter.status === 'CLOSED' || letter.status === 'REJECTED') {
        throw new Error ('This letter of credit has already been closed');
    } else {
        throw new Error ('The product has already been shipped');
    }
}

/**
 * "Recieve" the product that has been "shipped"
 * @param {org.trade.com.ReceiveProduct} receiveProduct - the ReceiveProduct transaction
 * @transaction
 */
async function receiveProduct(receiveRequest) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    let letter = receiveRequest.letter;

    if (letter.status === 'SHIPPED') {
        letter.status = 'RECEIVED';

        // update the status of the letter
        const assetRegistry = await getAssetRegistry(receiveRequest.letter.getFullyQualifiedType());
        await assetRegistry.update(letter);

        // emit event
        const receiveEvent = factory.newEvent(namespace, 'ReceiveProductEvent');
        receiveEvent.letter = receiveRequest.letter;
        emit(receiveEvent);
    } else if (letter.status === 'AWAITING_APPROVAL' || letter.status === 'APPROVED'){
        throw new Error('The product needs to be shipped before it can be received');
    } else if (letter.status === 'CLOSED' || letter.status === 'REJECTED') {
        throw new Error ('This letter of credit has already been closed');
    } else {
        throw new Error('The product has already been received');
    }
}


/**
 * Mark a given letter as "ready for payment"
 * @param {org.trade.com.MakePayment} makePayment - the ReadyForPayment transaction
 * @transaction
 */
async function makePayment(paymentRequest) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    let letter = paymentRequest.letter;

    if (letter.status === 'RECEIVED') {
        letter.status = 'PAYMENT_MADE';

        // update the status of the letter
        const assetRegistry = await getAssetRegistry(paymentRequest.letter.getFullyQualifiedType());
        await assetRegistry.update(letter);

        // emit event
        const paymentEvent = factory.newEvent(namespace, 'MakePaymentEvent');
        paymentEvent.letter = paymentRequest.letter;
        emit(paymentEvent);
    } else if (letter.status === 'CLOSED' || letter.status === 'REJECTED') {
        throw new Error('This letter of credit has already been closed');
    } else if (letter.status === 'PAYMENT_MADE') {
        throw new Error('The payment has already been made');
    } else {
        throw new Error('The payment cannot be made until the product has been received by the applicant');
    }
} 

/**
 * Mark a given letter as "ready for payment"
 * @param {org.trade.com.PaymentReceived} paymentReceived - the ReadyForPayment transaction
 * @transaction
 */
async function paymentReceived(paymentRequest) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    let letter = paymentRequest.letter;

    if (letter.status === 'PAYMENT_MADE') {
        letter.status = 'PAID';

        let product = letter.tradeAgreement.product;
        product.owner = factory.newRelationship(namespace, 'Trader', letter.applicant.getIdentifier()); ;
        const prodRegistry =  await getAssetRegistry(product.getFullyQualifiedType());
        await prodRegistry.update(product);

        // update the status of the letter
        const assetRegistry = await getAssetRegistry(paymentRequest.letter.getFullyQualifiedType());
        await assetRegistry.update(letter);

        // emit event
        const paymentEvent = factory.newEvent(namespace, 'PaymentReceivedEvent');
        paymentEvent.letter = paymentRequest.letter;
        emit(paymentEvent);
    } else if (letter.status === 'PAID' || letter.status === 'REJECTED') {
        throw new Error('This letter of credit has already been paid');
    } else if (letter.status === 'READY_FOR_PAYMENT') {
        throw new Error('The payment has already been made');
    } else {
        throw new Error('The payment cannot be made until the product has been received by the applicant');
    }
} 


/**
 * Create the participants needed for the demo
 * @param {org.trade.com.CreateDemoParticipants} createDemoParticipants - the CreateDemoParticipants transaction
 * @transaction
 */
async function createDemoParticipants() { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    // create banks
    const bankRegistry = await getParticipantRegistry(namespace + '.Bank');
    const bank1 = factory.newResource(namespace, 'Bank', 'SWED');
    bank1.name = 'Swed Bank';
    await bankRegistry.add(bank1);
    const bank2 = factory.newResource(namespace, 'Bank', 'ESB');
    bank2.name = 'ESB Bank';
    await bankRegistry.add(bank2);

    // create bank employees
    const employeeRegistry = await getParticipantRegistry(namespace + '.BankEmployee');
    const employee1 = factory.newResource(namespace, 'BankEmployee', '1');
    employee1.name = 'swedEmployee1';
    employee1.bank = factory.newRelationship(namespace, 'Bank', 'SWED');
    await employeeRegistry.add(employee1);
    const employee2 = factory.newResource(namespace, 'BankEmployee', '2');
    employee2.name = 'EsbEmployee1';
    employee2.bank = factory.newRelationship(namespace, 'Bank', 'ESB');
    await employeeRegistry.add(employee2);

    // create customers
    const customerRegistry = await getParticipantRegistry(namespace + '.Trader');
    const customer1 = factory.newResource(namespace, 'Trader', '1');
    customer1.name = 'seller';
    customer1.lastName= 'artisan';
    customer1.bank = factory.newRelationship(namespace, 'Bank', 'SWED');
  	customer1.category = 'ARTISAN';
    await customerRegistry.add(customer1);
  
    const customer2 = factory.newResource(namespace, 'Trader', '2');
    customer2.name = 'buyer';
    customer2.lastName= 'peter';
    customer2.bank = factory.newRelationship(namespace, 'Bank', 'ESB');
    customer2.companyName = 'Conga Computers';
  	customer2.category = 'TRADER';
    await customerRegistry.add(customer2);
}