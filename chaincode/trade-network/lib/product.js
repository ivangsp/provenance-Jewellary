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
 * @param {org.trade.com.AddQualityCertificate} request - the addQualityCertificate transaction
 * @transaction
 */
async function addQualityCertificate(request) {
    const namespace = 'org.trade.com';

    const factory = getFactory();

    try {
        const product = await query('searchProductBySerialNumber', {productId: request.productId});
        if (product.length === 0) {
            // eslint-disable-next-line no-throw-literal
            throw 'No product with serial number ' + request.productId + ' found';
        }

        const issuer = await query('getUserById', {id: request.userId});
        if(issuer.length === 0) {
            // eslint-disable-next-line no-throw-literal
            throw 'User with id ' + request.userId  + ' does not exist';
        }

        const certificate = factory.newConcept(namespace, 'QualityCertificate');
        certificate.issuedBy = issuer[0];
        certificate.status = request.status;

        product[0].qualityCertificate = certificate;
        const assetRegistry = await getAssetRegistry(product[0].getFullyQualifiedType());
        await assetRegistry.update(product[0]);

        // emit event
        const productInfo = factory.newEvent(namespace, 'ProductEvent');
        productInfo.product = product[0];
        emit(productInfo);


    }
    catch(e) {
        console.warn('Oooops Error occured ', e);
    }
}