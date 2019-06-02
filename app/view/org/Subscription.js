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

Ext.define('Bokf.view.org.Subscription', {
    extend: 'Ext.panel.Panel',
    requires: ['Bokf.lib.Utils'],
    alias: 'widget.subscription',

    requires: [
        'Bokf.lib.DisplayText'
    ],

    bodyPadding: 5,

    items: [
        {xtype: 'panel', name: 'nonsubscriber-container',
         border: 0,
         items: [
             {xtype: 'displayhtml', name: 'nonSubscriberText'}
         ],
         buttons: [
             {xtype: 'button', action: 'subscribe'}
         ]
        },

        {xtype: 'container', name: 'subscriber-container',
         items: [
             {xtype: 'displaytext', name: 'subscriberText'}
         ]
        }
    ],

    l10n: {
        title: 'Organisation status',
        texts: {
            nonSubscriberText: '\
This is a free Trial organisation. \
It can be converted to a Standard organisation with a yearly subscription fee according to the <a href="{url}">price list</a>. \
Trial organisations are deleted after six months. <br /> \
To connect a plusgiro account to OCR processing and automated delivery of incoming payments you need a Standard organisation. <br /> \
Press "Upgrade" to convert the organisation to a Standard organisation.',
            subscriberText: '\
This is a Standard organisation (upgraded from Trial organisation).'
        },
        buttons: {
            subscribe: 'Upgrade'
        }
    },

    listeners: {
        beforerender: function() {
            this.setTitle(this.l10n.title)

            var texts = {}
            for (var key in this.l10n.texts) {
                texts[key] = new Ext.Template(this.l10n.texts[key]).apply({
                    url: 'http://www.eutaxia.se/#tab_prices'
                })
            }

            Bokf.lib.Utils.translateComponents(this, texts)
            Bokf.lib.Utils.translateButtons(this, this.l10n.buttons)
        }
    }
})


Ext.define('Bokf.view.org.PaymentProviders', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.paymentproviders',

    bodyPadding: 5,

    items: [
        {xtype: 'container', name: 'paymentprovidereditor'},
        {xtype: 'paymentprovidercreator'}
    ],

    l10n: {
        title: 'Payment providers'
    },

    listeners: {
        afterrender: function() {
            this.setTitle(this.l10n.title)
        }
    }
})


Ext.define('Bokf.view.org.PaymentProviderCreator', {
    extend: 'Ext.container.Container',
    alias: 'widget.paymentprovidercreator',
    requires: [
        'Bokf.store.PaymentProviderTypes'
    ],

    items: [
        {xtype: 'displaytext', name: 'creatorText'},
        {xtype: 'combo', name: 'provider',
         valueField: 'id', displayField: 'name',
         editable: false,
         store: 'paymentprovidertype',
         listeners: {
             change: function(combo, value) {
                 combo.up('paymentprovidercreator').
                     down('[name=providercontainer]').getLayout().
                     setActiveItem(value)
             }
         }
        },
        {xtype: 'container', layout: 'card', name: 'providercontainer',
         items: [
             {xtype: 'component', itemId: 'empty'},
             {xtype: 'paymentsimulator', itemId: 'paymentsimulator'},
             {xtype: 'pgorder', itemId: 'pgorder'},
             {xtype: 'payson', itemId: 'payson'},
	     {xtype: 'seqr', itemId: 'seqr'},
	     {xtype: 'stripe', itemId: 'stripe'},
             {xtype: 'swish', itemId: 'swish'},
             {xtype: 'izettle', itemId: 'izettle'}
         ]
        }
    ],

    l10n: {
        texts: {
            creatorText: ('Eutaxia Admin can receive payments through several '+
                          'different providers. You can add new payment '+
                          'providers below.')
        },
        fieldLabels: {
            provider: 'Select provider'
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateComponents(this, this.l10n.texts)
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
        }
    },

    setStores: function(seriesStore, accountsStore) {
        Ext.each(this.query('form'), function(provider) {
            provider.setStores(seriesStore.clone(), accountsStore.clone())
        })
    },

    reset: function() {
        Ext.each(this.query('form'), function(form) {
            form.getForm().reset()
        });
        this.down('combo[name=provider]').setValue('empty')
    }
})


Ext.define('Bokf.view.org.PGOrder', {
    extend: 'Ext.form.Panel',
    alias: 'widget.pgorder',

    border: 0,
    fieldDefaults: {
        labelAlign: 'top',
        width: 300
    },
    defaults: {
        allowBlank: false
    },
    items: [
        {xtype: 'displaytext', name: 'pgOrderText'},
        {xtype: 'textfield', name: 'contact'},
        {xtype: 'textfield', name: 'contactPhone'},
        {xtype: 'textfield', name: 'contactEmail', vtype: 'email'},
        {xtype: 'textfield', name: 'pgnum', regex: /^[\d-]+$/},
        {name: 'pgaccount', xtype: 'accounteditor', valueField: 'number',
         forceSelection: false},
        {name: 'pgseries', xtype: 'series', valueField: 'name',
         forceSelection: false, autoSelect: false}
    ],
    buttons: [
        {xtype: 'button', action: 'connectpg', formBind: true},
        {action: 'cancel' }
    ],

    l10n: {
        texts: {
            pgOrderText: '\
You can connect OCR processing to a plusgiro account that belongs to this organisation. \
If you do so Eutaxia will automatically create verifications from incoming payments. \
To place an order fill in all fields below and press "Order". \
Open End will order an OCR connection from Nordea on your behalf. \
A contract that allows Open End to retrieve incoming payment data will be sent to you. You need to sign and return it to Nordea.'
        },
        fieldLabels: {
            pgnum: 'Plusgiro to connect to OCR account',
            contact: 'Contact person',
            contactPhone: 'Telephone number',
            contactEmail: 'E-mail address',
            pgaccount: 'OCR account',
            pgseries: 'Series for OCR account'
        },
        buttons: {
            connectpg: 'Order',
            cancel: 'Cancel'
        }
    },

    listeners: {
        beforerender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
            Bokf.lib.Utils.translateButtons(this, this.l10n.buttons)
            Bokf.lib.Utils.translateComponents(this, this.l10n.texts)
        }
    },

    setStores: function(seriesStore, accountsStore) {
        var seriesSelector = this.down('series')
        var accountSelector = this.down('accounteditor')
        seriesSelector.bindStore(seriesStore)
        accountSelector.bindStore(accountsStore)
    }
})


Ext.define('Bokf.view.org.PaymentProvider', {
    extend: 'Ext.form.Panel',
    alias: 'widget.paymentprovider',

    header: {
        cls: 'paymentprovider'
    },

    setStores: function(seriesStore, accountsStore) {
        var seriesSelector = this.down('series')
        var accountSelector = this.down('accounteditor')
        seriesSelector.bindStore(seriesStore)
        accountSelector.bindStore(accountsStore)
    }
})


Ext.define('Bokf.view.org.PaymentSimulator', {
    extend: 'Bokf.view.org.PaymentProvider',
    alias: 'widget.paymentsimulator',

    trackResetOnLoad: true,
    border: 0,
    fieldDefaults: {
        labelWidth: 150
    },
    defaults: {
        allowBlank: false
    },
    items: [
        {xtype: 'displaytext', name: 'simulatorText'},

        {name: 'account', xtype: 'accounteditor', width: 435,
         forceSelection: false, valueField: 'number' },

        {name: 'series', xtype: 'series', width: 435,
         forceSelection: false, autoSelect: false,
         valueField: 'name'}
    ],
    buttons: [
        {action: 'delete', hidden: true},
        '->',
        {action: 'save' },
        {action: 'cancel' }
    ],

    l10n: {
        title: 'Payment simulator',
        createTexts: {
            simulatorText: 'You can test the automatic accounting by simulating incoming payments in the web shop. To do so, you must first specify under which series and account to file the book keeping data for the simulated payment. The option to simulate a payment will only show up in the web shop if you are also logged in to Eutaxia Admin.'
        },
        editTexts: {
            simulatorText: 'This payment simulator lets you simulate incoming payments in the web shop. Select series and account to use for simulated payments below. The option to simulate a payment will only show up in the web shop if you are also logged in to Eutaxia Admin.'
        },
        fieldLabels: {
            account: 'Account',
            series: 'Series'
        },
        buttons: {
            create: {
                save: 'Create',
                cancel: 'Cancel'
            },
            edit: {
                'delete': 'Delete',
                save: 'Save',
                cancel: 'Cancel'
            }
        }
    },

    listeners: {
        afterrender: function() {
            this.setTitle(this.l10n.title)
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
            if (!this.getRecord()) {
                Bokf.lib.Utils.translateComponents(this, this.l10n.createTexts)
                Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.create)
            } else {
                Bokf.lib.Utils.translateComponents(this, this.l10n.editTexts)
                Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.edit)
            }
        },

        beforerender: function() {
            this.updateButtonState()
        },

        dirtychange: function() {
            this.updateButtonState()
        },

        validitychange: function () {
            this.updateButtonState()
        }
    },

    updateButtonState: function() {
        var record = this.getRecord()
        var dirty = (record === undefined || this.isDirty())

        this.down('button[action=cancel]').setDisabled(!dirty)
        this.down('button[action=save]').setDisabled(!dirty || !this.isValid())
    },

    loadRecord: function(record) {
        Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.edit)
        this.down('button[action=delete]').show()
        this.callParent(arguments)
        this.updateButtonState()
    }
})

Ext.apply(Ext.util.Format, {
    pgnum: function(s) {
        return (s.slice(0,-5) + ' ' +
                s.slice(-5,-3) + ' ' +
                s.slice(-3,-1) + '-' +
                s.slice(-1))
    }
})


Ext.define('Bokf.view.org.PGForm', {
    extend: 'Bokf.view.org.PaymentProvider',
    alias: 'widget.pgform',

    title: 'Plusgirot',

    trackResetOnLoad: true,
    border: 0,
    fieldDefaults: {
        labelWidth: 150,
        allowBlank: false
    },
    items: [
        {xtype: 'displaytext', name: 'pgProcessing'},
        {xtype: 'displaytext', name: 'pgProcessed'},
        {xtype: 'displaytext', name: 'pgText'},
        {xtype: 'fieldset', name: 'pg',
         border: 0, padding: 0,
         items: [
             {name: 'pgnum_real', xtype: 'displayfield',
              renderer: Ext.util.Format.pgnum, width: 435},
             {name: 'pgnum', xtype: 'displayfield',
              renderer: Ext.util.Format.pgnum, width: 435},
             {name: 'account', xtype: 'accounteditor', width: 435,
              forceSelection: false, valueField: 'number'},
             {name: 'series', xtype: 'series', width: 435,
              forceSelection: false, autoSelect: false,
              valueField: 'name'}
         ]
        }
    ],
    buttons: [
        '->',
        {action: 'save'},
        {action: 'cancel'}
    ],

    l10n: {
        texts: {
            pgProcessing: '\
You have placed an order for connection of your plusgiro account to OCR processing. Your order is being handled. If you have not received a contract by mail it should arrive within a few days. \
Your order is not complete until you have signed the contract and returned it to Nordea.',
            pgProcessed: '\
Your plusgiro account as specified below is connected to OCR processing and automated delivery of incoming payments.',
            pgText: '\
Incoming payments will be registered on the account and in the series specified below.'
        },
        fieldLabels: {
            pgnum_real: 'Plusgiro connected to OCR account',
            pgnum: 'OCR account',
            account: 'Account for Plusgiro',
            series: 'Series for Plusgiro'
        },
        buttons: {
            save: 'Save',
            cancel: 'Cancel'
        }
    },

    listeners: {
        beforerender: function() {
            Bokf.lib.Utils.translateComponents(this, this.l10n.texts)
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
            Bokf.lib.Utils.translateButtons(this, this.l10n.buttons)

            this.updateButtonState()
        },

        dirtychange: function() {
            this.updateButtonState()
        },

        validitychange: function () {
            this.updateButtonState()
        }
    },

    updateButtonState: function() {
        var record = this.getRecord()
        var dirty = (record === undefined || this.isDirty())

        this.down('button[action=cancel]').setDisabled(!dirty)
        this.down('button[action=save]').setDisabled(!dirty || !this.isValid())
    },

    loadRecord: function(record) {
        var processed = !!record.get('pgnum')
        this.down('[name=pgProcessing]').setVisible(!processed)
        this.down('[name=pgProcessed]').setVisible(processed)
        this.callParent(arguments)
    }
})

Ext.define('Bokf.view.org.PaysonProvider', {
    extend: 'Bokf.view.org.PaymentProvider',
    alias: 'widget.payson',

    title: 'Payson',

    trackResetOnLoad: true,
    border: 0,
    fieldDefaults: {
        labelWidth: 150
    },
    defaults: {
        width: 435,
        allowBlank: false
    },
    items: [
        {xtype: 'displayhtml', name: 'paysonText', width: '100%'},
        {name: 'receiverEmail', xtype: 'textfield', vtype: 'email'},
        {name: 'apiUserId', xtype: 'textfield'},
        {name: 'apiPassword', xtype: 'textfield'},
        {name: 'account', xtype: 'accounteditor',
         forceSelection: false, valueField: 'number' },
        {name: 'series', xtype: 'series',
         forceSelection: false, autoSelect: false,
         valueField: 'name'}
    ],
    buttons: [
        {action: 'delete', hidden: true},
        '->',
        {action: 'save' },
        {action: 'cancel' }
    ],

    l10n: {
        createTexts: {
            paysonText: 'You can connect Payson payments to the web shop. If you do so Eutaxia will automatically create verifications from incoming payments. <a href="http://clk.tradedoubler.com/click?p=194865&a=2359572&g=19014578&url=/account/create" target="_blank">Create account at Payson</a>'
        },
        editTexts: {
            paysonText: 'Your Payson account as specified below is set up for use in the web shop. Incoming payments will be registered on the account and in the series specified below.'
        },
        fieldLabels: {
            account: 'Account',
            series: 'Series',
            apiUserId: 'Agent ID',
            apiPassword: 'MD5-key',
            receiverEmail: 'Email address'
        },
        buttons: {
            create: {
                save: 'Create',
                cancel: 'Cancel'
            },
            edit: {
                'delete': 'Delete',
                save: 'Save',
                cancel: 'Cancel'
            }
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
            if (!this.getRecord()) {
                Bokf.lib.Utils.translateComponents(this, this.l10n.createTexts)
                Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.create)
            } else {
                Bokf.lib.Utils.translateComponents(this, this.l10n.editTexts)
                Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.edit)
            }
        },

        beforerender: function() {
            this.updateButtonState()
        },

        dirtychange: function() {
            this.updateButtonState()
        },

        validitychange: function () {
            this.updateButtonState()
        }
    },

    updateButtonState: function() {
        var record = this.getRecord()
        var dirty = (record === undefined || this.isDirty())

        this.down('button[action=cancel]').setDisabled(!dirty)
        this.down('button[action=save]').setDisabled(!dirty || !this.isValid())
    },

    loadRecord: function(record) {
        Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.edit)
        this.down('button[action=delete]').show()
        this.callParent(arguments)
        this.updateButtonState()
    }
})


Ext.define('Bokf.view.org.SeqrProvider', {
    // xxx this is *very* similar to PaysonProvider. Share some code?
    extend: 'Bokf.view.org.PaymentProvider',
    alias: 'widget.seqr',

    title: 'SEQR',

    trackResetOnLoad: true,
    border: 0,
    fieldDefaults: {
        labelWidth: 150
    },
    defaults: {
        width: 435,
        allowBlank: false
    },
    items: [
        {xtype: 'displayhtml', name: 'seqrText', width: '100%'},
        {name: 'principalId', xtype: 'textfield'},
	{name: 'password', xtype: 'textfield'},
	{name: 'soapUrl', xtype: 'textfield'},
        {name: 'account', xtype: 'accounteditor',
         forceSelection: false, valueField: 'number' },
        {name: 'series', xtype: 'series',
         forceSelection: false, autoSelect: false,
         valueField: 'name'}
    ],
    buttons: [
        {action: 'delete', hidden: true},
        '->',
        {action: 'save' },
        {action: 'cancel' }
    ],

    l10n: {
	createTexts: {
	    seqrText: 'You can connect SEQR payments to the web shop. If you do so Eutaxia will automatically create verifications from incoming payments. <a href="https://www.seqr.com/" target="_blank">Read about SEQR</a>.'
	},
	editTexts: {
	    seqrText: 'Your SEQR account as specified below is set up for use in the web shop. Incoming payments will be registered on the account and in the series specified below.'
	},
	fieldLabels: {
            account: 'Account',
	    series: 'Series',
	    soapUrl: 'SOAP URL',
            principalId: 'Terminal ID',
	    password: 'Terminal password'
        },
        buttons: {
            create: {
                save: 'Create',
                cancel: 'Cancel'
            },
            edit: {
                'delete': 'Delete',
                save: 'Save',
                cancel: 'Cancel'
            }
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
            if (!this.getRecord()) {
                Bokf.lib.Utils.translateComponents(this, this.l10n.createTexts)
                Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.create)
            } else {
                Bokf.lib.Utils.translateComponents(this, this.l10n.editTexts)
                Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.edit)
            }
        },

        beforerender: function() {
            this.updateButtonState()
        },

        dirtychange: function() {
            this.updateButtonState()
        },

        validitychange: function () {
            this.updateButtonState()
        }
    },

    updateButtonState: function() {
        var record = this.getRecord()
        var dirty = (record === undefined || this.isDirty())

        this.down('button[action=cancel]').setDisabled(!dirty)
        this.down('button[action=save]').setDisabled(!dirty || !this.isValid())
    },

    loadRecord: function(record) {
        Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.edit)
        this.down('button[action=delete]').show()
        this.callParent(arguments)
        this.updateButtonState()
    }
})


Ext.define('Bokf.view.org.StripeProvider', {
    extend: 'Bokf.view.org.PaymentProvider',
    alias: 'widget.stripe',

    requires: ['Ext.form.action.StandardSubmit'],

    title: 'Stripe',

    standardSubmit: true,

    trackResetOnLoad: true,
    border: 0,
    fieldDefaults: {
	labelWidth: 150
    },
    defaults: {
	width: 435,
	allowBlank: false
    },
    items: [
	{xtype: 'displayhtml', name: 'stripeText', width: '100%'},
	{xtype: 'displayfield', name: 'display_name', hidden: true},
	{xtype: 'displayfield', name: 'stripe_email', hidden: true},
	{name: 'account', xtype: 'accounteditor',
	 forceSelection: false, valueField: 'number' },
	{name: 'series', xtype: 'series',
	 forceSelection: false, autoSelect: false,
	 valueField: 'name'}
    ],
    buttons: [
	{action: 'delete', hidden: true},
	'->',
	{action: 'save' },
	{action: 'cancel' }
    ],

    l10n: {
	createTexts: {
	    stripeText: 'You can connect Stripe payments to the web shop. If you do so Eutaxia will automatically create verifications from incoming payments. <a href="https://stripe.com/" target="_blank">Read about Stripe</a>.'
	},
	editTexts: {
	    stripeText: 'Your Stripe account as specified below is set up for use in the web shop. Incoming payments will be registered on the account and in the series specified below.'
	},
	fieldLabels: {
	    display_name: 'Stripe account',
	    stripe_email: 'E-mail',
	    account: 'Account',
	    series: 'Series'
	},
	buttons: {
	    create: {
		save: 'Create',
		cancel: 'Cancel'
	    },
	    edit: {
		'delete': 'Delete',
		save: 'Save',
		cancel: 'Cancel'
	    }
	}
    },

    listeners: {
	afterrender: function() {
	    Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
	    if (!this.getRecord()) {
		Bokf.lib.Utils.translateComponents(this, this.l10n.createTexts)
		Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.create)
	    } else {
		Bokf.lib.Utils.translateComponents(this, this.l10n.editTexts)
		Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.edit)
	    }
	},

	beforerender: function() {
	    this.updateButtonState()
	},

	dirtychange: function() {
	    this.updateButtonState()
	},

	validitychange: function () {
	    this.updateButtonState()
	}
    },

    updateButtonState: function() {
	var record = this.getRecord()
	var dirty = (record === undefined || this.isDirty())

	this.down('button[action=cancel]').setDisabled(!dirty)
	this.down('button[action=save]').setDisabled(!dirty || !this.isValid())
    },

    loadRecord: function(record) {
	Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.edit)
	this.down('button[action=delete]').show()
	this.down('displayfield[name=display_name]').show()
	this.down('displayfield[name=stripe_email]').show()
	this.callParent(arguments)
	this.updateButtonState()
    }
})


Ext.define('Bokf.view.org.SwishProvider', {
    extend: 'Bokf.view.org.PaymentProvider',
    alias: 'widget.swish',
    requires: ['Ext.form.action.StandardSubmit'],

    title: 'Swish',

    standardSubmit: true,

    trackResetOnLoad: true,
    border: 0,
    fieldDefaults: {
        labelWidth: 150
    },
    defaults: {
        width: 435,
        allowBlank: false
    },
    items: [
        {xtype: 'displaytext', name: 'intro', width: '100%',
         tpl: '<p>{0}</p>'},
        {xtype: 'textfield', name: 'swish_id'},
        {name: 'account', xtype: 'accounteditor',
         forceSelection: false, valueField: 'number' },
        {name: 'series', xtype: 'series',
         forceSelection: false, autoSelect: false,
         valueField: 'name'},
        {name: 'cert_expires', xtype: 'textfield', readOnly: true,
         hidden: true, allowBlank: true},
        {name: 'cert-missing', xtype: 'displaytext', hidden: true},
        {xtype: 'fieldset', collapsible: true, collapsed: true,
         width: null, name: 'cert-fs', hidden: true,
         defaults: {
             xtype: 'textarea',
             resizable: true,
             cols: 80,
             rows: 17,
             cls: 'monospace',
             labelAlign: 'top'
         },
         items: [
             {xtype: 'displayhtml', name: 'certinfo', width: '100%'},
             {name: 'csr', readOnly: true},
             {name: 'cert'}
         ]
        }
    ],
    buttons: [
        {action: 'delete', hidden: true},
        '->',
        {action: 'save' },
        {action: 'cancel' }
    ],

    l10n: {
        createTexts: {
            intro: 'You can connect Swish payments to the web shop. If you do so Eutaxia will automatically create verifications from incoming payments. <a href="https://www.getswish.se/" target="_blank">Read about Swish</a>.'
        },
        editTexts: {
            'cert-missing': 'You have not yet created a certificate. You must do so in order to use Swish in your web shop. Please open the Certificate management section and follow the instructions to generate a certificate.',
            intro: 'Your Swish account as specified below is set up for use in the web shop. Incoming payments will be registered on the account and in the series specified below.',
            certinfo: '<p>In order to use Swish, you need to generate a certificate that will be used for secure communication between Eutaxia and Swish.</p> To do this, log in to the Swish Certificate Management at <a href="https://comcert.getswish.net/">https://comcert.getswish.net/</a>, and enter your organizational number and your Swish number.<br> Choose the <em>New certificate</em> tab, and paste the data from the <em>Certificate signing request</em> field below. The Certificate request is in <em>PEM</em> format, and you need to specify that in the Swish Certificate Management tool. When you have generated a Certificate, copy and paste it into the empty field "Certificate" below.'
        },
        certTexts: {
            title: 'Certificate management'
        },
        fieldLabels: {
            swish_id: 'Swish ID',
            account: 'Account',
            series: 'Series',
            csr: 'Certificate signing request',
            cert: 'Certificate',
            cert_expires: 'Certificate expiry'
        },
        buttons: {
            create: {
                save: 'Create',
                cancel: 'Cancel'
            },
            edit: {
                'delete': 'Delete',
                save: 'Save',
                cancel: 'Cancel'
            }
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
            this.down('fieldset[name=cert-fs]').setTitle(this.l10n.certTexts.title)
            if (!this.getRecord()) {
                Bokf.lib.Utils.translateComponents(this, this.l10n.createTexts)
                Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.create)
            } else {
                Bokf.lib.Utils.translateComponents(this, this.l10n.editTexts)
                Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.edit)
            }
        },

        beforerender: function() {
            this.updateButtonState()
        },

        dirtychange: function() {
            this.updateButtonState()
        },

        validitychange: function () {
            this.updateButtonState()
        }
    },

    updateButtonState: function() {
        var record = this.getRecord()
        var dirty = (record === undefined || this.isDirty())
        this.down('button[action=cancel]').setDisabled(!dirty)
        this.down('button[action=save]').setDisabled(!dirty || !this.isValid())
    },

    loadRecord: function(record) {
        Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.edit)
        this.down('button[action=delete]').show()
        this.down('textarea[name=csr]').show()
        this.down('textarea[name=cert]').show()
        this.down('fieldset[name=cert-fs]').show()
        if (!record.get('cert')) {
            this.down('displaytext[name=cert-missing]').show()
            this.down('[name=cert_expires]').hide()
        } else {
            this.down('displaytext[name=cert-missing]').hide()
            this.down('[name=cert_expires]').show()
        }
        this.callParent(arguments)
        this.updateButtonState()
    }
})


Ext.define('Bokf.view.org.IzettleProvider', {
    extend: 'Bokf.view.org.PaymentProvider',
    alias: 'widget.izettle',

    title: 'iZettle',

    trackResetOnLoad: true,
    border: 0,
    fieldDefaults: {
        labelWidth: 150
    },
    defaults: {
        allowBlank: false
    },
    items: [
        {xtype: 'displaytext', name: 'izettleText'},
        {name: 'series', xtype: 'series', width: 435,
         forceSelection: false, autoSelect: false,
         valueField: 'name'},
        {name: 'account', xtype: 'accounteditor', width: 435,
         forceSelection: false, valueField: 'number' },
        {name: 'cash_account', xtype: 'accounteditor', width: 435,
         forceSelection: false, valueField: 'number' },
        {name: 'fee_account', xtype: 'accounteditor', width: 435,
         forceSelection: false, valueField: 'number' }
    ],
    buttons: [
        {action: 'delete', hidden: true},
        '->',
        {action: 'save' },
        {action: 'cancel' }
    ],

    l10n: {
        createTexts: {
            izettleText: 'You can import transactions from iZettle to do automatic accounting of incoming payments. To do so, you must first specify under which series and account to file the book keeping data for the sales.'
        },
        editTexts: {
            izettleText: 'You can import transactions from iZettle to do automatic accounting of incoming payments. To do so, you must first specify under which series and account to file the book keeping data for the sales.'
        },
        fieldLabels: {
            account: 'Account for card sales',
            fee_account: 'Account for iZettle card sales fee',
            cash_account: 'Account for cash sales',
            series: 'Series'
        },
        buttons: {
            create: {
                save: 'Create',
                cancel: 'Cancel'
            },
            edit: {
                'delete': 'Delete',
                save: 'Save',
                cancel: 'Cancel'
            }
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
            if (!this.getRecord()) {
                Bokf.lib.Utils.translateComponents(this, this.l10n.createTexts)
                Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.create)
            } else {
                Bokf.lib.Utils.translateComponents(this, this.l10n.editTexts)
                Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.edit)
            }
        },

        beforerender: function() {
            this.updateButtonState()
        },

        dirtychange: function() {
            this.updateButtonState()
        },

        validitychange: function () {
            this.updateButtonState()
        }
    },

    updateButtonState: function() {
        var record = this.getRecord()
        var dirty = (record === undefined || this.isDirty())

        this.down('button[action=cancel]').setDisabled(!dirty)
        this.down('button[action=save]').setDisabled(!dirty || !this.isValid())
    },

    loadRecord: function(record) {
        Bokf.lib.Utils.translateButtons(this, this.l10n.buttons.edit)
        this.down('button[action=delete]').show()
        this.callParent(arguments)
        this.updateButtonState()
    },

    setStores: function(seriesStore, accountsStore) {
        var seriesSelector = this.down('series')
        var accountSelector = this.down('accounteditor[name=account]')
	var fee_accountSelector = this.down('accounteditor[name=fee_account]')
	var cash_accountSelector = this.down('accounteditor[name=cash_account]')
        seriesSelector.bindStore(seriesStore)
        accountSelector.bindStore(accountsStore)
	fee_accountSelector.bindStore(accountsStore.clone())
	cash_accountSelector.bindStore(accountsStore.clone())
    }
})


Ext.define('Bokf.SubscriptionUtils', {
    singleton: true,

    bindStores: function(accounting, seriesSelector, accountSelector) {
        var seriesStore
        var accountStore
	var fee_accountStore
	var cash_accountStore
        if (accounting == null || accounting == undefined) {
            seriesStore = Ext.create('Ext.data.Store', {
                fields: ['name', 'description']
            })
            accountStore = Ext.create('Ext.data.Store', {
                fields: ['name', 'number', 'display']
            })
	    fee_accountStore = Ext.create('Ext.data.Store', {
                fields: ['name', 'number', 'display']
			})
	    cash_accountStore = Ext.create('Ext.data.Store', {
                fields: ['name', 'number', 'display']
            })
        } else {
            var filter = {id: 'accounting',
                          property: 'accounting',
                          value: accounting.get('id')}

            var id = accounting.get('id')
            seriesStore = Ext.create('Bokf.store.VerificationSeries')
            seriesStore.filter(filter)
            seriesStore.load()

            accountStore = Ext.create('Bokf.store.Accounts')
            accountStore.filter(filter)
            accountStore.load()

            fee_accountStore = Ext.create('Bokf.store.Accounts')
            fee_accountStore.filter(filter)
            fee_accountStore.load()

	    cash_accountStore = Ext.create('Bokf.store.Accounts')
            cash_accountStore.filter(filter)
            cash_accountStore.load()
 	}

        seriesSelector.bindStore(seriesStore)
        accountSelector.bindStore(accountStore)
	fee_accountSelector.bindStore(fee_accountStore)
	cash_accountSelector.bindStore(cash_accountStore)
    }
})
