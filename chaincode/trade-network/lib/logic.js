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
 * @param {org.trade.com.CreatePurchaseOrder} createPurchaseOrder - the createPurchaseOrder transaction
 * @transaction
 */
async function createPurchaseOrder(poRequest) {
    const factory = getFactory();
    const namespace = 'org.trade.com';

    const po = factory.newResource(namespace, 'PurchaseOrder', poRequest.id);
    po.buyer = factory.newRelationship(namespace, 'Trader', poRequest.buyer.getIdentifier());
    po.seller = factory.newRelationship(namespace, 'Trader', poRequest.seller.getIdentifier());
    po.total_Amount = poRequest.total_Amount;
    po.status = 'AWAITING_APPROVAL';
    po.products = poRequest.products;
    po.issue_date = new Date();

    //save the po
    const assetRegistry = await getAssetRegistry(po.getFullyQualifiedType());
    await assetRegistry.add(po);

    // emit event
    const poEvent = factory.newEvent(namespace, 'CreatePurchaseOrderEvent');
    poEvent.po = po;
    emit(poEvent);
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
    const employee1 = factory.newResource(namespace, 'BankEmployee', 'B1');
    employee1.username = 'swedEmployee1';
  	employee1.account_number = '900000992928';
    employee1.bank = factory.newRelationship(namespace, 'Bank', 'SWED');
    await employeeRegistry.add(employee1);

    const employee2 = factory.newResource(namespace, 'BankEmployee', 'B2');
    employee2.username = 'EsbEmployee1';
  	employee2.account_number = '900066692928';
    employee2.bank = factory.newRelationship(namespace, 'Bank', 'ESB');
    await employeeRegistry.add(employee2);

    // create customers
    const customerRegistry = await getParticipantRegistry(namespace + '.Trader');
    const customer1 = factory.newResource(namespace, 'Trader', 'T1');
    customer1.username = 'artisan1';
  	customer1.account_number = '908880992928';
    customer1.bank = factory.newRelationship(namespace, 'Bank', 'SWED');
    await customerRegistry.add(customer1);

   	const customer2 = factory.newResource(namespace, 'Trader', 'T2');
    customer2.username = 'artisan2';
  	customer2.account_number = '128880992928';
    customer2.bank = factory.newRelationship(namespace, 'Bank', 'SWED');
    await customerRegistry.add(customer2);

    const customer3 = factory.newResource(namespace, 'Trader', 'T3');
    customer3.username = 'buyer1';
  	customer3.account_number = '000880992928';
    customer3.bank = factory.newRelationship(namespace, 'Bank', 'ESB');
    customer3.companyName = 'soko';
    await customerRegistry.add(customer3);
}
