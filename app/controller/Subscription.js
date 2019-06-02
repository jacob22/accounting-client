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

Ext.define('Bokf.controller.Subscription', {
    extend: 'Ext.app.Controller',

    requires: [
        'Bokf.lib.Utils'
    ],

    id: 'subscription',

    refs: [
        {ref: 'admin', selector: 'admin'},
        {ref: 'org', selector: 'admin org-view'},

        {ref: 'subscriptionPanel', selector: 'subscription'},
        {ref: 'subscribeButton', selector: 'subscription button[action=subscribe]'},
        {ref: 'nonSubscriberPanel', selector: 'subscription [name=nonsubscriber-container]'},
        {ref: 'subscriberPanel', selector: 'subscription [name=subscriber-container]'},

        {ref: 'paymentProviders', selector: 'paymentproviders' },
        {ref: 'providerCreator', selector: 'paymentproviders paymentprovidercreator'},
        {ref: 'simulatorProviderCreator', selector: 'paymentproviders paymentprovidercreator paymentsimulator'},
        {ref: 'providerEditor', selector: 'paymentproviders [name=paymentprovidereditor]'},

        {ref: 'paysonProviderCreator', selector: 'paymentproviders paymentprovidercreator payson'},
        {ref: 'seqrProviderCreator', selector: 'paymentproviders paymentprovidercreator seqr'},
	{ref: 'stripeProviderCreator', selector: 'paymentproviders paymentprovidercreator stripe'},
        {ref: 'swishProviderCreator', selector: 'paymentproviders paymentprovidercreator swish'},
        {ref: 'izettleProviderCreator', selector: 'paymentproviders paymentprovidercreator izettle'},

        {ref: 'PGOrderForm', selector: 'paymentproviders pgorder'}
    ],

    l10n: {
        subscriber: {
            title: 'Upgrade to Standard organisation',
            msg: ('\
This will upgrade this organisation to a Standard organisation. \
An invoice will be sent to the registered email address {email}.'),
            buttonText: {
                cancel: 'Cancel',
                ok: 'Upgrade'
            },
            loadMask: 'Upgrading...'
        },
        pg: {
            title: 'Order OCR connection',
            msg: ('\
This will place an order for connecting plusgiro account {pg} to OCR processing. \
An invoice will be sent to the registered email address {email}.'),
            buttonText: {
                cancel: 'Cancel',
                ok: 'Place order'
            },
            loadMask: 'Placing order...'
        },
        deleteProvider: {
            title: 'Delete provider',
            msg: 'Are you sure you want to delete this provider? You will no longer be able to receive payments through the provider and payments that have not yet been entered into the system must be manually handled.',
            buttonText: {
                ok: 'Delete provider',
                cancel: 'Cancel'
            },
            loadMask: 'Removing provider...'
        }
    },

    init: function init(app) {
        this.control({
            'subscription button[action=subscribe]': {
                click: this.subscribe
            },

            'paymentproviders [name=paymentprovidereditor] button[action=save]': {
                click: this.saveProvider
            },

            'paymentproviders button[action=cancel]': {
                click: this.cancel
            },

            'paymentproviders [name=paymentprovidereditor] button[action=delete]': {
                click: this.deleteProvider
            },

            // specific providers

            'paymentproviders paymentprovidercreator pgorder button[action=connectpg]': {
                click: this.connectpg
            },

            'paymentproviders paymentprovidercreator paymentsimulator button[action=save]': {
                click: this.createSimulatorProvider
            },

            'paymentproviders paymentprovidercreator payson button[action=save]': {
                click: this.createPaysonProvider
            },

            'paymentproviders paymentprovidercreator seqr button[action=save]': {
                click: this.createSeqrProvider
	    },

	    'paymentproviders paymentprovidercreator stripe button[action=save]': {
		click: this.createStripeProvider
            },

            'paymentproviders paymentprovidercreator swish button[action=save]': {
                click: this.createSwishProvider
            },

            'paymentproviders paymentprovidercreator izettle button[action=save]': {
		click: this.createIzettleProvider
	    }
	})

        this.listen({
            controller: {
                '*': {
                    orgselected: this._orgSelected
                }
            }
        })
    },

    getOrgsStore: function getOrgsStore() {
        return Ext.getStore('orgs')
    },

    _orgSelected: function(org, implicit, loader) {
        if (implicit) {
            // we only need to bother when the org view is raised
            return
        }
        Bokf.lib.Utils.callAtShow([this.getAdmin(), this.getOrg()],
                                  this.orgSelected, this,
                                  org, implicit, loader)
    },

    orgSelected: function(org, implicit, loader) {
        this.getSubscriptionPanel().hide()
        this.getPaymentProviders().hide()
        if (org.phantom || !org.isMember()) {
            return
        }
        loader.incref('load payment providers')
        Bokf.lib.Utils.waitForStores([org.accountings(),
                                      org.simulatorprovider(),
                                      org.plusgiroprovider(),
                                      org.paysonprovider(),
				      org.seqrprovider(),
                                      org.stripeprovider(),
                                      org.swishprovider(),
				      org.izettleprovider()], function() {
            this.setupView(org, loader)
            loader.decref('load payment providers')
        }, this)
    },

    setupView: function(org, loader) {
        loader.incref('render subscription view')
        var subscriber = org.get('subscriptionLevel').indexOf('subscriber') != -1
        var providerTypeStore = Ext.getStore('paymentprovidertype')
        this.getSubscriberPanel().setVisible(subscriber)
        this.getNonSubscriberPanel().setVisible(!subscriber)

        if (!subscriber) {
            providerTypeStore.filter({property: 'id',
                                      value: /(empty|paymentsimulator)/})
        } else {
            providerTypeStore.clearFilter()
            // Re-read data from array in proxy, since it may have been filtered
            providerTypeStore.load()
        }

        this.getProviderCreator().reset()

        var editor = this.getProviderEditor()
        editor.removeAll()

        var needStores = [this.getProviderCreator()]

        var createProvider = function(record, xtype) {
            var component = Ext.createByAlias('widget.' + xtype)
            component.loadRecord(record)
            editor.add(component)
            editor.add(Ext.createByAlias('widget.component', {html: '<hr/>'}))
            needStores.push(component)
            return component
        }

        var stopCreationOf = function(providertype) {
            providerTypeStore.filter({property: 'id',
                                      operator: '!=',
                                      value: providertype})
        }

        org.simulatorprovider().each(function(record) {
            createProvider(record, 'paymentsimulator')
            stopCreationOf('paymentsimulator')
        });

        org.plusgiroprovider().each(function(record) {
            createProvider(record, 'pgform')
            stopCreationOf('pgform')
        });

        org.paysonprovider().each(function(record) {
            createProvider(record, 'payson')
            stopCreationOf('payson')
        });

        org.seqrprovider().each(function(record) {
            createProvider(record, 'seqr')
            stopCreationOf('seqr')
        });

        org.stripeprovider().each(function(record) {
            createProvider(record, 'stripe')
            stopCreationOf('stripe')
        });

        org.swishprovider().each(function(record) {
            createProvider(record, 'swish')
            stopCreationOf('swish')
        });

        org.izettleprovider().each(function(record) {
            createProvider(record, 'izettle')
            stopCreationOf('izettle')
        });

        var seriesStore = org.currentSeries(true)
        var accountsStore = org.currentAccounts(true)

        Bokf.lib.Utils.waitForStores([seriesStore, accountsStore], function() {
            Ext.each(needStores, function(component) {
                component.setStores(seriesStore.clone(),
                                    accountsStore.clone())
            });
            this.getSubscriptionPanel().show()
            this.getPaymentProviders().show()
            loader.decref('render subscription view')
        }, this)
    },

    callBLM: function(method, params, org, l10n, templateValues) {
        Ext.Msg.show({
            title: l10n.title,
            msg: new Ext.Template(l10n.msg).apply(templateValues),
            buttons: Ext.Msg.OKCANCEL,
            buttonText: l10n.buttonText,
            defaultFocus: 'cancel',
            fn: function(button, text) {
                if (button != 'ok') {
                    return
                }
                var view = this.getAdmin()
                view.setLoading(l10n.loadMask)

                params.push(function(result) {
                    view.setLoading(false)
                    var store = this.getOrgsStore()
                    store.reload({
                        scope: this,
                        callback: function() {
                            var reloaded = store.getById(org.get('id'))
                            var orgController = this.getController('Org')
                            orgController.show(reloaded)
                        }
                    })
                }) // callback
                params.push(this) // scope
                method.call.apply(null, params)
            },
            scope: this
        })
    },

    /* subscription */
    subscribe: function() {
        Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
            var captionData = org.getData()
            var method = blm.accounting.subscribe
            var params = [[org.get('id')], ['subscriber']]
            this.callBLM(method, params, org, this.l10n.subscriber, captionData)
        }, this)
    },

    /* generic payment provider */
    saveProvider: function(button) {
        // form can be either pgconfig or pgsimulator
        var form = button.up('form')
        var provider = form.getRecord()
        provider.set(form.getValues())
        provider.save({
            scope: this,
            callback: function(records, operation, success) {
                if (!success) {
                    provider.reject()
                } else {
                    var store = provider.store
                    store.reload({
                        scope: this,
                        callback: function(records, operation, success) {
                            var record = store.getById(provider.get('id'))
                            form.loadRecord(record)
                        }
                    })
                }
            }
        })
    },

    cancel: function(button) {
        button.up('form').getForm().reset()
        var providercreator = button.up('paymentprovidercreator')
        if (providercreator) {
            providercreator.reset()
        }
    },

    deleteProvider: function(button) {
        Ext.Msg.show({
            title: this.l10n.deleteProvider.title,
            msg: this.l10n.deleteProvider.msg,
            buttons: Ext.Msg.OKCANCEL,
            buttonText: this.l10n.deleteProvider.buttonText,
            defaultFocus: 'cancel',
            scope: this,
            fn: function(choice, text) {
                if (choice != 'ok') {
                    return
                }

                var loader = new Bokf.lib.LoadMaskController(
                    this.getAdmin(), this.l10n.deleteProvider.loadMask, true, 'removing provider')
                Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
                    var record = button.up('paymentprovider').getRecord()
                    record.destroy({
                        scope: this,
                        callback: function() {
                            this.setupView(org, loader)
                            loader.decref('removing provider')
                        }
                    })
                }, this)
            }
        })
    },

    /* plusgirot */
    connectpg: function() {
        Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
            var captionData = org.getData()
            var method = blm.accounting.orderPG
            var values = this.getPGOrderForm().getValues()
            var params = [[org.get('id')],
                          [values.contact],
                          [values.contactPhone],
                          [values.contactEmail],
                          [values.pgnum],
                          [values.pgaccount],
                          [values.pgseries]]
            this.callBLM(method, params, org, this.l10n.pg, captionData)
        }, this)
    },

    /* simulator */
    createSimulatorProvider: function(button) {
        var loader = new Bokf.lib.LoadMaskController(this.getAdmin(), 'saving', true, 'saving provider')
        Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
            var data = this.getSimulatorProviderCreator().getValues()
            data.org = org.get('id')
            var record = Ext.create('Bokf.model.SimulatorProvider', data)
            record.save({
                scope: this,
                success: function() {
                    org.simulatorprovider().reload({
                        scope: this,
                        callback: function(records, operation, success) {
                            if (success) {
                                this.setupView(org, loader)
                            }
                            loader.decref('saving provider')
                        }
                    })
                },
                failure: function() {
                    loader.decref('saving provider')
                }
            })
        }, this)
    },

    /* payson */
    createPaysonProvider: function(button) {
        var loader = new Bokf.lib.LoadMaskController(this.getAdmin(), 'saving', true, 'saving provider')
        Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
            var data = this.getPaysonProviderCreator().getValues()
            data.org = org.get('id')
            var record = Ext.create('Bokf.model.PaysonProvider', data)
            record.save({
                scope: this,
                success: function() {
                    org.paysonprovider().reload({
                        scope: this,
                        callback: function(records, operation, success) {
                            if (success) {
                                this.setupView(org, loader)
                            }
                            loader.decref('saving provider')
                        }
                    })
                },
                failure: function() {
                    loader.decref('saving provider')
                }
            })
        }, this)
    },

    /* seqr */
    createSeqrProvider: function(button) {
        var loader = new Bokf.lib.LoadMaskController(
            this.getAdmin(), 'saving', true, 'saving seqr provider')
        Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
            var data = this.getSeqrProviderCreator().getValues()
            data.org = org.get('id')
            var record = Ext.create('Bokf.model.SeqrProvider', data)
            record.save({
                scope: this,
                success: function() {
                    org.seqrprovider().reload({
                        scope: this,
                        callback: function(records, operation, success) {
                            if (success) {
                                this.setupView(org, loader)
                            }
                            loader.decref('saving seqr provider')
                        }
                    })
                },
                failure: function() {
                    loader.decref('saving seqr provider')
                }
            })
        }, this)
    },

    createStripeProvider: function(button) {
	Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
	    var form = this.getStripeProviderCreator()
	    var url = '/providers/stripe/authorize/' + org.get('id')
	    form.submit({url: url})
	}, this)
    },

    /* swish */
    createSwishProvider: function(button) {
        var loader = new Bokf.lib.LoadMaskController(
            this.getAdmin(), 'saving', true, 'saving seqr provider')
        Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
            var data = this.getSwishProviderCreator().getValues()
            data.org = org.get('id')
            var record = Ext.create('Bokf.model.SwishProvider', data)
            record.save({
                scope: this,
                success: function() {
                    org.swishprovider().reload({
                        scope: this,
                        callback: function(records, operation, success) {
                            if (success) {
                                this.setupView(org, loader)
                            }
                            loader.decref('saving swish provider')
                        }
                    })
                },
                failure: function() {
                    loader.decref('saving swish provider')
                }
            })
        }, this)
    },

    createIzettleProvider: function(button) {
        var loader = new Bokf.lib.LoadMaskController(this.getAdmin(), 'saving', true, 'saving provider')
        Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
            var data = this.getIzettleProviderCreator().getValues()
            data.org = org.get('id')
            var record = Ext.create('Bokf.model.IzettleProvider', data)
            record.save({
                scope: this,
                success: function() {
                    org.izettleprovider().reload({
                        scope: this,
                        callback: function(records, operation, success) {
                            if (success) {
                                this.setupView(org, loader)
                            }
                            loader.decref('saving provider')
                        }
                    })
                },
                failure: function() {
                    loader.decref('saving provider')
                }
            })
        }, this)
    }
})
