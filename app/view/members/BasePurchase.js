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

Ext.define('Bokf.view.members.BasePurchase', {
    extend: 'Ext.form.Panel',

    requires: [
        'Bokf.lib.CurrencyDisplay',
        'Bokf.lib.DisplayText',
        'Bokf.lib.Link',
        'Bokf.lib.Utils',
        'Ext.grid.Panel'
    ],

    cls: 'purchase',

    header: {
        cls: 'purchase-details'
    },

    collapsible: true,
    titleCollapse: true,
    readOnly: false,

    layout: 'column',
    padding: '5 5 5 5',
    margin: '5 0 5 0',

    items: [
        {xtype: 'container', padding: '5 5 5 5',
         width: 300,
         items: [
             {xtype: 'displayfield', name: 'buyerName'},
             {xtype: 'displayfield', name: 'buyerAddress',
              style: {'white-space': 'pre-wrap'}},
             {xtype: 'displayfield', name: 'buyerPhone'},
             {xtype: 'displayfield', name: 'buyerEmail'},
             {xtype: 'displayhtml', name: 'reminders'},
             {xtype: 'link', name: 'invoiceUrl'}
         ]
        },
        {xtype: 'purchaseitems', name: 'items', columnWidth: 1}
    ],

    buttons: [
        {action: 'remind'},
        {action: 'pay'},
        {action: 'refund'},
        {action: 'paidout'},
        {action: 'credit'},
        {action: 'cancel'},
        {action: 'reactivate'}
    ],

    l10n: {
        fieldLabels: {
            buyerName: 'Buyer',
            buyerAddress: 'Address',
            buyerPhone: 'Phone',
            buyerEmail: 'Email'
        },
        buttons: {
            remind: 'Send reminder',
            pay: 'Payment received',
            refund: 'Refund',
            paidout: 'Paid out',
            credit: 'Credit',
            cancel: 'Cancel',
            reactivate: 'Reactivate'
        },
        state: {
            paid: 'Paid',
            partial: 'Partially paid',
            unpaid: 'Unpaid',
            credited: 'Credited',
            cancelled: 'Cancelled'
        },
        reminderEmails: {
            empty: 'No reminder email has been sent.',
            single: 'Time at which a reminder email was sent: {0}',
            multi: 'Times at which reminder emails were sent:<br>{0}'
        },
        invoiceLink: 'See order'
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
            Bokf.lib.Utils.translateButtons(this, this.l10n.buttons)
            this.down('link[name=invoiceUrl]').setText(this.l10n.invoiceLink)
            Bokf.lib.Utils.setOEReadOnly(
                this.query('[action=pay], [action=credit], [action=cancel], '+
                           '[action=reactivate], [action=remind]'),
                this.readOnly)
        }
    },

    constructor: function() {
        this.callParent(arguments)
        this._currencyRenderer = Bokf.lib.Utils.currencyRendererFactory(2)
    },

    titleFormat: ('<span class="purchase-state">{4}</span>'+
                  '<span class="purchase-date">{0}</span>'+
                  '<span class="purchase-amount">{1}</span>'+
                  '<span class="purchase-ocr">{2}</span>'+
                  '<span class="purchase-name">{3}</span>'),

    _getTitle: function(record) {
        var total = this._currencyRenderer(record.get('total'))
        var ocr = record.get('ocr')
        var buyer = record.get('buyerName')
        var date = Ext.Date.format(
            new Date(record.get('date')*1000), 'Y-m-d')

        var state
        if (record.get('cancelled')) {
            state = this.l10n.state.cancelled
        } else {
            state = this.l10n.state[record.get('paymentState')]
        }
        var title = Ext.String.format(
            this.titleFormat, date, total, ocr, buyer, state)
        return title
    },

    updateReminderEmails: function(record) {
        var reminderEmailsSent = record.get('reminderEmailsSent')
        var text
        if (reminderEmailsSent.length == 0) {
            text = this.l10n.reminderEmails.empty
        } else if (reminderEmailsSent.length == 1) {
            var time = new Date()
            time.setTime(reminderEmailsSent[0] * 1000)
            var timeStr = Ext.Date.format(time, 'Y-m-d')
            text = Ext.String.format(this.l10n.reminderEmails.single, timeStr)
        } else {
            var localeDates = reminderEmailsSent.map(function(timestamp) {
                var time = new Date()
                time.setTime(timestamp * 1000)
                return Ext.Date.format(time, 'Y-m-d')
            })
            text = Ext.String.format(this.l10n.reminderEmails.multi,
                                     localeDates.join('<br>'))
        }
        var remindersField = this.down('[name=reminders]')
        if (!remindersField.rendered) {
            remindersField.on('render', function(field) {
                field.setText(text)
            }, this)
        } else {
            remindersField.setText(text)
        }
    },

    loadRecord: function(record) {
        this.callParent(arguments)
        var title = this._getTitle(record)
        var cancel = this.down('button[action=cancel]')
        var reactivate = this.down('button[action=reactivate]')
        var pay = this.down('button[action=pay]')
        var refund = this.down('button[action=refund]')
        var paidout = this.down('button[action=paidout]')
        var credit = this.down('button[action=credit]')
        var remind = this.down('button[action=remind]')

        var cancelled = record.get('cancelled')
        var paymentState = record.get('paymentState')
        var kind = record.get('kind')

        var expectingPayment = paymentState == 'unpaid' || paymentState == 'partial'

        pay.setVisible(!cancelled && paymentState == 'unpaid' && kind != 'credit')
        remind.setVisible(!cancelled && expectingPayment && kind != 'credit')

        var payout_ok = !cancelled && paymentState == 'unpaid' && kind == 'credit'
        paidout.setVisible(payout_ok)
        refund.setVisible(payout_ok && record.get('refundable'))

        // credit.setVisible(!cancelled && kind != 'credit' &&
        //                   (paymentState == 'paid' ||
        //                    (paymentState == 'unpaid' && kind == 'invoice')))
        credit.setVisible(record.get('canBeCredited'))

        cancel.setVisible(!cancelled && expectingPayment && kind == 'purchase')


        reactivate.setVisible(cancelled)

        if (cancelled) {
            this.addCls('cancelled')
        } else {
            this.removeCls('cancelled')
        }

        function set() {
            this.setTitle(title)
            this.updateReminderEmails(record)
            this.down('link').setHref(record.get('invoiceUrl'))
        }

        if (this.rendered) {
            set.apply(this)
        } else {
            this.on('render', set, this)
        }
    }
})


Ext.define('Bokf.view.members.PurchaseItems', {
    //extend: 'Ext.grid.Panel',
    extend: 'Ext.panel.Table',
    alias: 'widget.purchaseitems',
    viewType: 'purchaseitemsview',

    //hideHeaders: true,
    rowLines: false,
    border: 0,
    disableSelection: true,


    columns: {
        items: [
            {name: 'name', dataIndex: 'name', flex: 1},
            {name: 'quantity', dataIndex: 'quantity'},
            {name: 'price', dataIndex: 'price',
             renderer: Bokf.lib.Utils.currencyRendererFactory(2)
            },
            {name: 'total', dataIndex: 'total',
             renderer: Bokf.lib.Utils.currencyRendererFactory(2)
            }
        ],
        defaults: {
            cls: 'purchase-item-option'
        }
    },

    l10n: {
        columnHeaders: {
            name: 'Product',
            quantity: 'Quantity',
            price: 'Price',
            total: 'Total'
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateComponents(
                this, this.l10n.columnHeaders, 'gridcolumn[name={0}]', 'setText')
        }
    }
})


Ext.define('Bokf.view.members.PurchaseItemView', {
    extend: 'Ext.view.Table',
    alias: 'widget.purchaseitemsview',
    autoScroll: true,

    l10n: {
        unknownFieldLabel: 'unknown'
    },

    rowTpl: [
        '{%',
            'var dataRowCls = values.recordIndex === -1 ? "" : " ' + Ext.baseCSSPrefix + 'grid-data-row";',
        '%}',
        '<tr {[values.rowId ? ("id=\\"" + values.rowId + "\\"") : ""]} ',
            'data-boundView="{view.id}" ',
            'data-recordId="{record.internalId}" ',
            'data-recordIndex="{recordIndex}" ',
            'class="{[values.itemClasses.join(" ")]} {[values.rowClasses.join(" ")]}{[dataRowCls]}" ',
            '{rowAttr:attributes} tabIndex="-1">',
            '<tpl for="columns">' +
                '{%',
                    'parent.view.renderCell(values, parent.record, parent.recordIndex, xindex - 1, out, parent)',
                 '%}',
            '</tpl>',
        '</tr>',
        '<tpl for=".">',
            '{%',
                'parent.view.renderOptionRow(values, parent.record, parent.recordIndex, xindex - 1, out, parent)',
             '%}',
        '</tpl>',
        {
            priority: 0
        }
    ],

    renderOptionRow: function(value, record, recordIndex, columnIndex, out) {
        if (recordIndex == -1) {
            return // metadata record
        }
        if (!record.get('options').length) {
            return // no options
        }

        out.push('<tr><td colspan="4"><table>')
        var optionFields = record.optionFields()
        Ext.each(record.get('options'), function(option, index) {
            var optionField = optionFields.getAt(index)
            var label = this.l10n.unknownFieldLabel
            if (optionField) {
                label = optionField.get('label')
            }
            out.push(Ext.String.format('<tr><td>&nbsp;</td><td>{0}:</td><td>{1}</td></tr>',
                                       label, option))
        }, this);
        out.push('</table></td></tr>')
    }
})



Ext.define('Bokf.view.members.PaymentReceived', {
    extend: 'Ext.window.Window',
    alias: 'widget.paymentreceived',

    requires: [
        'Ext.ux.IFrame'
    ],

    width: 800,
    height: 600,
    layout: 'fit',

    l10n: {
        title: 'Payment received'
    },

    items: [
        {
            xtype: 'component',
            name: 'iframe',
            autoEl: {
                tag: 'iframe'
            }
        }
    ],

    listeners: {
        afterrender: function() {
            this.setTitle(this.l10n.title)
        }
    },

    setContainerWidth: function(container_width) {
        // Resize window to a size appropriate for displaying bootstrap content
        var bs_widths = [1200, 992, 768, 576]
        bs_widths = Ext.Array.map(bs_widths, function(w) { return w + 16 })
        var width
        Ext.Array.each(bs_widths, function(bs_width) {
            width = bs_width
            if (container_width > bs_width) {
                return false
            }
        });
        this.setWidth(width)
    },

    setPurchase: function(purchase, form) {
        this.purchase = purchase
        this.form = form
        if (!this.rendered) {
            return
        }
        var iframe = this.down('component[name=iframe]')
        var orgid = purchase.get('org')
        var id = purchase.get('id')
        var src = Ext.String.format('/purchase/verification/{0}/{1}', orgid, id)
        iframe.el.dom.src = src
        var self = this
        window.addEventListener('message', function(event) {
            var parts = event.data.split(/: /)
            if (parts[0] == 'payment created') {
                var paymentId = parts[1]
                self.fireEvent('verificationcreated',
                               self, purchase, form, paymentId)
            }
        }, {once: true})
    }
})
