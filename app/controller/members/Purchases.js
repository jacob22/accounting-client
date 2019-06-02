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

Ext.define('Bokf.controller.members.Purchases', {
    extend: 'Bokf.controller.members.PurchaseBase',

    requires: [
        'Bokf.store.members.Purchases',
        'Bokf.view.members.Purchases',
        'Bokf.view.members.Purchase'
    ],

    refs: [
        {ref: 'panel', selector: 'purchases'},
        {ref: 'filterCombo', selector: 'purchases combo[name=filter]'},
        {ref: 'dateRange', selector: 'purchases daterange[name=range]'}
    ],

    storeClass: 'Bokf.store.members.Purchases',
    kind: 'purchase',

    init: function() {
        this.callParent(arguments)

        this.control({
            'purchases button[action=search]': {
                click: this.search
            },
            'purchases purchase button[action=cancel]': {
                click: this.cancelPurchase
            },
            'purchases purchase button[action=reactivate]': {
                click: this.reactivatePurchase
            },
            'purchases purchase button[action=pay]': {
                click: this.paymentReceived
            },
            'purchases purchase button[action=paidout]': {
                click: this.paymentReceived
            },
            'purchases purchase button[action=credit]': {
                click: this.credit
            },
            'purchases purchase button[action=remind]': {
                click: this.sendReminder
            },
            'paymentreceived': {
                verificationcreated: this.verificationCreated
            }
        })
    },

    createPanelForRecord: function(config) {
        return new Bokf.view.members.Purchase(config)
    }
})
