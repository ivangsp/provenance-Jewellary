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
 * @param {org.trade.com.CreateProductDesign} designRequest - the createProductDesign transaction
 * @transaction
 */
async function createProductDesign(designRequest) {
    const namespace = 'org.trade.com';

    const factory = getFactory();

    // const id = 'D#' + new Date().getTime().toString();
    const design = factory.newResource(namespace, 'ProductDesign', designRequest.designId);
    design.material = designRequest.material;
    design.specification = designRequest.specification;
    const designers = [];
    designRequest.designers.forEach(designer => {
        designers.push(factory.newRelationship(namespace, 'User', designer.getIdentifier()));
    });
    if (designers.length === 0) {
        // eslint-disable-next-line no-throw-literal
        throw 'Please enter a valid designers id';
    }

    design.designers = designers;
    design.dateCreated = new Date();
    design.name = designRequest.name;

    // save the product design
    const assetRegistry = await getAssetRegistry(design.getFullyQualifiedType());
    await assetRegistry.add(design);

    // emit event
    // const deisgnInfo = factory.newEvent(namespace, 'CreateProductDesignEvent');
    // emit(deisgnInfo);
}

/**
 * @param {org.trade.com.GetDesignByDesignerId} designReq - the getDesignByDesignerId transaction
 * @transaction
 */
async function getDesignByDesignerId(designReq) {
    const namespace = 'org.trade.com';
    const factory = getFactory();
    try {
        const user = await query('getUserById', {id: designReq.designerId});
        if (user.length === 0) {
        // eslint-disable-next-line no-throw-literal
            throw 'Designer with the id ' + designerId + 'does not exist';
        }
  	const designerId = 'resource:'+ user[0].getFullyQualifiedIdentifier();
        const designs = await query('searchProductDesignByDesignerId', {id: designerId});

        if (designs.length === 0){
        // eslint-disable-next-line no-throw-literal
            throw 'Not found ' + designerId;
        }

        const designLineItems = [];
        designs.forEach(design => {
            const designItem = factory.newConcept(namespace, 'ProductDesignInfo');
            designItem.id = design.id;
            designItem.name = design.name;
            designItem.material = design.material;
            designItem.specification = design.specification;
      	designItem.dateCreated = design.dateCreated;
            designItem.designers = user;

            designLineItems.push(designItem);
        });

        // emit event
        const deisgnInfo = factory.newEvent(namespace, 'DesignInfo');
        deisgnInfo.designs = designLineItems;
        emit(deisgnInfo);
    }
    catch (e) {
        console.error('Opps, SQL error', e);
    }

}
