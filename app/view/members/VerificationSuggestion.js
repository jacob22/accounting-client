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

Ext.define('Bokf.view.members.WarningLabel', {
    extend: 'Ext.form.field.Display',
    alias: 'widget.accnowarning',

    cls: 'missing-account-warning',
    hidden: true,

    hasPaymentProvider: true,

    l10n: {
        missingAccounts: (
            'One or more accounts associated with this payment are missing '+
                'in the current fiscal year. They are either registered as '+
                'the account on which to register incoming '+
                'payments (in the Administration tab) or they are associtated '+
                'with the product that has been sold. The missing account(s) '+
                'are: {0}.'),
        noPaymentProvider: (
            'The payment provider associated with this payment is no longer available. This means that you must manually specify the debit account.'
        )
    },

    addAccountNo: function(accNo) {
        if (!this.missingAccounts) {
            this.missingAccounts = []
        }
        this.missingAccounts.push(accNo)
        this.displayText()
    },

    setHasPaymentProvider: function(hasPaymentProvider) {
        this.hasPaymentProvider = hasPaymentProvider
        this.displayText()
    },

    displayText: function() {
        var text = ''
        if (!this.hasPaymentProvider) {
            text += this.l10n.noPaymentProvider
            text += '<br>'
        }
        if (this.missingAccounts) {
            var accounts = this.missingAccounts.join(', ')
            text += Ext.String.format(this.l10n.missingAccounts, accounts)
        }
        this.setValue(text)
        this.show()
    }
})

Ext.define('Bokf.view.members.VerificationSuggestion', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.verificationsuggestion',

    requires: ['Bokf.lib.Utils'],
    border: 0,
    defaults: {
        border: 0
    },

    items: [
        {xtype: 'form', name: 'verificationdata', margin: '2 0 2 4',
         trackResetOnLoad: true,
         layout: 'hbox',
         items: [
             {name: 'payment', xtype: 'hidden'},
             {name: 'series', xtype: 'series'},
             {xtype: 'tbspacer', width: 20},
             {name: 'transaction_date', xtype: 'datefield',
              submitFormat: 'Y-m-d'}
         ]
        },

        {xtype: 'transactions', displayBalance: false,
         fbar: [{xtype: 'button', action: 'revert', disabled: true},
                {xtype: 'button', action: 'approve'}]
        },

        {xtype: 'accnowarning', name: 'warning'}
    ],

    l10n: {
        fieldLabels: {
            series: 'Series',
            transaction_date: 'Date:'
        },
        buttons: {
            approve: 'Approve',
            revert: 'Revert'
        },
        titles: {
            payer: 'Address of payer',
            payingAccountData: 'Address of paying account'
        }
    },

    listeners: {
        afterrender: function() {
            var suggestion = this.down('form[name=verificationdata]')
            Bokf.lib.Utils.translateComponents(
                suggestion, this.l10n.fieldLabels, undefined, 'setFieldLabel')
            Bokf.lib.Utils.translateComponents(
                this, this.l10n.buttons, '[action={0}]')
            Bokf.lib.Utils.translateComponents(
                this, this.l10n.addressTitles, '[name={0}]', 'setTitle')

            // do not show the balance column at all
            this.down('transactions').columns[4].hide()
        }
    }
})

Ext.define('Bokf.view.members.PaymentDetails', {
    extend: 'Ext.form.Panel',
    alias: 'widget.paymentdetails-payment',

    border: 0,
    margin: '0 0 0 5',

    defaults: {
        labelWidth: 125
    },

    items: [
        {xtype: 'displayfield', name: 'transaction_date'},
        {xtype: 'displayfield', name: 'buyerdescr'},
        {xtype: 'currencydisplay', name: 'amount'}
    ],

    l10n: {
        fieldLabels: {
            amount: 'Amount',
            buyerdescr: 'Buyer',
            transaction_date: 'Transaction date'
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
        }
    }
})


Ext.define('Bokf.view.members.PaysonPaymentDetails', {
    extend: 'Ext.form.Panel',
    alias: 'widget.paymentdetails-paysonpayment',

    border: 0,
    margin: '0 0 0 5',

    defaults: {
        labelWidth: 125
    },

    items: [
        {xtype: 'displayfield', name: 'transaction_date'},
        {xtype: 'displayfield', name: 'buyerdescr'},
        {xtype: 'currencydisplay', name: 'amount'},
        {xtype: 'displayfield', name: 'purchaseId'}
    ],

    l10n: {
        fieldLabels: {
            amount: 'Amount',
            buyerdescr: 'Buyer',
            transaction_date: 'Transaction date'
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
        }
    }
})


Ext.define('Bokf.view.members.SeqrPaymentDetails', {
    extend: 'Ext.form.Panel',
    alias: 'widget.paymentdetails-seqrpayment',

    border: 0,
    margin: '0 0 0 5',

    defaults: {
        labelWidth: 125
    },

    items: [
        {xtype: 'displayfield', name: 'transaction_date'},
        {xtype: 'displayfield', name: 'buyerdescr'},
        {xtype: 'currencydisplay', name: 'amount'},
        {xtype: 'displayfield', name: 'purchaseId'}
    ],

    l10n: {
        fieldLabels: {
            amount: 'Amount',
            buyerdescr: 'Buyer',
            transaction_date: 'Transaction date'
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
        }
    }
})


Ext.define('Bokf.view.members.SwishPaymentDetails', {
    extend: 'Ext.form.Panel',
    alias: 'widget.paymentdetails-swishpayment',

    border: 0,
    margin: '0 0 0 5',

    defaults: {
        labelWidth: 125
    },

    items: [
        {xtype: 'displayfield', name: 'transaction_date'},
        {xtype: 'displayfield', name: 'buyerdescr'},
        {xtype: 'displayfield', name: 'payerAlias'},
        {xtype: 'currencydisplay', name: 'amount'},
        {xtype: 'displayfield', name: 'purchaseId'}
    ],

    l10n: {
        fieldLabels: {
            amount: 'Amount',
            buyerdescr: 'Buyer',
            payerAlias: 'Swish',
            transaction_date: 'Transaction date'
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
        }
    }
})


Ext.define('Bokf.view.members.StripePaymentDetails', {
    extend: 'Ext.form.Panel',
    alias: 'widget.paymentdetails-stripepayment',

    border: 0,
    margin: '0 0 0 5',

    defaults: {
        labelWidth: 125
    },

    items: [
        {xtype: 'displayfield', name: 'transaction_date'},
        {xtype: 'displayfield', name: 'buyerdescr'},
        {xtype: 'currencydisplay', name: 'amount'},
        {xtype: 'displayfield', name: 'purchaseId'}
    ],

    l10n: {
        fieldLabels: {
            amount: 'Amount',
            buyerdescr: 'Buyer',
            transaction_date: 'Transaction date'
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
        }
    }
})


Ext.define('Bokf.view.members.IzettlePaymentDetails', {
    extend: 'Ext.form.Panel',
    alias: 'widget.paymentdetails-izettlepayment',

    border: 0,
    margin: '0 0 0 5',

    defaults: {
        labelWidth: 125
    },

    items: [
        {xtype: 'displayfield', name: 'transaction_date'},
        {xtype: 'currencydisplay', name: 'amount'},
        {xtype: 'displayfield', name: 'purchaseId'}
    ],

    l10n: {
        fieldLabels: {
            amount: 'Amount',
            transaction_date: 'Transaction date'
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
        }
    }
})


Ext.define('Bokf.view.members.PGPaymentDetails', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.paymentdetails-pgpayment',

    padding: '0 0 0 5',
    layout: 'column',
    border: 0,

    defaults: {
        border: 0,
        columnWidth: 0.33,
        header: {cls: 'payment-information-header'}
    },

    items: [
        {xtype: 'panel', name: 'paymentDetails',
         defaults: {
             labelWidth: 125
         },
         items: [
             {xtype: 'displayfield', name: 'transaction_date'},
             {xtype: 'displayfield', name: 'ocr'},
             {xtype: 'currencydisplay', name: 'amount'},
             {xtype: 'displayfield', name: 'messages', style: {'white-space': 'pre-wrap'}},
             {xtype: 'displayfield', name: 'refs', style: {'white-space': 'pre-wrap'}}
         ]
        },
        {xtype: 'panel', name: 'payerDetails',
         items: [
             {xtype: 'pgaddress', name: 'payer'}
         ]
        },
        {xtype: 'panel', name: 'payingAccountDetails',
         header: {cls: 'payment-information-header'},
         items: [
             {xtype: 'displayfield', name: 'payingOrgno', fieldBodyCls: 'top'},
             {xtype: 'displayfield', name: 'payingAccount'},
             {xtype: 'pgaddress', name: 'account', header: false}
         ]
        }
    ],

    l10n: {
        titles: {
            paymentDetails: 'Payment details',
            payerDetails: 'Payer details',
            payingAccountDetails: 'Paying account details'
        },
        fieldLabels: {
            amount: 'Amount',
            messages: 'Messages',
            ocr: 'OCR number',
            refs: 'Reference numbers',
            payingAccount: 'Account number',
            payingOrgno: 'Organisation number',
            transaction_date: 'Transaction date'
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateComponents(
                this, this.l10n.titles, 'panel[name={0}]', 'setTitle')
            Bokf.lib.Utils.translateComponents(
                this, this.l10n.fieldLabels, undefined, 'setFieldLabel')
        }
    },

    set: function(name, record) {
        var field = this.down(Ext.String.format('[name={0}]', name))
        field.setValue(record.get(name))
    },

    setArray: function(name, record) {
        var field = this.down(Ext.String.format('[name={0}]', name))
        field.setValue(record.get(name).join('\n'))
    },

    loadRecord: function(record) {
        this.set('transaction_date', record)
        this.set('amount', record)
        this.set('ocr', record)
        this.setArray('messages', record)
        this.setArray('refs', record)

        this.down('[name=payingOrgno]').setValue(record.get('payingOrgno'))
        this.down('[name=payingAccount]').setValue(record.get('payingAccount'))
        var self = this
        record.payerAddress(function(address) {
            self.down('pgaddress[name=payer]').loadAddress(address)
        })

        record.payingAccountAddress(function(address) {
            self.down('pgaddress[name=account]').loadAddress(address)
        })
    }
})

Ext.define('Bokf.view.members.PGAddress', {
    extend: 'Ext.container.Container',
    alias: 'widget.pgaddress',

    layout: 'form',

    items: [
        {xtype: 'container', layout: 'hbox',
         items: [
             {xtype: 'displayfield', name: 'name0'},
             {xtype: 'displayfield', name: 'name1'}
         ]
        },
        {xtype: 'displayfield', name: 'address0'},
        {xtype: 'displayfield', name: 'address1'},
        {xtype: 'displayfield', name: 'postalCode'},
        {xtype: 'displayfield', name: 'city'},
        {xtype: 'displayfield', name: 'country'}
    ],

    l10n: {
        fieldLabels: {
            name0: 'Name',
            address0: 'Address',
            postalCode: 'Postal code',
            city: 'City',
            country: 'Country code'
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateComponents(
                this, this.l10n.fieldLabels, undefined, 'setFieldLabel')
        }
    },

    loadAddress: function(address) {
        if (!address) {
            return
        }
        Ext.each(address.get('name'), function(value, index) {
            this.down(Ext.String.format('[name=name{0}]', index)).setValue(value)
        }, this);
        Ext.each(address.get('address'), function(value, index) {
            this.down(Ext.String.format('[name=address{0}]', index)).setValue(value)
        }, this);
        this.down('[name=postalCode]').setValue(address.get('postalCode'))
        this.down('[name=city]').setValue(address.get('city'))
        this.down('[name=country]').setValue(address.get('country'))
    }
})
