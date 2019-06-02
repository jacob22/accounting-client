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

Ext.define('Bokf.controller.Org', {
    extend: 'Ext.app.Controller',

    id: 'org',

    stores: ['OrgsTree'],

    requires: [
        'Bokf.lib.ApplicationState',
        'Bokf.lib.Utils',
        'Ext.util.DelayedTask'
    ],

    refs: [
        {ref: 'mainTabPanel', selector: 'main tabpanel[name=main-tab-panel]'},
        {ref: 'admin', selector: 'admin'},
        {ref: 'list', selector: 'orglist'},
        {ref: 'orgView', selector: 'org-view'},
        {ref: 'orgEditor', selector: 'orgedit'},
        {ref: 'logotype', selector: 'orgedit imageupload[name=logotype]'},
        {ref: 'accountingEditor', selector: 'accountingedit'},
        {ref: 'accountingCreateForm', selector: 'accountingcreate'},
        {ref: 'seriesCombo', selector: 'orgedit series'},
        {ref: 'viewPort', selector: 'vp'},

        // tabs
        {ref: 'adminTab', selector: 'main tabpanel admin'},
        {ref: 'accountingTab', selector: 'main tabpanel verification'},
        {ref: 'reportsTab', selector: 'main tabpanel reports'},
        {ref: 'productsTab', selector: 'main tabpanel products'},
        {ref: 'paymentsTab', selector: 'main tabpanel payments'},
        {ref: 'purchasesTab', selector: 'main tabpanel purchases'},
        {ref: 'invoicesTab', selector: 'main tabpanel invoices'},
        {ref: 'expensesTab', selector: 'main tabpanel expense'},
        {ref: 'importTab', selector: 'main tabpanel import'},
        {ref: 'salesReportsTab', selector: 'main tabpanel salesreports'},
        {ref: 'accountsPayableTab', selector: 'main tabpanel accountspayable'}
    ],

    l10n: {
        accountingImport: {
            waitMsg: 'Importing file. This can take several minutes.',
            success: {
                title: 'Import successful',
                msg: 'The file has been imported.'
            },
            failure: {
                title: 'Import failed',
                msg: 'There was an error while importing file.'
            }
        },
        copyAccountingYear: {
            loadMask: 'Creating fiscal year based on previous year.'
        },
        createFromTemplate: {
            loadMask: 'Creating fiscal year from chart of accounts.'
        },
        deleteMember: {
            title: 'Remove member',
            msg: 'You are about to remove {0} from {1}.',
            buttonText: {
                cancel: 'Abort',
                ok: 'Remove member'
            },
            failure: {
                title: 'Failed to remove member',
                msg: 'An error occured while removing member.'
            }
        },
        saveMembers: {
            loadMask: 'Updating roles...',
            failure: {
                title: 'Failed to update member roles',
                msg: 'An error occured while updating member roles.'
            }
        },
        invite: {
            waitMsg: 'Sending invitation...',
            success: {
                title: 'Invitation sent',
                msg: 'You have invited {0}.'
            },
            failure: {
                title: 'Invitation could not be sent.',
                msg: 'An error occured while sending the invitation.'
            }
        },
        orgselected: {
            loadMask: 'Loading {0}...'
        },
        accountingselected: {
            loadMask: 'Loading fiscal year...'
        },
        save: {
            loadMask: 'Saving...'
        }
    },

    init: function init(app) {
        this.addEvents(
            'accountingselected',
            'orgselected' // params: org, <indirectly>
        )

        this.control({
            'orglist': {
                select: this.selected
            },

            'orgedit': {
                dirtychange: this.updateButtonState,
                validitychange: this.updateButtonState
            },

            'orgedit imageupload[name=logotype]': {
                dirtychange: function(form, dirty) {
                    // Propagate dirtychange from image form. Needed
                    // because listeners are lost on form submit.
                    // See also: ImageUpload.js upload button change listener.
                    this.getOrgEditor().getForm().checkDirty()
                }
            },

            'orgedit button[action=save]': {
                click: this.save
            },
            'orgedit button[action=cancel]': {
                click: this.cancelEdit
            },

            'org-view apiuser button[action=generatekey]': {
                click: this.generateAPIUserKey
            },

            'org-view grid[name=members]': {
                beforedeleterecord: this.deleteMember
            },

            'org-view grid[name=members] button[action=save]': {
                click: this.saveMembers
            },

            'org-view grid[name=members] button[action=cancel]': {
                click: this.revertMembers
            },

            'invite button[action=invite]': {
                click: this.invite
            },

            'accounting-upload button': {
                click: this.upload
            },

            'accounting-fromtemplate button': {
                click: this.createFromTemplate
            },

            'accounting-copy button[action=submit]': {
                click: this.copyAccountingYear
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

    updateButtonState: function updateButtonState() {
        var editor = this.getOrgEditor()
        editor.updateButtonState()
    },

    selected: function show(grid, record) {
        this.show(record)
    },

    _orgSelected: function(org, implicit, loader) {
        var tabPanel = this.getMainTabPanel()
        var togglablePanes = [
            this.getAccountingTab(),
            this.getReportsTab(),
            this.getProductsTab(),
            this.getPaymentsTab(),
            this.getPurchasesTab(),
            this.getInvoicesTab(),
            this.getImportTab(),
            this.getSalesReportsTab()
        ]

        if (Bokf.lib.Utils.isBetaTester()) {
            togglablePanes.push(this.getAccountsPayableTab())
        }

        if (document.location.hostname == 'localhost.admin.eutaxia.eu') {
            // only show expense tab on dev machines
            togglablePanes.push(this.getExpensesTab())
        }
        var show_tabs = implicit
        Ext.each(togglablePanes, function(pane) {
            var tab = pane.tab
            if (show_tabs) {
                tab.show()
            } else {
                tab.hide()
            }
        });
        if (implicit) {
            return
        }
        tabPanel.setActiveTab(this.getAdmin())
        Bokf.lib.Utils.callAtShow([this.getAdmin(), this.getOrgView()],
                                  this.orgSelected, this,
                                  org, implicit, loader)
    },

    orgSelected: function(org, implicit, loader) {
        this.getOrgView().showRecord(org)
    },

    show: function show(record) {
        var admin = this.getAdmin()

        if (record instanceof Bokf.model.AddOrg) {
            record = Ext.create('Bokf.model.Org', {})
            this.getList().getSelectionModel().deselectAll()
            this.getMainTabPanel().setActiveTab(this.getAdmin())
        }

        if (record instanceof Bokf.model.Org) {
            var loadMask = Ext.String.format(this.l10n.orgselected.loadMask,
                                             record.get('name'))
            var loader = new Bokf.lib.LoadMaskController(
                this.getViewPort(), loadMask, true, 'show org')
            Bokf.lib.ApplicationState.setSelectedOrg(record)
            admin.raise('org-view')
            this.fireEvent('orgselected', record, false, loader)
            this.fireEvent('accountingselected', null, loader)
            loader.decref('show org')
        }

        else if (record instanceof Bokf.model.Accounting) {
            var loadMask = this.l10n.accountingselected.loadMask
            var loader = new Bokf.lib.LoadMaskController(
                this.getViewPort(), loadMask, true, 'show accounting')
            Bokf.lib.ApplicationState.setSelectedAccounting(record)
            admin.raise('accountingedit')
            this.fireEvent('orgselected', record.parentNode, true, loader)
            this.fireEvent('accountingselected', record, loader)
            loader.decref('show accounting')
        }

        else if (record instanceof Bokf.model.AddAccounting) {
            this.getAccountingCreateForm().showRecord(record)
            this.getMainTabPanel().setActiveTab(this.getAdmin())
            admin.raise('accountingcreate')
        }
    },

    save: function save(button) {
        var self = this
        var form = button.up('orgedit')
        var logotype = this.getLogotype()
        var record = form.getRecord()
        var values = form.getValues(
            undefined,
            true, // dirty only
            undefined,
            true // use data values
        )
        record.set(values)

        var phantom = record.phantom

        if (record.dirty || phantom) {
            record.save({
                scope: this,
                success: function() {
                    logotype.upload(record, function() {
                        if (phantom) {
                            self.getList().newStore([record.get('id')])
                        } else {
                            self.show(record)
                        }
                    })
                }
            })
        } else {
            logotype.upload(record, function() {
                self.show(record)
            })
        }
    },

    cancelEdit: function cancelEdit(button) {
        var form = button.up('orgedit')
        form.getForm().reset()
        var record = form.getRecord()
        if (record.phantom) {
            var root = this.getOrgsTreeStore().getRootNode()
            root.removeChild(record)
        }
        var selectionModel = this.getList().getSelectionModel()
        if (!selectionModel.getSelection().length) {
            selectionModel.select(selectionModel.getLastSelected())
        }
    },

    generateAPIUserKey: function(button) {
        var form = button.up('form')
        var org = form.getRecord()

        blm.accounting.createAPIUser.call([org.get('id')], {
            scope: this,
            success: function(result) {
                org.set('apikey', result[0])
                form.loadRecord(org)
            },
            failure: function(result) {
                // xxx
            }
        })
    },

    upload: function(button) {
        var form = button.up('form').getForm()
        if (form.isValid()) {
            var me = this
            var translations = this.l10n.accountingImport
            form.submit({
                url: '/accountingImport',
                waitMsg: translations.waitMsg,
                success: function(fp, operation) {
                    Ext.Msg.alert(translations.success.title,
                                  translations.success.msg)
                    me._newAccounting(form.getValues().org, operation.result.id)
                },
                failure: function(form, action) {
                    Ext.Msg.alert(translations.failure.title,
                                  translations.failure.msg)
                }
            })
        }
    },

    copyAccountingYear: function(button) {
        var self = this
        var component = button.up('form')
        var form = component.getForm()
        var values = form.getValues()
        var view = this.getViewPort()
        view.setLoading(this.l10n.copyAccountingYear.loadMask)
        blm.accounting.newAccountingFromLastYear.call(
            [values.org], function(result) {
                view.setLoading(false)
                self._newAccounting(values.org, result[0])
            })
    },

    createFromTemplate: function(button) {
        var me = this
        var component = button.up('form')
        var form = component.getForm()
        var values = form.getValues()
        var view = this.getViewPort()

        view.setLoading(this.l10n.createFromTemplate.loadMask)

        blm.accounting.accountingFromTemplate.call(
            [values.chartofaccounts], [values.org], function(result) {
                view.setLoading(false)
                me._newAccounting(values.org, result[0])
            })
    },

    _newAccounting: function(orgId, accountingId) {
        this._reload(orgId, accountingId)
    },

    deleteMember: function(plugin, record, store) {
        var org = this.getOrgEditor().getRecord()
        var l10n = this.l10n.deleteMember
        Ext.Msg.show({
            title: l10n.title,
            msg: Ext.String.format(l10n.msg, record.get('name'), org.get('name')),
            buttons: Ext.Msg.OKCANCEL,
            buttonText: l10n.buttonText,
            icon: Ext.Msg.WARNING,
            defaultFocus: 'cancel',
            scope: this,
            fn: function(button, text) {
                if (button != 'ok') {
                    return
                }

                blm.accounting.removeMembers.call([org.get('id')], [record.get('id')], {
                    scope: this,
                    success: function(result) {
                        if (result.length == 0) {
                            this._reload()
                        } else {
                            store.loadData(result)
                        }
                    },
                    failure: function(result) {
                        Ext.Msg.alert(l10n.failure.title, l10n.failure.msg)
                    }
                })
            }
        })
        return false
    },

    saveMembers: function(button) {
        var grid = button.up('grid[name=members]')
        var store = grid.getStore()
        var changes = []
        Ext.each(store.getModifiedRecords(), function(record) {
            changes.push({id: record.get('id'), roles: record.get('roles')})
        });

        var org = this.getOrgEditor().getRecord()

        var loader = new Bokf.lib.LoadMaskController(
            this.getViewPort(), this.l10n.saveMembers.loadMask, true,
            'saving members')

        blm.accounting.updateMemberRoles.call([org.get('id')], changes, [false], {
            scope: this,
            success: function(result) {
                org.set('userpermissions', result)
                org.commit()
                this.getOrgView().loadMembers(org)
            },
            failure: function(result) {
                Ext.Msg.alert(this.l10n.saveMembers.failure.title,
                              this.l10n.saveMembers.failure.msg)
            },
            callback: function() {
                loader.decref('saving members')
            }
        })
    },

    revertMembers: function() {
        var org = this.getOrgEditor().getRecord()
        this.getOrgView().loadMembers(org)
    },

    invite: function invite(button) {
        var form = button.up('form').getForm()
        if (form.isValid()) {
            var email = form.getValues().email
            var translations = this.l10n.invite
            form.submit({
                url: '/invite',
                waitMsg: translations.waitMsg,
                scope: this,
                success: function(fp, operation) {
                    Ext.Msg.alert(translations.success.title,
                                  Ext.String.format(translations.success.msg,
                                                    email))
                    form.reset()
                    this.getOrgView().loadInvited()
                },
                failure: function(form, action) {
                    Ext.Msg.alert(translations.failure.title,
                                  translations.failure.msg)
                }
            })
        }
    },

    _reload: function(orgId, accountingId) {
        var select
        if (orgId && accountingId) {
            select = [orgId, accountingId]
        } else {
            select = []
            this.getAdmin().raise('> [name=empty]')
        }
        this.getList().newStore(select)
    }
})
