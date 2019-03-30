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
 *
 * @param {org.trade.com.CreateProduct} transaction - the createProduct transaction
 * @transaction
 */
async function createProduct(transaction) {
    const namespace = 'org.trade.com';
    const factory = getFactory();

    const prodRegistry = await getAssetRegistry('org.trade.com.Product');
    const product = factory.newResource(namespace, 'Product',  transaction.serial_number);

    product.name = transaction.name;
    product.image = transaction.image;
    product.price = transaction.price;
    product.location = transaction.location;

  	const artisans = [];
  	transaction.artisanIds.forEach(artisanId => {
    	artisans.push(factory.newRelationship(namespace, 'Artisan', transaction.artisanIds));
    });
  	product.artisans = artisans;
    product.owner = factory.newRelationship(namespace, 'Artisan', transaction.ownerId);
    product.design = factory.newRelationship(namespace, 'ProductDesign', transaction.designId);

    await prodRegistry.add(product);
    // emit event
    const productInfo = factory.newEvent(namespace, 'ProductEvent');
    productInfo.transactionIds = [transaction.serial_number];
    productInfo.product = product;
    emit(productInfo);

}

/**
 *
 * @param {org.trade.com.AddQualityCertificate} request - the addQualityCertificate transaction
 * @transaction
 */
async function addQualityCertificate(request) {
    const namespace = 'org.trade.com';

    const factory = getFactory();

    try {
        const product = await query('searchProductBySerialNumber', { productId: request.productId });
        if (product.length === 0) {
            // eslint-disable-next-line no-throw-literal
            throw 'No product with serial number ' + request.productId + ' found';
        }

        const certificate = factory.newConcept(namespace, 'QualityCertificate');
        certificate.issuedBy = factory.newRelationship(namespace, 'QualityAnalyst', request.userId);
        certificate.status = request.status;

        product[0].qualityCertificate = certificate;
        const assetRegistry = await getAssetRegistry(product[0].getFullyQualifiedType());
        await assetRegistry.update(product[0]);

        // emit event
        const productInfo = factory.newEvent(namespace, 'ProductEvent');
        productInfo.product = product[0];
        productInfo.transactionIds = [product[0].serial_number];
        emit(productInfo);


    }
    catch (e) {
        console.warn('Oooops Error occured ', e);
    }
}

/**
 *
 * @param {org.trade.com.AddValueAddition} request - the addValueAddition transaction
 * @transaction
 */
async function addValueAddition(request) {
    const namespace = 'org.trade.com';
    const factory = getFactory();
    let activities = [];

    const assetRegistry = await getAssetRegistry('org.trade.com.Product');
    const product = await assetRegistry.get(request.productId);

    if (!product) {
    // eslint-disable-next-line no-throw-literal
        throw 'The selected product does not exists';
    }

  	if (product.valueAdditionActivities) {
        activities = product.valueAdditionActivities;
    }

    const addValueAddition = factory.newConcept(namespace, 'ValueAdditionActivity');
    addValueAddition.activityName = request.activityName;
    addValueAddition.performedBy = request.performedBy;

    activities.push(addValueAddition);
    product.valueAdditionActivities = activities;
    await assetRegistry.update(product);

    // emit event
    const productInfo = factory.newEvent(namespace, 'ProductEvent');
    productInfo.product = product;
    productInfo.transactionIds = [product.serial_number];
    emit(productInfo);

}

/**
 *
 * @param {org.trade.com.SearchProductHistory} request - the searchProductHistory transaction
 * @transaction
 */
async function searchProductHistory(request){
	 const namespace = 'org.trade.com';
    const factory = getFactory();

  	const productHistory = await query('searchProductHistory');
  	const hasProductEvent = (events, productId) => {
        const event = events.find(e => e.transactionIds.includes(productId));
        if (event){
            return true;
        }
        return false;
    };

    const artisanRegistry =  await getParticipantRegistry('org.trade.com.Artisan');
    const qaRegistry =  await getParticipantRegistry('org.trade.com.QualityAnalyst');
    const bankEmployeeRegistry =  await getParticipantRegistry('org.trade.com.BankEmployee');

    let participantRegistry;
    const transactionHistory = productHistory.filter(hist => {
  	return hasProductEvent(hist.eventsEmitted, request.serial_number);
    }).map(async his => {
  	const history = {};
        history.transactionTimestamp = his.transactionTimestamp;
        history.transaction = his.transactionType.split('org.trade.com.')[1];
        history.product = his.eventsEmitted[0].product;
        history.transactionId = his.transactionId;

        if (his.participantInvoking.$type === 'Artisan'){
    	participantRegistry = artisanRegistry;
        }
        if (his.participantInvoking.$type === 'QualityAnalyst'){
    	participantRegistry = qaRegistry;
        }
        if (his.participantInvoking.$type === 'BankEmployee'){
    	participantRegistry = bankEmployeeRegistry;
        }

        history.participantInvoking = await participantRegistry.get(his.participantInvoking.$identifier);

        return history;

    });

    const history = await Promise.all(transactionHistory);
    history.sort((a, b) => new Date (b.transactionTimestamp) - new Date (a.transactionTimestamp));

    const transactionHistories = [];
    history.map(hist => {
        const transactionHistory = factory.newConcept(namespace, 'TransactionHistory');
        transactionHistory.transactionId = hist.transactionId;
        transactionHistory.product = hist.product;
        transactionHistory.personInvoking = hist.participantInvoking;
        transactionHistory.transaction = hist.transaction;
        transactionHistory.timeStamp = hist.transactionTimestamp;
        transactionHistories.push(transactionHistory);

    });

    const historyEvent = factory.newEvent(namespace, 'SearchProductHistoryEvent');
    historyEvent.productHistory = transactionHistories;
    emit(historyEvent);
}

/**
 *
 * @param {org.trade.com.CreateDemoParticipants} request - the createDemoParticipants transaction
 * @transaction
 */
async function createDemoParticipants(request) {
    const namespace = 'org.trade.com';
    const factory = getFactory();

    const participants = [
        { id: 'artisan1', userName: 'Artisan1', email: 'artisan1@gmail.com', role: 'Artisan', accountNumber: '909090', bank: 'swedBank' },
        { id: 'designer1', userName: 'designer1', email: 'designer1@gmail.com', role: 'Designer', accountNumber: '300300', bank: 'swedBank'},
        {
            id: 'soko-artisan1', userName: 'soko-artisan', email: 'soko-artisan@gmail.com', role: 'Artisan', accountNumber: '58585858',
            company: { name: 'soko', address: 'tallinnn' }, bank: 'sebBank'
        },
        { id: 'soko-owner', userName: 'soko', email: 'soko@gmail.com', role: 'Trader', accountNumber: '909090', bank: 'sebBank',
            company: { name: 'soko', address: 'tallinnn' } },
        { id: 'qa1', userName: 'qa', email: 'qa@gmail.com', role: 'QualityAnalyst', accountNumber: '909090', bank: 'swedBank' },
        { id: 'bank-employee1', userName: 'bank-employee1', email: 'bank-employee1@gmail.com', role: 'BankEmployee', accountNumber: '909090', bank: 'swedBank' },
        { id: 'bank-employee2', userName: 'bank-employee2', email: 'bank-employee1@gmail.com', role: 'BankEmployee', accountNumber: '909090', bank: 'sebBank' }
    ];

    const users = participants.map(async participant => {
        const user = factory.newResource(namespace, participant.role, participant.id);
        user.userName = participant.userName;
        user.email = participant.email;
        user.accountNumber = participant.accountNumber;
      	user.bank = factory.newRelationship(namespace, 'Bank', participant.bank);

        if (participant.company) {
            const company = factory.newConcept(namespace, 'Company');
            company.name = participant.company.name;
            company.address = participant.company.address;
            user.company = company;
        }
        return user;
    });

    // const userRegistry = await getParticipantRegistry('org.trade.com.' + participant.role);
    // 	await userRegistry.add(user);
  	// await Promise.all(users);

    const bankRegistry = await getParticipantRegistry('org.trade.com.Bank');
    const bank = factory.newResource(namespace, 'Bank', 'swedBank11');
    bank.name = 'swedBank';
    bank.branch = 'Akadeeemia';
    bank.location = 'Tallinn';
    await bankRegistry.add(bank);

    const bankRegistry2 = await getParticipantRegistry('org.trade.com.Bank');
    const bank1 = factory.newResource(namespace, 'Bank', 'sebBank11');
    bank1.name = 'sebBank';
    bank1.branch = 'mustamae';
    bank1.location = 'Tallinn';
    await bankRegistry2.add(bank1);


}