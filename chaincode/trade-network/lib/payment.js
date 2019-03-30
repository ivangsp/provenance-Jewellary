/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
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

/* global getFactory getAssetRegistry getParticipantRegistry emit query */


/**
 * Create the LOC asset
 * @param {org.trade.com.RequestLetterOfCredit} requestLetterOfCredit - the RequestLetterOfCredit transaction
 * @transaction
 */
async function requestLetterOfCredit(application) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    // if (application.purchaseOrder.status !== "APPROVED" {
    //   throw new Error "purchase order has not been approved yet"
    // }

    const letter = factory.newResource(namespace, 'LetterOfCredit', application.id);
    letter.applicant = factory.newRelationship(namespace, 'Trader', application.applicant.getIdentifier());
    letter.beneficiary = factory.newRelationship(namespace, 'Artisan', application.beneficiary.getIdentifier());
    letter.issuingBank = factory.newRelationship(namespace, 'Bank', application.applicant.bank.getIdentifier());
    letter.exportingBank = factory.newRelationship(namespace, 'Bank', application.beneficiary.bank.getIdentifier());
    letter.rules = application.rules;
    letter.purchaseOrder = factory.newRelationship(namespace, 'PurchaseOrder', application.purchaseOrder.getIdentifier());
    letter.approval = [factory.newRelationship(namespace, 'Trader', application.applicant.getIdentifier())];
    letter.status = 'AWAITING_APPROVAL';

    const assetRegistry = await getAssetRegistry(letter.getFullyQualifiedType());
    await assetRegistry.add(letter);

    // emit event
    const applicationEvent = factory.newEvent(namespace, 'RequestLetterOfCreditEvent');
    applicationEvent.loc = letter;
    emit(applicationEvent);
}

/**
 * @param {org.trade.com.ApproveLetterOfCredit} approveLetterOfCredit - the ApproveLetterOfCredit transaction
 * @transaction
 */
async function approveLetterOfCredit(approveRequest) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    let letter = approveRequest.loc;

    if (letter.status === 'CLOSED' || letter.status === 'REJECTED') {
        throw new Error ('This letter of credit has already been closed');
    } else if (letter.approval.length === 4) {
        throw new Error ('All four parties have already approved this letter of credit');
    } else if (letter.approval.includes(approveRequest.approvingParty)) {
        throw new Error ('This person has already approved this letter of credit');
    } else if (approveRequest.approvingParty.getType() === 'BankEmployee') {
        letter.approval.forEach((approvingParty) => {
            let bankApproved = false;
            try {
                bankApproved = approvingParty.getType() === 'BankEmployee' && approvingParty.bank.getIdentifier() === 		           approveRequest.approvingParty.bank.getIdentifier();
            } catch (err) {
                // ignore error as they don't have rights to access that participant
            }
            if (bankApproved) {
                throw new Error('Your bank has already approved of this request');
            }
        });
    }

    letter.approval.push(factory.newRelationship(namespace, approveRequest.approvingParty.getType(), approveRequest.approvingParty.getIdentifier()));
    // update the status of the letter if everyone has approved
    if (letter.approval.length === 4) {
        letter.status = 'APPROVED';
    }

    const assetRegistry = await getAssetRegistry(approveRequest.loc.getFullyQualifiedType());
    await assetRegistry.update(letter);

    // emit event
    const approveEvent = factory.newEvent(namespace, 'ApproveLetterOfCreditEvent');
    approveEvent.loc = approveRequest.loc;
    approveEvent.approvingParty = approveRequest.approvingParty;
    emit(approveEvent);
}


/**
 * @param {org.trade.com.RejectLetterOfCredit} rejectLetterOfCredit - the RejectLetterOfCredit transaction
 * @transaction
 */
async function rejectLetterOfCredit(rejectRequest) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    let letter = rejectRequest.loc;

    if (letter.status === 'CLOSED' || letter.status === 'REJECTED') {
        throw new Error('This letter of credit has already been closed');
    } else if (letter.status === 'APPROVED') {
        throw new Error('This letter of credit has already been approved');
    } else {
        letter.status = 'REJECTED';
        letter.closeReason = rejectRequest.closeReason;

        // update the status of the LOC
        const assetRegistry = await getAssetRegistry(rejectRequest.loc.getFullyQualifiedType());
        await assetRegistry.update(letter);

        // emit event
        const rejectEvent = factory.newEvent(namespace, 'RejectEvent');
        rejectEvent.loc = rejectRequest.loc;
        rejectEvent.closeReason = rejectRequest.closeReason;
        emit(rejectEvent);
    }
}


/**
 * @param {org.trade.com.ShipProduct} shipProduct - the ShipProduct transaction
 * @transaction
 */
async function shipProduct(shipRequest) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    let letter = shipRequest.loc;

    if (letter.status === 'APPROVED') {
        letter.status = 'PRODUCTS_SHIPPED';
      	letter.evidence ?  letter.evidence.push(shipRequest.evidence) :  letter.evidence = [shipRequest.evidence];
        letter.evidence.push(shipRequest.evidence);

        //update the status of the loc
        const assetRegistry = await getAssetRegistry(shipRequest.loc.getFullyQualifiedType());
        await assetRegistry.update(letter);

        // emit event
        const shipEvent = factory.newEvent(namespace, 'ShipProductEvent');
        shipEvent.loc = shipRequest.loc;
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
 * @param {org.trade.com.ReceiveProduct} receiveProduct - the ReceiveProduct transaction
 * @transaction
 */
async function receiveProduct(receiveRequest) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    let letter = receiveRequest.loc;

    if (letter.status === 'PRODUCTS_SHIPPED') {
        letter.status = 'PRODUCTS_RECEIVED';
        letter.evidence.push(receiveRequest.evidence);


        // update the status of the loc
        const assetRegistry = await getAssetRegistry(receiveRequest.loc.getFullyQualifiedType());
        await assetRegistry.update(letter);

        // emit event
        const receiveEvent = factory.newEvent(namespace, 'ReceiveProductEvent');
        receiveEvent.loc = receiveRequest.loc;
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
 * Mark a given letter as "paid"
 * @param {org.trade.com.MakePayment} makePayment - the MakePayment transaction
 * @transaction
 */
async function makePayment(paymentRequest) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    let letter = paymentRequest.loc;
    let status =
        paymentRequest.bankEmployee.bank.getIdentifier() === letter.issuingBank.getIdentifier()
    	? 'READY_FOR_PAYMENT'
    	: 'PAID';



    if (letter.status === 'PRODUCTS_RECEIVED' || letter.status === 'READY_FOR_PAYMENT') {
        letter.status = status;

        // update the status of the loc
        const assetRegistry = await getAssetRegistry(paymentRequest.loc.getFullyQualifiedType());
        await assetRegistry.update(letter);

        // emit event
        const paymentEvent = factory.newEvent(namespace, 'MakePaymentEvent');
        paymentEvent.loc = paymentRequest.loc;
        emit(paymentEvent);
    } else if (letter.status === 'CLOSED' || letter.status === 'REJECTED') {
        throw new Error('This letter of credit has already been closed');
    } else if (letter.status === 'PAID') {
        throw new Error('The payment has already been made');
    } else {
        throw new Error('The payment cannot be made until the product has been received by the applicant');
    }
}

/**
 * @param {org.trade.com.AcknowledgePayment} acknowledgePayment - the AcknowledgePayment transaction
 * @transaction
 */
async function acknowledgePayment(request) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    let letter = request.loc;
    if (letter.status === 'PAID') {
        letter.status = 'PAYMENT_CONFIRMED';

        // update the status of the loc
        const assetRegistry = await getAssetRegistry(request.loc.getFullyQualifiedType());
        await assetRegistry.update(letter);

        // emit event
        const acknwledgeEvent = factory.newEvent(namespace, 'AcknowledgePaymentEvent');
        acknwledgeEvent.loc = letter;
        emit(acknwledgeEvent);

    } else if (letter.status === 'CLOSED' || letter.status === 'REJECTED') {
        throw new Error('This letter of credit has already been closed');
    } else {
        throw new Error('The payment cannot be made until the product has been received by the applicant');
    }
}

/**
 * Mark a given letter as "closed" and transfer the handcraft
 * @param {org.trade.com.TransferHandcraft} transferHandcraft - the transferHandcraft transaction
 * @transaction
 */
async function transferHandcraft(transferRequest) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    let letter = transferRequest.loc;
  	const invoice = transferRequest.invoice;

    if (letter.status === 'PAYMENT_CONFIRMED') {
        letter.status = 'CLOSED';

      	const lineItems = invoice.invoiceLineItem;
    	const prodRegistry = await getAssetRegistry('org.trade.com.Product');

        const promises = lineItems.map(async item => {
            const product = await prodRegistry.get(item.serial_number);
            return product;

        });

        // eslint-disable-next-line no-undef
        const products = await Promise.all(promises);
        products.map(prod =>{
            prod.owner = letter.applicant;
        });

        await prodRegistry.updateAll(products);


        // update the status of the loc
        const assetRegistry = await getAssetRegistry(transferRequest.loc.getFullyQualifiedType());
        await assetRegistry.update(letter);

        // emit event
        const transferEvent = factory.newEvent(namespace, 'TransferHandcraftEvent');
        transferEvent.loc = letter;
      	transferEvent.transactionIds = lineItems.map(item => item.serial_number);
        emit(transferEvent);

    } else if (letter.status === 'CLOSED' || letter.status === 'REJECTED') {
        throw new Error('This letter of credit has already been closed');
    } else if (letter.status === 'PAID') {
        throw new Error('The payment has already been made');
    } else {
        throw new Error('The payment cannot be made until the product has been received by the applicant');
    }
}

/**
//  *
//  * @param {org.trade.com.IssueCheque} request - the issueCheque transaction
//  * @transaction
//  */
// async function issueCheque (request) {
//     const namespace = 'org.trade.com';
//     const factory = getFactory();


//     // const id = new Date().getTime().toString();
//     const cheque = factory.newResource(namespace, 'Cheque', request.chequeId);
//   	cheque.benficiary = request.invoice.seller.userName;
//   	cheque.from = request.invoice.buyer.userName;
//   	cheque.amount = request.invoice.totalAmount;
//   	cheque.accountNumber = request.invoice.seller.accountNumber;
//   	cheque.invoice = factory.newRelationship(namespace, 'Invoice', request.invoice.id);
//     cheque.bank = factory.newRelationship(namespace, 'Bank', request.bank.name);
//   	cheque.status = 'UNPAID';


//     //save the cheque
//     const chequeRegistry = await getAssetRegistry(cheque.getFullyQualifiedType());
//     await chequeRegistry.add(cheque);

//   	 // emit event
//     const event = factory.newEvent(namespace, 'ChequeEvent');
//     event.cheque = cheque;
//     emit(event);
// }

/**
//  *
//  * @param {org.trade.com.MakePayment} request - the makePayment transaction
//  * @transaction
//  */
// async function makePayment (request) {
//     const namespace = 'org.trade.com';
//     const factory = getFactory();

//     const cheque = request.cheque;
//     if (cheque.status === 'CANCELLED') {
//         // eslint-disable-next-line no-throw-literal
//         throw 'The cheque was cancelled';
//     }
//     else if (cheque === 'PAID') {
//         // eslint-disable-next-line no-throw-literal
//         throw 'The cheque was already paid';
//     }

//     const lineItems = request.cheque.invoice.invoiceLineItem;
//     const prodRegistry = await getAssetRegistry('org.trade.com.Product');

//     const promises = lineItems.map(async item => {
//         const product = await prodRegistry.get(item.serial_number);
//         return product;

//     });
//     // eslint-disable-next-line no-undef
//     const products = await Promise.all(promises);

//     products.map(prod =>{
//         prod.owner = request.cheque.invoice.buyer;
//     });
//     cheque.status = 'PAID';
//     const chequeReg = await getAssetRegistry('org.trade.com.Cheque');
//     await chequeReg.update(cheque);
//     console.log('products', products);
//     await prodRegistry.updateAll(products);

//     // emit event
//     const event = factory.newEvent(namespace, 'ChequeEvent');
//     event.cheque = cheque;
//     emit(event);

// }
