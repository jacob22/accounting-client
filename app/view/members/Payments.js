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

Ext.define('Bokf.view.members.Payments', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.payments',

    requires: [
        'Bokf.lib.Utils',
        'Bokf.store.members.PaymentFilters'
    ],

    autoScroll: true,

    tbar: [
        {xtype: 'tbspacer', width: 10},
        {xtype: 'combo', name: 'filter', editable: false, forceSelection: true,
         value: 'unapproved',
         store: {type: 'paymentfilters'},
         valueField: 'id'
        },
        {xtype: 'tbspacer', width: 20},
        {xtype: 'daterange', name: 'range', showReset: false},
        {xtype: 'tbspacer', width: 20},
        {xtype: 'container', items: [{xtype: 'button', action: 'search'}]},
        '->',
        {xtype: 'button', action: 'approveall',
         cls: 'oe-readonly'  // start hidden
        },
        {xtype: 'tbspacer', width: 15}
    ],

    l10n: {
        fieldLabels: {
            filter: 'Filter by'
        },
        buttons: {
            approveall: 'Approve all matching payments',
            search: 'Search'
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateComponents(
                this, this.l10n.fieldLabels, undefined, 'setFieldLabel')
            Bokf.lib.Utils.translateButtons(this, this.l10n.buttons)
        }
    },

    setup: function(paymentsStore, accountsStore, seriesStore, org, loader) {
        this.paymentsStore = paymentsStore
        this.accountsStore = accountsStore
        this.seriesStore = seriesStore
        this.removeAll()
        loader.incref('loading payments')
        paymentsStore.on('load', function(_, payments) {
            var widgets = []
            Ext.each(payments, function(payment) {
                // The load signal can trigger multiple times, since
                // we reload the store after approving payments
                // (PaymentController), so avoid creating the same
                // widget multiple times.
                var query = Ext.String.format('payment[paymentId={0}]',
                                              payment.get('id'))
                if (!this.down(query)) {
                    var widget = new Bokf.view.members.Payment()
                    widget.setData(payment, this.accountsStore, this.seriesStore, org)
                    widgets.push(widget)
                }
            }, this);
            this.add(widgets)
            loader.decref('loading payments')
        }, this)
    }
})


Ext.define('Bokf.view.members.Payment', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.payment',

    requires: [
        'Bokf.lib.Utils'
    ],

    name: 'payment',
    collapsed: true,
    collapsible: true,
    margin: '5 0 5 0',
    padding: '5 5 5 5',

    titleCollapse: true,

    header: {
        cls: 'payment',
        items: [
            {xtype: 'button', action: 'approve', height: 18, hidden: true},
            {xtype: 'component', width: 25}
        ],
        titlePosition: 0
    },

    l10n: {
        header: {
            buttons: {
                approve: 'Approve verification'
            }
        }
    },

    listeners: {
        afterrender: function() {
            var payment = this.payment
            var extra = payment.get_extra_title()
            var amount = payment.get('amount')
            var displayAmt = this.currencyRenderer(amount)
            var name = payment.get('buyerdescr') || ''

            var format = ('<span class="matched-payment-amount">{0}</span> '+
                          '<span class="matched-payment-ocr">{1}</span> ' +
                          '<span class="matched-payment-name">{2}</span>')
            var title = Ext.String.format(format, displayAmt, extra, name)
            this.setTitle(title)

            var header = this.getHeader()
            payment.matchedPurchase(function(purchase) {
                if (!purchase) {
                    header.addCls('unmatched-payment')
                }
                this.maybeShowApproveButton()
            }, this)

            // translations:
            Bokf.lib.Utils.translateButtons(header, this.l10n.header.buttons)
        },

        expand: function() {
            this.getHeader().down('[action=approve]').hide()
        },

        collapse: function() {
            this.maybeShowApproveButton()
        }

    },

    initComponent: function() {
        this.callParent(arguments)
        this.currencyRenderer = Bokf.lib.Utils.currencyRendererFactory(2)
    },

    setData: function(payment, accountsStore, seriesStore, org) {
        this.payment = payment
        this.paymentId = payment.get('id')
        this.accountsStore = accountsStore
        this.seriesStore = seriesStore
        this.org = org
    },

    maybeShowApproveButton: function() {
        var button = this.getHeader().down('[action=approve]')
        if (this.payment.get('approved') ||
            !this.org.isAccountant()) {
            button.hide()
            return
        }

        this.payment.matchedPurchase(function(purchase) {
            if (!purchase) {
                button.hide()
            } else {
                button.show()
            }
        })
    }
})
