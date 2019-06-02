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

Ext.define('Bokf.Application', {})

Ext.application({
    name: 'Bokf',

    requires: [
        'Ext.direct.RemotingProvider',
        'Ext.tip.Tip',
        'Bokf.lib.Model', // overrides for Ext.data.Model
        'Bokf.lib.Store', // overrides for Ext.data.Store
        'Bokf.lib.TransactionTextEditor', // initialize the store...
        'Bokf.lib.Utils', // to avoid later sync requires
        'Bokf.view.Viewport'
    ],

    controllers: [
        'Bokf.controller.Accounting',
        'Bokf.controller.AccountsPayable',
        'Bokf.controller.Expense',
        'Bokf.controller.Import',
        'Bokf.controller.Org',
        'Bokf.controller.Reports',
        'Bokf.controller.Subscription',
        'Bokf.controller.Verifications',
        'Bokf.controller.members.Invoices',
        'Bokf.controller.members.Payments',
        'Bokf.controller.members.Products',
        'Bokf.controller.members.Purchases',
        'Bokf.controller.members.SalesReports'
    ],

    //paths: {'Bokf': 'app'},

    launch: function launch() {
        // work around this bug:
        // http://www.sencha.com/forum/showthread.php?260106
        delete Ext.tip.Tip.prototype.minWidth

        // Used by view.accounting.Edit
        Ext.create('Bokf.store.AccountTypes')

        // Used by view.org.Subscription
        Ext.create('Bokf.store.PaymentProviderTypes')

        // Used by view.Reports
        Ext.create('Bokf.store.Reports')

        // Used by view.org.View
        Ext.create('Bokf.store.Roles')

        // Used by view.accounting.Edit
        Ext.create('Bokf.store.VatCodes')

        // Single instance, since it takes a long time to load.
        Ext.create('Bokf.lib.TransactionTextEditor.Store')

        Ext.create('Bokf.view.Viewport')
    }
})
