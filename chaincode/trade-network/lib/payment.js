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
 *
 * @param {org.trade.com.IssueCheque} request - the issueCheque transaction
 * @transaction
 */
async function issueCheque (request) {
    const namespace = 'org.trade.com';
    const factory = getFactory();


    const id = new Date().getTime().toString();
    const cheque = factory.newResource(namespace, 'Cheque', id);
  	cheque.benficiary = request.invoice.seller.userName;
  	cheque.from = request.invoice.buyer.userName;
  	cheque.amount = request.invoice.totalAmount;
  	cheque.accountNumber = request.invoice.seller.accountNumber;
  	cheque.invoice = factory.newRelationship(namespace, 'Invoice', request.invoice.id);
    cheque.bank = factory.newRelationship(namespace, 'Bank', request.bank.name);
  	cheque.status = 'UNPAID';


    //save the cheque
    const chequeRegistry = await getAssetRegistry(cheque.getFullyQualifiedType());
    await chequeRegistry.add(cheque);

  	 // emit event
    const event = factory.newEvent(namespace, 'ChequeEvent');
    event.cheque = cheque;
    emit(event);
}


/**
 *
 * @param {org.trade.com.MakePayment} request - the makePayment transaction
 * @transaction
 */
async function makePayment (request) {
    const namespace = 'org.trade.com';
    const factory = getFactory();

    const cheque = request.cheque;
    if (cheque.status === 'CANCELLED') {
        // eslint-disable-next-line no-throw-literal
        throw 'The cheque was cancelled';
    }
    else if (cheque === 'PAID') {
        // eslint-disable-next-line no-throw-literal
        throw 'The cheque was already paid';
    }

    const lineItems = request.cheque.invoice.invoiceLineItem;
    const prodRegistry = await getAssetRegistry('org.trade.com.Product');

    const promise = lineItems.map(item => {
        const product = prodRegistry.get(item.serial_number);
        return product;

    });
    // eslint-disable-next-line no-undef
    const products = await Promise.all(promise);

    products.map(prod =>{
        prod.owner = request.cheque.invoice.buyer;
    });

    cheque.status = 'PAID';
    const chequeReg = await getAssetRegistry('org.trade.com.Cheque');
    chequeReg.update(cheque);
    await prodRegistry.updateAll(products);

    // emit event
    const event = factory.newEvent(namespace, 'ChequeEvent');
    event.cheque = cheque;
    emit(event);

}