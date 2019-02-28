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
    const namespace = 'org.trade.com';

    const factory = getFactory();

    const po = factory.newResource(namespace, 'PurchaseOrder', poRequest.id);
    po.buyer = factory.newRelationship(namespace, 'Trader', poRequest.buyer.getIdentifier());
    po.seller = factory.newRelationship(namespace, 'Trader', poRequest.seller.getIdentifier());
    po.total_Amount = poRequest.total_Amount;
    po.status = 'WAITING_APPROVAL';
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
 *
 * @param {org.trade.com.ReviewPurchaseOrder} request - the reviewPurchaseOrder transaction
 * @transaction
 */
async function reviewPurchaseOrder(request) {
    const namespace = 'org.trade.com';

    const factory = getFactory();

    const assetRegistry = await getAssetRegistry('org.trade.com.PurchaseOrder');
    const po = await assetRegistry.get(request.purchaseOrderId);

    po.status = request.status;
    if (request.description) {
        po.description = request.description;
    }
    assetRegistry.update(po);

    // emit event
    const poEvent = factory.newEvent(namespace, 'PurchaseOrderInfoEvent');
    poEvent.purchaseOrder = po;
    emit(poEvent);
}
