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
 * @param {org.trade.com.GenerateInvoice} request - the generateInvoice transaction
 * @transaction
 */
async function generateInvoice (request){
    const namespace = 'org.trade.com';

    const factory = getFactory();

    const assetRegistry = await getAssetRegistry('org.trade.com.PurchaseOrder');
    const po = await assetRegistry.get(request.purchaseOrderId);

    const poLineItems = po.products;

    const invoiceLineItems = [];
    for (const item in poLineItems) {
        const availableProducts = await query('findProductByName', {name: poLineItems[item].name});
        if(poLineItems[item].amount > availableProducts.length){
            // eslint-disable-next-line no-throw-literal
            throw 'There is no enough ' + poLineItems[item].name + 'to full fill the order';
        }
        const products = availableProducts.slice(0, poLineItems[item].amount);
        products.forEach(product =>{

            const invoiceLineItem = factory.newConcept(namespace, 'InvoiceLineItem');
            invoiceLineItem.serial_number =  product.serial_number;
            invoiceLineItem.name = product.name;
            invoiceLineItem.price =  product.price;

            invoiceLineItems.push(invoiceLineItem);
        });


    }

    const totalAmount = invoiceLineItems.reduce((sum, item) => sum + item.price, 0.0);

    const invoiceId = '#' + new Date().getTime().toString();
    const invoice = factory.newResource(namespace, 'Invoice', invoiceId);
    invoice.totalAmount = totalAmount;
    invoice.status = 'UNPAID';
    invoice.seller = po.seller;
    invoice.buyer = po.buyer;
    invoice.invoiceLineItem = invoiceLineItems;

    const invoiceRegistry = await getAssetRegistry(invoice.getFullyQualifiedType());
    await invoiceRegistry.add(invoice);

    // emit event
    const invoiceEvent = factory.newEvent(namespace, 'GenerateInvoiceEvent');
    invoiceEvent.invoice = invoice;
    emit(invoiceEvent);


}