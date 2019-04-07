/* eslint-disable no-undef */
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
 * @param {org.trade.com.ShipProduct} shipProduct - the ShipProduct transaction
 * @transaction
 */
async function shipProduct(shipRequest) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'org.trade.com';

    let letter = shipRequest.loc;

    if (letter.status === 'APPROVED') {
        // add bill of landing
        const billOfLanding = factory.newResource(namespace, 'BillOfLanding',  shipRequest.trackingNumber);
        billOfLanding.sender = letter.beneficiary.userName;
        billOfLanding.receiver = letter.applicant.userName;
        billOfLanding.senderAddress = letter.beneficiary.address;
        billOfLanding.receiverAddress = letter.applicant.address;
        billOfLanding.status = 'SHIPPED';
        billOfLanding.cargo = shipRequest.cargo;

        const billOfLandingReg = await getAssetRegistry('org.trade.com.BillOfLanding');
        await billOfLandingReg.add(billOfLanding);

        letter.billOfLanding = factory.newRelationship(namespace, 'BillOfLanding', shipRequest.trackingNumber);
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

    const letter = receiveRequest.loc;
    const billOfLanding = letter.billOfLanding;

    if (billOfLanding && billOfLanding.status === 'SHIPPED') {
        billOfLanding.status = 'RECEIVED';

        const assetRegistry = await getAssetRegistry(billOfLanding.getFullyQualifiedType());
        await assetRegistry.update(billOfLanding);

        // update the status of letter
        letter.status = 'PRODUCTS_RECEIVED';
        const letterAssetRegistry = await getAssetRegistry(receiveRequest.loc.getFullyQualifiedType());
        await letterAssetRegistry.update(letter);

        // emit event
        const receiveEvent = factory.newEvent(namespace, 'ReceiveProductEvent');
        receiveEvent.loc = receiveRequest.loc;
        emit(receiveEvent);
    } else {
        throw new Error('The cargo has not been shipped');
    }
}
