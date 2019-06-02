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

Ext.define('Bokf.controller.Accounting', {
    extend: 'Ext.app.Controller',

    views: ['accounting.Edit'],
    stores: ['OrgsTree' ],

    requires: [
        'Ext.Ajax',
        'Ext.util.Format',
        'Bokf.lib.ApplicationState'
    ],

    refs: [
        {ref: 'admin', selector: 'admin'},
        {ref: 'accountingEditor', selector: 'accountingedit'},
        {ref: 'orgList', selector: 'orglist'},
        {ref: 'seriesEditor', selector: 'accountingedit grid[name=verificationSeries]'}
    ],

    l10n: {
        loadMask: 'Loading fiscal year...',

        initAccounts: {
            msgbox: {
                title: 'Reinitialise account information',
                msg: "\
This will fetch account information from previous fiscal year. \
All accounts' opening balances will be set to the closing balance \
of previous year. Accounts that are missing in the current years' \
account plan will be recreated.",
                buttonText: {
                    cancel: 'Cancel',
                    ok: 'Reinitialise account information'
                }
            },
            loadMask: 'Updating accounts',
            error: {
                title: 'No account information found',
                msg: '\
There is no previous fiscal year, and thus no account information \
could be retrieved.'
            }
        },

        saveAccounting: {
            failure: {
                title: 'Could not save fiscal year',
                msg: 'Could not save fiscal year'
            }
        },

        removeAccounting: {
            msgbox: {
                title: 'Remove fiscal year',
                msg: '\
This will permanently delete this fiscal year, including all accounts, \
all verifications and all transactions. \
There is no way to revert this operation, the data will be forever gone.',
                buttonText: {
                    cancel: 'Cancel',
                    ok: 'Permanently remove fiscal year'
                }
            },
            loadMask: 'Removing fiscal year'
        }
    },

    init: function init(app) {
        this.control({
            'accountingedit button[action=save]': {
                click: this.saveAccounting
            },
            'accountingedit button[action=cancel]': {
                click: this.cancelEdit
            },

            'accountingedit': {
                dirtychange: this.updateButtonState,
                validitychange: this.updateButtonState
            },

            'accountingedit button[action=initaccounts]': {
                click: this.initAccounts
            },

            'accountingedit button[action=removeaccounting]': {
                click: this.removeAccounting
            }
        })

        this.listen({
            controller: {
                '*': {
                    accountingselected: this._accountingSelected
                }
            }
        })
    },

    _accountingSelected: function(accounting, loader) {
        if (!accounting) {
            return
        }
        Bokf.lib.Utils.callAtShow([this.getAdmin(), this.getAccountingEditor()],
                                  this.accountingSelected, this,
                                  accounting, loader)
    },

    accountingSelected: function(accounting, loader) {
        loader.restart(this.l10n.loadMask, 'loading accounting')
        this.getAccountingEditor().setAccounting(accounting)

        Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
            this.getAccountingEditor().setReadOnly(!org.isAccountant())
        }, this)

        var stores = [accounting.verificationSeries(), accounting.accounts()]
        Bokf.lib.Utils.waitForStores(stores, function() {
            loader.decref('loading accounting')
        })
    },

    updateButtonState: function() {
        var editor = this.getAccountingEditor()
        editor.updateButtonState()
    },

    initAccounts: function initAccounts(button) {
        var self = this
        var l10n = this.l10n.initAccounts
        Ext.Msg.show({
            title: l10n.msgbox.title,
            msg: l10n.msgbox.msg,
            buttons: Ext.Msg.OKCANCEL,
            buttonText: l10n.msgbox.buttonText,
            icon: Ext.Msg.WARNING,
            defaultFocus: 'cancel',
            fn: function(button, text) {
                if (button != 'ok') {
                    return
                }

                var id = self.getAccountingEditor().getRecord().get('id')
                var url = Ext.util.Format.format(
                    '/main/invoke/accounting/Accounting/{0}/initialise', id)

                var accountGrid = self.getAccountingEditor().down(
                    'grid[name=accounts]')
                accountGrid.setLoading(l10n.loadMask)

                Ext.Ajax.request({
                    url: url,
                    success: function(response) {
                        var resp = Ext.JSON.decode(response.responseText)
                        if (resp.success) {
                            accountGrid.getStore().reload({
                                callback: function() {
                                    accountGrid.setLoading(false)
                                }
                            })
                        } else {
                            accountGrid.setLoading(false)
                            Ext.Msg.alert(l10n.error.title, l10n.error.msg)
                        }
                    }
                })
            }
        })
    },

    saveAccounting: function(button) {
        var form = button.up('accountingedit')
        var record = form.getRecord()
        var values = form.getValues()
        record.set(values)
        record.save({
            scope: this,
            success: function() {
                this.getAccountingEditor().setTitle(record.get('name'))
                this.getAccountingEditor().loadRecord(record)
            },
            failure: function(record, operation) {
                Ext.Msg.alert(this.l10n.saveAccounting.failure.title,
                              this.l10n.saveAccounting.failure.msg)
            }
        })
        record.verificationSeries().sync()
        record.accounts().sync()
    },

    cancelEdit: function(button) {
        button.up('accountingedit').reset()

    },

    removeAccounting: function removeAccounting(button) {
        var self = this
        var l10n = this.l10n.removeAccounting
        Ext.Msg.show({
            title: l10n.msgbox.title,
            msg: l10n.msgbox.msg,
            buttons: Ext.Msg.OKCANCEL,
            buttonText: l10n.msgbox.buttonText,
            icon: Ext.Msg.WARNING,
            defaultFocus: 'cancel',
            fn: function(button, text) {
                if (button != 'ok') {
                    return
                }
                var editor = self.getAccountingEditor()
                var accounting = editor.getRecord()
                var orgId = accounting.get('org')
                var pane = self.getAdmin()

                pane.setLoading(l10n.loadMask)
                accounting.destroy({
                    scope: self,
                    success: function() {
                        pane.setLoading(false)
                        var list = self.getOrgList()
                        var treeStore = self.getOrgsTreeStore()
                        var org = treeStore.getNodeById(orgId)
                        list.getSelectionModel().select(org)
                    }
                })
            }
        })
    }
})
