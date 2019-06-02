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

Ext.define('Bokf.store.PaymentProviderTypes', {
    extend: 'Ext.data.Store',
    requires: [
        'Bokf.lib.Utils'
    ],

    autoLoad: true,
    model: 'Bokf.model.PaymentProviderType',
    storeId: 'paymentprovidertype',

    proxy: {
        type: 'memory'
    },

    data: [
        {id: 'paymentsimulator', name: 'Simulator'},
        {id: 'pgorder', name: 'PlusGirot'},
        {id: 'payson', name: 'Payson'},
        {id: 'seqr', name: 'SEQR'},
	{id: 'stripe', name: 'Stripe'},
        {id: 'swish', name: 'Swish'},
        {id: 'izettle', name: 'iZettle'},
	{id: 'empty', name: null}
    ],

    constructor: function() {
        // this.data = this.data.filter(function(element) {
        //     return element.id != 'swish' || Bokf.lib.Utils.isBetaTester()
        // })
        this.callParent(arguments)
    }
})
