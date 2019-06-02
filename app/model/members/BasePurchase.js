/*
Copyright 2019 Open End AB

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

Ext.define('Bokf.model.members.BasePurchase', {
    extend: 'Ext.data.Model',
    requires: [
        'Bokf.lib.BLMTypes',
        'Bokf.model.members.PurchaseItem'
    ],

    fields: [
        'buyerAddress',
        'buyerEmail',
        'buyerName',
        'buyerPhone',
        {name: 'canBeCredited', 'type': 'boolean', persist: false},
        {name: 'cancelled', type: 'boolean', defaultValue: false},
        'date',
        {name: 'invoiceUrl', persist: false},
        {name: 'kind', persist: false},
        'matchedPayments',
        'ocr',
        'org',
        {name: 'paymentState', persist: false},
        {name: 'reminderEmailsSent', type: 'blmlist', defaultValue: [], persist: false},
        'total'
    ],

    hasMany: [
        {model: 'Bokf.model.members.PurchaseItem', name: 'items',
         foreignKey: 'purchase'}
    ],

    hasOne: [
        {model: 'Bokf.model.Org', name: 'org', foreignKey: 'org',
         getter: 'getOrg'}
    ],

    proxy: {
        type: 'purchase',
        extraParams: {
            polymorph: true,
            attributes: [
                'buyerAddress',
                'buyerEmail',
                'buyerName',
                'buyerPhone',
                'canBeCredited',
                'cancelled',
                'date',
                'invoiceUrl',
                'kind',
                'matchedPayments',
                'ocr',
                'org',
                'originalPayments',
                'paymentState',
                'refundable',
                'reminderEmailsSent',
                'total'
            ]
        }
    }
})
