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

Ext.define('Bokf.controller.Verifications', {
    extend: 'Ext.app.Controller',

    views: ['Verification'],

    requires: [
        'Bokf.lib.ApplicationState',
        'Bokf.lib.ObjectId',
        'Bokf.lib.TransactionTextEditor',
        'Bokf.store.Accounts',
        'Bokf.store.Verifications'
    ],

    refs: [
        {ref: 'form', selector: 'verification verificationform'},
        {ref: 'transactions', selector: 'verification transactions'},
        {ref: 'seriesCombo', selector: 'verification verificationform series'},
        {ref: 'numberField', selector: 'verification vernumber[name=number]'},
        {ref: 'dateField', selector: 'verification datefield[name=transaction_date]'},
        {ref: 'transactionsCard', selector:'verification container[name=transactions-card]'},
        {ref: 'saveButton', selector: 'verification transactions button[action=save]'},
        {ref: 'revertButton', selector: 'verification transactions button[action=revert]'},
        {ref: 'printButton', selector: 'verification transactions button[action=print]'},
        {ref: 'verification', selector: 'verification'},
        {ref: 'printFrame', selector: 'verification [name=printframe]'},
        {ref: 'viewPort', selector: 'vp'}
    ],

    l10n: {
        save: {
            loadMask: 'Saving',
            error: {
                title: 'Error',
                msg: 'Verification could not be saved.'
            },
            unexpectedVerificationNumber: {
                title: 'Verification number changed',
                msg: ('The verification number assigned to the verification '+
                      'number you just created was not the expected. The '+
                      'number assigned to the verification was expected to '+
                      'be {0}, but <b>{1}</b> was the number used. This is '+
                      'most likely caused by someone else creating a '+
                      'verification while you were working on this one.')
            },
            saveFailed: {
                title: 'Failed to save verification',
                msg: ('Could not save the verification. Perhaps someone else '+
                      'has edited it. Try reloading and saving again.')
            }
        },
        load: {
            loadMask: 'Loading verification...'
        },
        'new': {
            loadMask: 'Initialising new verification...'
        },
        print: {
            title: 'Print verification',
            msg: 'The verification is not saved. Do you want to save it before printing?',
            msgInvalid: "The verification is not valid and can't be saved. Print anyway?"
        }
    },

    init: function controller_init(app) {
        this.listen({
            controller: {
                '*': {
                    accountingselected: this._accountingSelected
                }
            }
        })

        var self = this

        this.control({
            'verification': {
                activate: function() {
                    var widget = this.getDateField()
                    // Wait 500 ms before setting focus, otherwise
                    // browser may still be busy rendering.
                    widget.focus(false, 500)
                }
            },

            'verification transactions button[action=save]' : {
                click: function() { self.save() }
            },

            'verification transactions button[action=revert]' : {
                click: this.revert
            },

            'verification transactions button[action=print]' : {
                'click': this.print
            },

            'verification series[name=series]': {
                change: {
                    fn: this.series_selected,
                    // Avoid launching multiple load masks (accounting
                    // selected vs. new verification initialisation)
                    // simultaneously by buffering the event
                    buffer: 1
                }
            },

            'verification textfield[name=number]' : {
                'change': {
                    fn: this.number_changed,
                    buffer: 500
                },
                'trigger4click': this.last_verification,
                'trigger5click': this.new_verification
            },

            'verification verificationform datefield[name=transaction_date]': {
                change: this.updateSaveState,
                specialkey: function(widget, event) {
                    // Poor man's keyboard navigation. Focus 0,0 in
                    // transaction grid on tab/enter.
                    // There are probably saner ways to do this.
                    if (event.getKey() == event.TAB ||
                        event.getKey() == event.ENTER) {
                        var plugin = this.getTransactions().editingPlugin
                        plugin.startEditByPosition({row: 0, column: 0})
                    }
                }
            },
            'verification transactions' : {
                edit: this.updateSaveState,
                afterdeleterecord: this.updateSaveState,
                kpplus: this.kpplus
            }
        })
    },

    _seriesStoreListener: null,
    displayTransactionsForm: function(seriesStore, loader) {
        var layout = this.getTransactionsCard().getLayout()

        if (this._seriesStoreListener) {
            this._seriesStoreListener.destroy()
        }

        if (!seriesStore) {
            layout.setActiveItem('empty')
            return
        }
        layout.setActiveItem('blank')

        if (seriesStore.count()) {
            layout.setActiveItem('transactions')
        } else {
            loader.incref('loading series')
            this._seriesStoreListener = seriesStore.on({
                datachanged: function() {
                    if (seriesStore.count()) {
                        layout.setActiveItem('transactions')
                        this._seriesStoreListener.destroy()
                        this._seriesStoreListener = null
                    }
                    loader.decref('loading series')
                },
                destroyable: true,
                scope: this
            })
        }
    },

    _accountingSelected: function(accounting, loader) {
        Bokf.lib.Utils.callAtShow(
            this.getVerification(), this.accountingSelected, this,
            accounting, loader)
    },

    accountingSelected: function(accounting, loader) {
        if (!accounting) {
            this.displayTransactionsForm(null, loader)
            return
        }

        Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
            this.getForm().setReadOnly(!org.isAccountant())
            this.getTransactions().setReadOnly(!org.isAccountant())
        }, this)

        var grid = this.getTransactions()
        var id = accounting.get('id')

        var accounts = Ext.create('Bokf.store.Accounts')
        accounts.filter({id: 'accounting', property: 'accounting', value: id})
        grid.setAccountsStore(accounts)
        accounts.load()

        var combo = this.getSeriesCombo()
        var series = accounting.verificationSeries()
        combo.bindStore(series)

        this.displayTransactionsForm(series, loader)

        var index = Ext.getStore('transactiontext')
        index.filterByOrg(accounting.get('org'))
        if (!index.count()) {
            // only load once, new items are added locally when
            // saving verifications
            index.load()
        }
    },

    last_verification: function(loadMask) {
        console.log('last_verification')
        loadMask = loadMask || this.setLoading(this.l10n.load.loadMask)
        loadMask.incref('new verification')

        var trans = this.getTransactions()
        var series = this.getSeriesCombo().getValue()

        blm.accounting.next_verification_data.call([series], {
            scope: this,
            success: function(result) {
                var verification = Ext.create('Bokf.model.Verification', {
                    accounting: result.accounting,
                    number: result.number - 1,
                    series: series
                })
                console.log('Creating verification for', result.number - 1)
                var form = this.getForm().getForm()
                form.loadRecord(verification)
            }
        })
    },

    new_verification: function(loadMask) {
        loadMask = loadMask || this.setLoading(this.l10n['new'].loadMask)
        loadMask.incref('new verification')

        var trans = this.getTransactions()
        var series = this.getSeriesCombo().getValue()

        blm.accounting.next_verification_data.call([series], {
            scope: this,
            success: function(result) {
                var verification = Ext.create('Bokf.model.Verification', {
                    accounting: result.accounting,
                    number: result.number,
                    series: series
                })

                var tstore = verification.transactions()
                trans.reconfigure(tstore)
                trans.displayBalance = true

                var form = this.getForm().getForm()

                // This is a hack to block the number change event
                // so that it does not trigger another loop of
                // load->new verification
                // For reasons unknown, suspendEvent(s) does not
                // do the trick.
                var numberField = this.getNumberField()
                var listener = numberField.on('change', function() {
                    // block further event listeners
                    return false
                }, this, {destroyable: true})

                form.loadRecord(verification)
                listener.destroy()

                var dateField = this.getDateField()
                // We want the user to consciously select a date,
                // so leave the day part out of the value we set.
                // However, default the calendar widget to the
                // correct date, using the feature added by
                // Bokf.lib.Date.
                var date = result.transaction_date
                dateField.setRawValue(date.slice(0, -2))
                dateField.setSuggestedPickerDate(date)
                dateField.focus()

                this.updateSaveState()
                loadMask.decref('new verification')
            }
        })
    },

    load: function(loadMask) {
        loadMask = loadMask || this.setLoading(this.l10n.load.loadMask)
        loadMask.incref('load')

        var form = this.getForm().getForm()
        var values = form.getValues()
        console.log('Load', values.number)
        Ext.create('Bokf.store.Verifications', {
            filters: [
                {property: 'series', value: values.series},
                {property: 'number', value: values.number}
            ]
        }).load({
            scope: this,
            callback: function(records, operation, success) {
                var trans = this.getTransactions()
                if (success && records.length) {
                    // will be enabled by reconfigure when store is loaded
                    //trans.down('transactionsgridview').enable()
                    // records should be exactly one long
                    form.loadRecord(records[0])
                    var tstore = records[0].transactions()
                    trans.displayBalance = false

                    // Sort by toid, as that is *presumably* the order
                    // in which they were entered.
                    // xxx more reliable sorting needed, of course
                    tstore.sort('id', 'ASC')
                    loadMask.incref('loading transactions')
                    tstore.load({
                        scope: this,
                        callback: function() {
                            trans.reconfigure(tstore)
                            this.updateSaveState()
                            loadMask.decref('loading transactions')
                        }
                    })
                } else if (success) {
                    // invalid verification number
                    trans.reconfigure({ model: Bokf.model.Transaction})
                    trans.down('transactionsgridview').disable()
                }
                loadMask.decref('load')
            }
        })
    },

    series_selected: function() {
        this.new_verification()
    },

    number_changed: function() {
        this.load()
    },

    revert: function() {
        this.load()
    },

    kpplus: function() {
        var dateField = this.getDateField()
        if (dateField.isValid()) {
            this.save()
        } else {
            dateField.focus()
        }
    },

    save: function(successfn) {
        var form = this.getForm().getForm()
        var grid = this.getTransactions()

        if (!grid.isValid() || !form.isValid()) {
            return
        }

        var loadMask = this.setLoading(this.l10n.save.loadMask)
        loadMask.incref('save verification')

        grid.editingPlugin.cancelEdit()

        var verification = form.getRecord()
        verification.set(form.getValues())

        var transactions = grid.store
        transactions.filterBy(function(transaction) {
            return !!(transaction.get('account') && transaction.get('amount'))
        })

        if (verification.phantom) {
            // Create new verification
            var expectedNumber = verification.get('number')
            var tdata = []
            transactions.each(function(transaction) {
                tdata.push(transaction.getData())
            });

            var data = {verification: verification.getData(),
                        transactions: tdata}

            blm.accounting.createVerification.call([data], {
                scope: this,
                success: function(result, event, success, options) {
                    result = result[0]
                    var verid = result.id
                    var number = result.number
                    if (number != expectedNumber) {
                        var l10n = this.l10n.save.unexpectedVerificationNumber
                        var msg = Ext.String.format(l10n.msg, expectedNumber,
                                                    number)
                        Ext.Msg.alert(l10n.title, msg)
                    }

                    if (successfn) {
                        successfn(result)
                    }

                    Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
                        // register all new transactions' texts in the local
                        // transaction index
                        var index = Ext.getStore('transactiontext')
                        index.register(org.get('id'), transactions)
                    })

                    var seen = {}
                    transactions.each(function(transaction) {
                        var account = transaction.get('account')
                        if (!(account in seen)) {
                            seen[account] = true
                            grid.accountsStore.getById(account).reload()
                        }
                    })
                    // start editing a new verification
                    this.new_verification(loadMask)
                },
                callback: function(result,event,success,options) {
                    loadMask.decref('save verification')
                }
            })

        } else {
            // Edit verification
            verification.set('version', verification.get('version') + 1)
            var tdata = []
            transactions.each(function(transaction) {
                transaction.set('version', verification.get('version'))
                tdata.push(transaction.getData())
            });
            var data = {verification: verification.getData(),
                        transactions: tdata}

            blm.accounting.editVerification.call([data], {
                scope: this,
                success: function(result, event, success, options) {
                    result = result[0]

                    if (successfn) {
                        successfn(result)
                    }

                    Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
                        // register all new transactions' texts in the local
                        // transaction index
                        var index = Ext.getStore('transactiontext')
                        index.register(org.get('id'), transactions)
                    })

                    var seen = {}
                    transactions.each(function(transaction) {
                        var account = transaction.get('account')
                        if (!(account in seen)) {
                            seen[account] = true
                            grid.accountsStore.getById(account).reload()
                        }
                    })

                    this.load(loadMask)
                },
                callback: function(result, event, success, options) {
                    if (!success) {
                        verification.set('version', verification.get('version') - 1)
                        transactions.each(function(transaction) {
                            transaction.set('version', verification.get('version'))
                        });
                        var l10n = this.l10n.save.saveFailed
                        Ext.Msg.alert(l10n.title, l10n.msg)

                    }
                    loadMask.decref('save verification')
                }
            })
        }

        // blm.accounting.saveVerification.call([data], {
        //     scope: this,
        //     success: function(result,event,success,options) {
        //         result = result[0]
        //         var verid = result.id
        //         var number = result.number
        //         if (number != expectedNumber) {
        //             var l10n = this.l10n.save.unexpectedVerificationNumber
        //             var msg = Ext.String.format(l10n.msg, expectedNumber,
        //                                         number)
        //             Ext.Msg.alert(l10n.title, msg)
        //         }

        //         if (successfn) {
        //             successfn(result)
        //         }

        //         Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
        //             // register all new transactions' texts in the local
        //             // transaction index
        //             var index = Ext.getStore('transactiontext')
        //             index.register(org.get('id'), transactions)
        //         })

        //         var seen = {}
        //         transactions.each(function(transaction) {
        //             var account = transaction.get('account')
        //             if (!(account in seen)) {
        //                 seen[account] = true
        //                 grid.accountsStore.getById(account).reload()
        //             }
        //         })

        //         if (editing) {
        //             this.load(loadMask)
        //         } else {
        //             // start editing a new verification
        //             this.new_verification(loadMask)
        //         }
        //     },
        //     callback: function(result,event,success,options) {
        //         if (editing && !success) {
        //             verification.set('version', verification.get('version') - 1)
        //             transactions.each(function(transaction) {
        //                 transaction.set('version', verification.get('version'))
        //             });
        //             var l10n = this.l10n.save.saveFailed
        //             Ext.Msg.alert(l10n.title, l10n.msg)

        //         }
        //         loadMask.decref('save verification')
        //     }
        // })
    },

    setLoading: function(mask) {
        return new Bokf.lib.LoadMaskController(this.getViewPort(), mask, true)
    },

    updateSaveState: function() {
        var grid = this.getTransactions()
        var form = this.getForm()
        var valid = form.isValid() && grid.isValid()
        var verification = form.getForm().getRecord()
        var editing = !verification.phantom
        var dirty = verification.phantom || form.isDirty() || grid.isDirty()

        this.getRevertButton().setVisible(editing)
        this.getRevertButton().setDisabled(!dirty)
        this.getSaveButton().setDisabled(!(valid && dirty))
        this.getPrintButton().setDisabled(!(editing || valid && dirty))
    },

    _doPrint: function(verid) {
        Ext.Ajax.request({
            scope: this,
            url: '/verifikat/' + verid,
            success: function(resp, opts) {
                var frame = this.getPrintFrame().getFrame()
                frame.contentDocument.documentElement.innerHTML = resp.responseText
                frame.contentWindow.print()
            }
        })
    },

    print: function() {
        // loadmask?
        var self = this
        var grid = this.getTransactions()
        var form = this.getForm()
        var valid = form.isValid() && grid.isValid()
        var verification = form.getForm().getRecord()

        if (verification.phantom) {
            if (valid) {
                this.save(function(result) {
                    self._doPrint(result.id)
                })
            }
        } else {
            var verid = verification.get('id')

            if (verification.dirty || grid.isDirty()) {
                if (valid) {
                    Ext.Msg.show({
                        title: this.l10n.print.title,
                        msg: this.l10n.print.msg,
                        buttons: Ext.Msg.YESNOCANCEL,
                        defaultFocus: 'yes',
                        scope: this,
                        fn: function(button, text, opt) {
                            if (button == 'yes') {
                                this.save(function(result) {
                                    self._doPrint(result.id)
                                })
                            } else if (button == 'no') {
                                this._doPrint(verid)
                            }
                        }
                    })
                } else {
                    Ext.Msg.show({
                        title: this.l10n.print.title,
                        msg: this.l10n.print.msgInvalid,
                        buttons: Ext.Msg.YESNO,
                        defaultFocus: 'yes',
                        scope: this,
                        fn: function(button, text, opt) {
                            if (button == 'yes') {
                                self._doPrint(verid)
                            }
                        }
                    })
                }
            } else {
                this._doPrint(verid)
            }
        }
    }
})
