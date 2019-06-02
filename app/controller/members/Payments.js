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

Ext.define('Bokf.controller.members.Payments', {
    extend: 'Ext.app.Controller',
    requires: [
        'Bokf.lib.LoadMaskController',
        'Bokf.lib.Utils',
        'Bokf.lib.Waiter',
        'Bokf.store.Accounts',
        'Bokf.store.members.Payments',
        'Bokf.view.members.VerificationSuggestion'
    ],

    refs: [
        {ref: 'approveAll', selector: 'payments button[action=approveall]'},
        {ref: 'filter', selector: 'payments combo[name=filter]'},
        {ref: 'dateRange', selector: 'payments daterange'},
        {ref: 'payments', selector: 'payments'},
        {ref: 'viewPort', selector: 'vp'}
    ],

    l10n: {
        approve: {
            loadMask: 'Approving verification...',
            failure: {
                title: 'Error',
                msg: 'An error occured while appproving payment.'
            },
            success: {
                title: 'Payment approved',
                msg: 'The payment has been approved.'
            }
        },
        approveAll: {
            loadMask: 'Approving all verifications...',
            failure: {
                title: 'Error',
                msg: 'An error occured while appproving all payments.'
            },
            success: {
                title: 'Payments approved',
                msg: 'All matching payments have been approved.'
            },
            partial: {
                title: 'Payments approved',
                msg: '{0} of {1} payments have been approved. '+
                     'The remaining ones require manual intervention.'
            }
        },
        payment: {
            loadMask: 'Loading payment data...'
        },
        payments: {
            loadMask: 'Loading payments...'
        },
        unknownPayer: 'Payer unknown'
    },

    init: function () {
        this.control({
            'payments combo[name=filter]': {
                select: this.filterSelected
            },

            'payments button[action=search]': {
                click: this.search
            },

            'payments button[action=approveall]': {
                click: this.approveAllPayments
            },

            'payments payment': {
                beforeexpand: this.expandPayment
            },

            'payments payment > header button[action=approve]': {
                click: this.approveVerificationSuggestion
            },

            'verificationsuggestion transactions': {
                edit: this.transactionsEdited,
                afterdeleterecord: this.transactionsEdited,
                reconfigure: this._updateButtonState
            },
            'verificationsuggestion [name=verificationdata]': {
                dirtychange: function(form) {
                    this._updateButtonState(form.owner)
                }
            },

            'verificationsuggestion button[action=approve]': {
                click: this.approveUserVerification
            },

            'verificationsuggestion button[action=revert]': {
                click: this.revert
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

    approveUserVerification: function(button, event) {
        var panel = button.up('panel[name=payment]')
        var grid = panel.down('transactions')
        var form = panel.down('form')

        var transactions = grid.getStore()

        var data = form.getValues() // payment, date & series
        data.transactions = []

        transactions.each(function(transaction) {
            var account = transaction.get('account')
            var amount = transaction.get('amount')
            if (account && amount) {
                var transactionData = {
                    account: account,
                    amount: amount,
                    text: transaction.get('text')
                }
                data.transactions.push(transactionData)
            }
        });

        panel.setLoading(this.l10n.approve.loadMask)

        blm.members.approvePayment.call([data], function(result) {
            result = result[0]
            if (result.success) {
                var verification = result.verification
                var payments = this.getPayments()
                var sibling = panel.nextSibling() || panel.previousSibling()

                if (sibling) {
                    sibling.expand()
                }
                payments.remove(panel)
                payments.paymentsStore.reload()
            }
        }, this)
    },

    approveVerificationSuggestion: function(button, event) {
        event.stopEvent()
        var widget = button.up('payment')
        var id = widget.payment.get('id')
        this._approvePayments([id], this.l10n.approve)
        return false
    },

    approveAllPayments: function(button, event) {
        var store = button.up('payments').paymentsStore
        var ids = []
        store.each(function(record) {
            ids.push(record.get('id'))
        });
        this._approvePayments(ids, this.l10n.approveAll, true)
    },

    _approvePayments: function(payments, l10n, allowPartial) {
        var loader = new Bokf.lib.LoadMaskController(
            this.getViewPort(), l10n.loadMask, true,
            'approving payments')

        blm.members.approvePayments.call(payments, {
            scope: this,
            success: function(result, event, success, options) {
                var msgData = l10n.success
                var icon = Ext.Msg.INFO
                if (result.length < payments.length) {
                    if (allowPartial) {
                        msgData = l10n.partial
                    } else {
                        msgData = l10n.failure
                        icon = Ext.Msg.ERROR
                    }
                }

                Ext.Msg.show({
                    title: msgData.title,
                    msg: Ext.String.format(msgData.msg, result.length,
                                           payments.length),
                    buttons: Ext.Msg.OK,
                    icon: icon
                })

                var paymentsView = this.getPayments()
                Ext.each(result, function(paymentId) {
                    var query = Ext.String.format('payment[paymentId={0}]',
                                                  paymentId)
                    var widget = paymentsView.down(query)
                    if (widget) {
                        paymentsView.remove(widget)
                    }
                });
                this.getPayments().paymentsStore.reload()
            },
            failure: function(result, event, success, options) {
                if (l10n.failure) {
                    Ext.Msg.show({
                        title: l10n.failure.title,
                        msg: l10n.failure.msg,
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.ERROR
                    })
                }
            },
            callback: function(result, event, success, options) {
                loader.decref('approving payments')
            }
        })
    },

    _orgSelected: function(org, implicit, loadMask) {
        Bokf.lib.Utils.callAtShow(this.getPayments(), this.populate,
                                  this, org, loadMask)
    },

    filterSelected: function(combo, records) {
        var criteria = records[0].get('id')
        if (criteria == 'approved') {
            var value = this.getDateRange().getValue()
            if (value[0] == null && value[1] == null) {
                var start = new Date()
                start.setMonth(start.getMonth() - 1)
                var end = new Date()
                this.getDateRange().setValue(start, end)
            }
        }
    },

    search: function() {
        Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
            if (org) {
                var loader = new Bokf.lib.LoadMaskController(
                    this.getPayments(), this.l10n.loadMask, true, 'filtering')
                this.populate(org, loader)
                loader.decref('filtering')
            }
        }, this)
    },

    getMidnight: function(dateStr, midnight_after) {
        var d = Date.parse(dateStr) / 1000 + new Date().getTimezoneOffset() * 60
        if (midnight_after) {
            d += 86400
        }
        return d
    },

    populate: function(org, loader) {
        loader.restart(this.l10n.payments.loadMask, 'populating payments view')
        var payments = this.getPayments()

        var components = payments.query('[action=approveall]')
        Bokf.lib.Utils.setOEReadOnly(components, !org.isAccountant())

        Bokf.lib.Utils.waitForStores([org.accountings()], function() {
            var approved = this.getFilter().getValue() == 'approved'
            if (approved) {
                this.getApproveAll().hide()
            } else {
                this.getApproveAll().show()
            }
            filters = [
                {id: 'approved', property: 'approved', value: approved},
                {id: 'org', property: 'org', value: org.get('id')}
            ]

            var range = this.getDateRange().getValue()
            var dateRenderer = Ext.util.Format.dateRenderer('Y-m-d')

            if (range[0] || range[1]) {
                var start = dateRenderer(range[0])
                var end = dateRenderer(range[1])
                var op = null
                var value = null

                if (start && end) {
                    op = 'Between'
                    value = [start, end]
                } else if (start) {
                    op = 'GreaterEq'
                    value = start
                } else if (end) {
                    op = 'LessEq'
                    value = end
                }
                filter = {
                    id: 'range',
                    property: 'transaction_date',
                    value: {
                        op: op,
                        value: value
                    }
                }
                filters.push(filter)
            }

            var paymentStore = Ext.create('Bokf.store.members.Payments', {
                filters: filters
            })
            var accounts = org.currentAccounts(true)
            var series = org.currentSeries(true)
            payments.setup(paymentStore, accounts, series, org, loader)
            paymentStore.load()
            paymentStore.on('load', function() {
                // xxx remove preloading because it sometimes looses accounts
                //this._preload()
                loader.decref('populating payments view')
            }, this)
        }, this)
    },

    _preload: function(components) {
        var payments = this.getPayments()
        if (!payments.isVisible()) {
            //console.log('View not visible, aborting')
            return
        }
        if (!components) {
            components = payments.query('payment')
        }
        if (!components.length) {
            return
        }

        var component = components.splice(0, 1)[0]
        if (component.isDestroyed) {
            //console.log('Component destroyed, aborting')
            return
        }

        //console.log('preloading', component)
        this.load(component, Ext.Function.bind(function() {
            var task = new Ext.util.DelayedTask(function() {
                this._preload(components)
            }, this)
            var delay = 1
            task.delay(delay)
        }, this))
    },

    expandPayment: function(payment) {
        if (payment.loaded) {
            return true
        }
        var loader = new Bokf.lib.LoadMaskController(
            this.getViewPort(), this.l10n.payment.loadMask, true,
            'Expand payment')
        var task = new Ext.util.DelayedTask(function() {
            this.load(payment, function() {
                payment.loaded = true
                payment.expand()
                loader.decref('Expand payment')
            })
        }, this)
        task.delay(0)
        return false
    },

    load: function(container, callback) {
        var payment = container.payment
        var suggestVerification = !payment.get('approved')
        var widget

        if (suggestVerification) {
            widget = new Bokf.view.members.VerificationSuggestion()
            container.add(widget)
            var me = this
            blm.members.suggestVerification.call([payment.get('id')], function(result) {
                var suggestion = result[0]
                widget.suggestion = suggestion
                me.populateVerificationForm(widget)
                if (callback) {
                    callback()
                }
            })
        } else {
            widget = container
        }

        var name = Ext.ClassManager.getName(payment).toLowerCase()
        var alias = 'widget.paymentdetails-' + name.substring(name.lastIndexOf('.') + 1)
        var paymentDetails = Ext.createByAlias(alias)
        widget.add(paymentDetails)
        paymentDetails.loadRecord(payment)

        if (!suggestVerification && callback) {
            callback()
        }
    },

    populateVerificationForm: function(widget) {
        var container = widget.up('payment')
        var payment = container.payment
        var accounts = container.accountsStore
        var seriesStore = container.seriesStore
        var org = container.org
        var suggestion = widget.suggestion

        var transactions = Ext.create('Ext.data.Store', {
            model: 'Bokf.model.Transaction',
            proxy: 'memory'
        })

        var components = widget.query(
            'transactions, '+
                'transactions button, ' +
                'form[name=verificationdata] field')
        Bokf.lib.Utils.setOEReadOnly(components, !org.isAccountant())

        var seriesCombo = widget.down('series')
        // never autoselect series; either pick it from the verification
        // suggestion or let the user choose
        seriesCombo.autoSelect = false
        seriesCombo.bindStore(seriesStore)

        var grid = widget.down('transactions')
        grid.setAccountsStore(accounts)

        Ext.each(suggestion.transactions, function(transaction) {
            var id = transaction.account.id
            var number = transaction.account.number
            var data = {
                amount: transaction.amount.json,
                text: transaction.text
            }

            if (accounts.getById(transaction.account.id)) {
                data.account = id
            }
            var record = transactions.add(data)
        });

        var warning = widget.down('[name=warning]')
        Ext.each(suggestion.missingAccounts, function(number) {
            warning.addAccountNo(number)
        });

        warning.setHasPaymentProvider(suggestion.paymentProvider)
        grid.reconfigure(transactions)
        transactions.sync()

        var verForm = widget.down('form[name=verificationdata]').getForm()
        var series = seriesStore.getAt(seriesStore.find('name', suggestion.series))
        var values = {payment: payment.get('id'),
                      transaction_date: suggestion.transaction_date}
        if (series) {
            values.series = series.get('id')
        }
        verForm.setValues(values)
        this._updateButtonState(grid)
    },

    transactionsEdited: function(plugin) {
        var grid = plugin.grid
        this._updateButtonState(grid)
    },

    revert: function(button, event) {
        var panel = button.up('verificationsuggestion')
        this.populateVerificationForm(panel)
    },

    _updateButtonState: function(widget) {
        var panel = widget.up('verificationsuggestion')
        var form = panel.down('form[name=verificationdata]')
        var grid = panel.down('transactions')
        var revertButton = panel.down('button[action=revert]')
        var saveButton = panel.down('button[action=approve]')
        var store = grid.getStore()
        dirty = store.isDirty() || form.isDirty()
        revertButton.setDisabled(!dirty)
        saveButton.setDisabled(!grid.isValid())
    }
})
