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

Ext.define('Bokf.controller.members.Invoices', {
    extend: 'Bokf.controller.members.PurchaseBase',

    requires: [
        'Bokf.store.members.Invoices',
        // Must load CreditInvoice for its blm alias to work
        'Bokf.model.members.CreditInvoice'
    ],

    refs: [
        {ref: 'panel', selector: 'invoices'},
        {ref: 'filterCombo', selector: 'invoices combo[name=filter]'},
        {ref: 'dateRange', selector: 'invoices daterange[name=range]'}
    ],

    storeClass: 'Bokf.store.members.Invoices',
    kind: ['invoice', 'credit'],

    init: function() {
        this.callParent(arguments)

        this.control({
            'invoices button[action=search]': {
                click: this.search
            },
            'invoices invoice button[action=cancel]': {
                click: this.cancelPurchase
            },
            'invoices invoice button[action=reactivate]': {
                click: this.reactivatePurchase
            },
            'invoices invoice button[action=pay]': {
                click: this.paymentReceived
            },
            'invoices invoice button[action=paidout]': {
                click: this.paymentReceived
            },
            'invoices invoice button[action=credit]': {
                click: this.credit
            },
            'invoices invoice button[action=refund]': {
                click: this.refund
            },
            'invoices invoice button[action=remind]': {
                click: this.sendReminder
            }
        })
    },

    createPanelForRecord: function(config) {
        return new Bokf.view.members.Invoice(config)
    }
})
