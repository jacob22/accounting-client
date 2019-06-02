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

Ext.define('Bokf.view.Main', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Bokf.lib.LinkButton',
        'Bokf.view.AccountsPayable',
        'Bokf.view.Admin',
        'Bokf.view.Expense',
	'Bokf.view.Import',
        'Bokf.view.Reports',
        'Bokf.view.Verification',
        'Bokf.view.members.Invoices',
        'Bokf.view.members.Payments',
        'Bokf.view.members.Products',
        'Bokf.view.members.Purchases',
        'Bokf.view.members.SalesReports'
    ],

    xtype: 'main',
    autoScroll: 'true',

    layout: 'border',

    dockedItems: [
        {xtype: 'toolbar', cls: 'acc-top-toolbar', dock: 'top',
         height: 24, padding: '2 6 2 2',
         items: [
             '->',
             {xtype: 'linkbutton', action: 'logout', href: '/logout'}
         ]
        }
    ],

    items: [
        {xtype: 'orglist', region: 'west',
         width: 300, split: true, collapsible: true},

        {xtype: 'tabpanel', name: 'main-tab-panel',
         region: 'center',
         tabBar: {
             cls: 'main-tab-bar'
         },

         items: [
             {xtype: 'admin', name: 'admin'},
             {xtype: 'verification', name: 'accounting', hidden: true},
             {xtype: 'reports', name: 'reports', hidden: true},
             {xtype: 'products', name: 'products', hidden: true},
             {xtype: 'payments', name: 'payments', hidden: true},
             {xtype: 'purchases', name: 'purchases', hidden: true},
             {xtype: 'invoices', name: 'invoices', hidden: true},
             {xtype: 'expense', name: 'expenses', hidden: true},
             {xtype: 'import', name: 'import', hidden: true},
             {xtype: 'salesreports', name: 'salesreports', hidden: true},
             {xtype: 'accountspayable', name: 'accountspayable', hidden: true}
         ],

         stateful: true,
         stateId: 'main-tab-bar',
         stateEvents: ['tabchange'],

         applyState: function(state) {
             if (state.index != null) {
                 var tab = this.items.getAt(state.index)
                 if (tab != null) {
                     this.setActiveTab(tab)
                 }
             }
         },

         getState: function() {
             var tab = this.getActiveTab()
             var index = this.items.indexOf(tab)
             return {'index': index}
         }
        }
    ],

    l10n: {
        tabNames: {
            admin: 'Administration',
            accounting: 'Accounting',
            reports: 'Reports',
            products: 'Shop',
            payments: 'Payments',
            purchases: 'Purchases',
            invoices: 'Invoices',
            expenses: 'Expenses',
	    'import': 'Import',
            salesreports: 'Sales reports',
            accountspayable: 'Accounts payable'
        },
        logout: 'Log out'
    },

    listeners: {
        beforerender: {
            fn: function() {
                var tabPanel = this.down('[name=main-tab-panel]')
                var tabs = tabPanel.getTabBar().items
                tabPanel.items.each(function(item, i) {
                    tabs.getAt(i).setText(this.l10n.tabNames[item.name])
                }, this);
                this.down('button[action=logout]').setText(this.l10n.logout)
            }
        }
    }
})
