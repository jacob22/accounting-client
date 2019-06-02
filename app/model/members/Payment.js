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

Ext.define('Bokf.model.members.Payment', {
    extend: 'Ext.data.Model',
    alias: 'blm.members.Payment',
    requires: [
        'Bokf.lib.BLMTypes',
        'Bokf.model.PaymentProvider',
        'Bokf.model.members.BasePurchase'
    ],

    fields: [
        'amount',
        {name: 'approved', type: 'boolean'},
        'buyerdescr',
        'matchedPurchase',
        'paymentProvider',
        'org',
        {name: 'refundable', type: 'boolean'},
        'transaction_date'
    ],

    hasOne: [
        {model: 'Bokf.model.PaymentProvider',
         foreignKey: 'paymentProvider',
         getterName: 'paymentProvider'
        },

        {model: 'Bokf.model.members.BasePurchase',
         foreignKey: 'matchedPurchase',
         getterName: 'matchedPurchase'}
    ],

    proxy: {
        type: 'payment',
        extraParams: {
            polymorph: true,
            attributes: [
                // Common:
                'amount',
                'approved',
                'buyerdescr',
                'matchedPurchase',
                'org',
                'refundable',
                'transaction_date',

                // PlusGiro
                'messages',
                'ocr',
                'payerAddress',
                'payingAccount',
                'payingAccountAddress',
                'payingAccountType',
                'payingOrgno',
                'paymentProvider',
                'refs',

                // Payson:
                'purchaseId',

                // Swish:
                'payerAlias'
	    ]
        }
    },

    get_extra_title: function() {
        return ''
    }
})

Ext.define('Bokf.model.members.PGPayment', {
    extend: 'Bokf.model.members.Payment',
    alias: 'blm.members.PGPayment',

    fields: [
        'amount',
        {name: 'approved', type: 'boolean'},
        {name: 'buyerdescr', persistent: false},
        'matchedPurchase',
        {name: 'messages', type: 'blmlist', defaultValue: []},
        'ocr',
        'org',
        'payerAddress',
        'payingAccount',
        'payingAccountAddress',
        'payingAccountType',
        'payingOrgno',
        {name: 'refs', type: 'blmlist', defaultValue: []},
        {name: 'refundable', type: 'boolean'},
        'transaction_date'
    ],

    hasOne: [
        {model: 'Bokf.model.PaymentProvider',
         foreignKey: 'paymentProvider',
         getterName: 'paymentProvider'
        },

        {model: 'Bokf.model.members.Purchase',
         foreignKey: 'matchedPurchase',
         getterName: 'matchedPurchase'},

        {model: 'Bokf.model.members.PayerAddress',
         foreignKey: 'payerAddress',
         getterName: 'payerAddress'},

        {model: 'Bokf.model.members.PayingAccountAddress',
         foreignKey: 'payingAccountAddress',
         getterName: 'payingAccountAddress'}
    ],

    get_extra_title: function() {
        return this.get('ocr')
    }
})

Ext.define('Bokf.model.members.PGAddress', {
    extend: 'Ext.data.Model',

    fields: [{name: 'name', type: 'blmlist'},
             {name: 'address', type: 'blmlist'},
             'postalCode',
             'city',
             'country'
            ],

    proxy: {
        type: 'pgaddress',
        extraParams: {
            attributes: [
                'name', 'address', 'postalCode', 'city', 'country'
            ]
        }
    }
}, function() {

    // We need two separate models for the two references, because if a
    // Model has two separate HasOne-assoications pointing to the same
    // model, ExtJS WILL CONFUSE THEM WITH EACHOTHER! Argh!

    // We also need to define them in a callback, otherwise the base
    // class may not exist (defining classes is asynchronous!), and
    // the file will be queued for loading a second time! ARGH!

    Ext.define('Bokf.model.members.PayerAddress', {
        extend: 'Bokf.model.members.PGAddress'
    })

    Ext.define('Bokf.model.members.PayingAccountAddress', {
        extend: 'Bokf.model.members.PGAddress'
    })
})

// Payson
Ext.define('Bokf.model.members.PaysonPayment', {
    extend: 'Bokf.model.members.Payment',
    alias: 'blm.members.PaysonPayment',

    fields: [
        'amount',
        {name: 'approved', type: 'boolean'},
        {name: 'buyerdescr', persistent: false},
        'matchedPurchase',
        'org',
        'purchaseId',
        {name: 'refundable', type: 'boolean'},
        'transaction_date'
    ],

    get_extra_title: function() {
        return 'Payson'
    }
})


// SEQR
Ext.define('Bokf.model.members.SeqrPayment', {
    extend: 'Bokf.model.members.Payment',
    alias: 'blm.members.SeqrPayment',

    fields: [
        'amount',
        {name: 'approved', type: 'boolean'},
        {name: 'buyerdescr', persistent: false},
        'matchedPurchase',
        'org',
        {name: 'refundable', type: 'boolean'},
        'transaction_date'
    ],

    get_extra_title: function() {
        return 'SEQR'
    }
})


// Stripe
Ext.define('Bokf.model.members.StripePayment', {
    extend: 'Bokf.model.members.Payment',
    alias: 'blm.members.StripePayment',

    fields: [
	'amount',
	{name: 'approved', type: 'boolean'},
	{name: 'buyerdescr', persistent: false},
	'matchedPurchase',
	'org',
	{name: 'refundable', type: 'boolean'},
	'transaction_date'
    ],

    get_extra_title: function() {
	return 'Stripe'
    }
})


// Swish
Ext.define('Bokf.model.members.SwishPayment', {
    extend: 'Bokf.model.members.Payment',
    alias: 'blm.members.SwishPayment',

    fields: [
        'amount',
        {name: 'approved', type: 'boolean'},
        {name: 'buyerdescr', persistent: false},
        'matchedPurchase',
        'org',
        {name: 'refundable', type: 'boolean'},
        'transaction_date',
        'payerAlias'
    ],

    get_extra_title: function() {
        return 'Swish'
    }
})


// iZettle
Ext.define('Bokf.model.members.IzettlePayment', {
    extend: 'Bokf.model.members.Payment',
    alias: 'blm.members.IzettlePayment',

    fields: [
	'amount',
	{name: 'approved', type: 'boolean'},
	{name: 'buyerdescr', persistent: false},
	'matchedPurchase',
	'org',
	{name: 'refundable', type: 'boolean'},
	'transaction_date'
    ],

    get_extra_title: function() {
	return 'iZettle'
    }
})
