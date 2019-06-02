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

Ext.define('Bokf.store.Reports', {
    extend: 'Ext.data.Store',
    autoLoad: true,
    model: 'Bokf.model.Report',
    storeId: 'reports',

    proxy: {
        type: 'memory'
    },

    l10n: {
        reportNames: {
            '/kontoplan': 'Chart of accounts',
            '/huvudbok': 'General ledger',
            '/verifikationslista': 'Verification list',
            '/verifikationslista_andrade': 'Modified verifications',
            '/balansrakning': 'Balance sheet',
            '/resultatrakning': 'Income statement',
            '/arsrapport': 'Annual report',
            '/periodrapport': 'Period report',	   
            '/vatreport': 'VAT report',
            '/graph': 'Cumulative graph',
	    '/accountspayable_report': 'Accounts payable report',
	    '/accountspayable_paymentjournal': 'Accounts payable payment journal'
        }
    },

    data: [
        {url: '/kontoplan'},
        {url: '/huvudbok', filter: 'accounts'},
        {url: '/verifikationslista', filter: 'verifications'},
        {url: '/verifikationslista_andrade', filter: 'verifications'},
        {url: '/balansrakning', filter: 'period'},
        {url: '/resultatrakning', filter: 'period'},
        {url: '/arsrapport'},
        {url: '/periodrapport', filter: 'period'},
        {url: '/vatreport'},
        {url: '/graph', filter: 'accounts'},
	{url: '/accountspayable_report'},
	{url: '/accountspayable_paymentjournal'}
    ],

    constructor: function() {
        this.callParent(arguments)
        this.data.each(function(element) {
            var url = element.get('url')
            var name = this.l10n.reportNames[url]
            element.set('name', name)
        }, this)
    }
})
