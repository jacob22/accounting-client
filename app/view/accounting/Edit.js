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

Ext.syncRequire('Bokf.lib.Utils')

Ext.define('Bokf.view.accounting.Edit', {
    extend: 'Ext.form.Panel',
    alias: 'widget.accountingedit',

    requires: [
        'Ext.grid.plugin.CellEditing',
        'Bokf.model.Account',
        'Bokf.lib.AccountTypeCombo',
        'Bokf.lib.CurrencyEditor',
        'Bokf.lib.DeleteColumnPlugin',
        'Bokf.lib.ExpandingGridPlugin',
        'Bokf.lib.LinkButton',
        'Bokf.lib.Utils',
        'Bokf.lib.VatCodeCombo',
        'Bokf.store.AccountTypes',
        'Bokf.store.VatCodes'
    ],

    autoShow: true,

    type: 'form',
    bodyPadding: 5,
    border: 0,

    layout: {type: 'vbox', align: 'stretch'},

    autoScroll: true,

    trackResetOnLoad: true,
    items: [
        {name: 'taxation_year', xtype: 'textfield'},

        {name: 'start', xtype: 'datefield', submitFormat: 'Y-m-d'},

        {name: 'end', xtype: 'datefield', submitFormat: 'Y-m-d'},

        {name: 'verificationSeries', xtype: 'grid', collapsible: true,
         viewConfig: {loadMask: null},

         margins: '0 0 5 0',
         sortableColumns: false,
         columns: {
             items: [{dataIndex: 'name', width: 100,
                      editor: {xtype: 'textfield', allowBlank: false, ignore: true}},
                     {dataIndex: 'description', flex: 1,
                      sortable: false,
                      editor: {xtype: 'textfield', allowBlank: true, ignore: true}}]
         },
         selType: 'cellmodel',
         plugins: [
             {ptype: 'cellediting-enteristab',
              pluginId: 'celleditor',
              listeners: {
                  beforeedit: function(editor, context) {
                      if (context.field == 'name') {
                          return !context.record.get('name')
                      }
                      return true
                  },
                  validateedit: function(editor, context) {
                      if (context.field == 'name' &&
                          context.value != context.originalValue) {
                          var store = context.grid.store
                          var re = new RegExp("^" + context.value + "$")
                          if (store.find('name', re) != -1) {
                              return false
                          }
                      }
                      return true
                  }
              }
             },

             {ptype: 'deletecolumn',
              canDelete: function(record, store) {
                  return record.get('name') && record.get('canBeDeleted') &&
                      store.count() > 2  // phantom entry counts
              }
             },

             {ptype: 'expandinggrid',
              recordComplete: function(record) {
                  return !!record.get('name')
              }
             }
         ]
        },

        {name: 'accounts', xtype: 'grid', cls: 'accounts',
         flex: 1, collapsible: true,
         viewConfig: {loadMask: null},

         columns: {
             items: [
                 {dataIndex: 'number', width: 100,
                  editor: {xtype: 'textfield',
                           cls: 'account-number', // for test
                           allowBlank: false, ignore: true}},

                 {dataIndex: 'type', width: 100,
                  editor: {xtype: 'accounttypecombo', ignore: true},
                  renderer: function(value) {
                      value = value || undefined
                      var store = Ext.getStore('accounttype')
                      var record = store.getById(value)
                      return record.get('name')
                  }},

                 {dataIndex: 'name', flex: 1, sortable: false,
                  editor: {xtype: 'textfield', cls: 'name',
                           allowBlank: true, ignore: true}},

                 {dataIndex: 'vatCode', width: 100,
                  editor: {xtype: 'vatcode', ignore: true}
                 },

                 {dataIndex: 'budget',
                  editor: {xtype: 'currencyeditor',
                           allowBlank: true, allowNegative: true, ignore: true},
                  renderer: Bokf.lib.Utils.currencyRendererFactory(2, true, 0)
                 },

                 {dataIndex: 'opening_balance',
                  editor: {xtype: 'currencyeditor',
                           allowBlank: true, allowNegative: true, ignore: true},
                  renderer: Bokf.lib.Utils.currencyRendererFactory(2, true, 0)
                 }
             ]
         },

         buttons: [
             {action: 'initaccounts'}
         ],

         selType: 'cellmodel',

         plugins: [
             {ptype: 'cellediting-enteristab',
              pluginId: 'celleditor',
              listeners: {
                  beforeedit: function(editor, context) {
                      if (context.field == 'number') {
                          return context.record.phantom
                      }
                      if (context.field == 'type') {
                          var store = Ext.getStore('accounttype')
                          if (context.record.get('type')) {
                              store.filterBy(function(record, id) {
                                  return !!record.get('id')
                              })
                          }
                      }
                      return true
                  },
                  edit: function(editor, context) {
                      if (context.field == 'type') {
                          var store = Ext.getStore('accounttype')
                          store.clearFilter()
                      }
                  }
              }
             },

             {ptype: 'deletecolumn',
              canDelete: function(record) {
                  return record.get('number') && record.canBeDeleted()
              }
             },

             {ptype: 'expandinggrid',
              recordComplete: function(record) {
                  return !!record.get('number')
              }
             }
         ]
        }
    ],

    dockedItems: {
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        padding: '2 0 2 2',
        defaults: {minWidth: 100},
        items: [
            {xtype: 'linkbutton', action: 'export'},
            {xtype: 'button', action: 'removeaccounting'},
            {xtype: 'tbspacer', flex: 1},
            {xtype: 'button', action: 'save'},
            {xtype: 'button', action: 'cancel'}
        ]
    },

    l10n: {
        fieldLabels: {
            taxation_year: 'Taxation year',
            start: 'Start date',
            end: 'End date'
        },
        verificationSeries: {
            title: 'Series',
            columnHeaders: {
                name: 'Name',
                description: 'Description'
            }
        },
        accounts: {
            title: 'Accounts',
            columnHeaders: {
                number: 'Account number',
                type: 'Type',
                name: 'Name',
                vatCode: 'VAT Code',
                budget: 'Budget',
                opening_balance: 'Opening balance'
            },
            buttons: {
                initaccounts: 'Initialise account with last year\'s data'
            }
        },
        buttons: {
            'export': 'Export',
            removeaccounting: 'Remove',
            save: 'Save',
            cancel: 'Revert'
        }
    },

    listeners: {

        render: function(form) {
            // ignore fields in nested grids
            form.getForm().monitor.selector = '[isFormField]:dontignore'
        },

        beforerender: {
            fn: function() {
                this.items.each(function(item, i) {
                    var label = this.l10n.fieldLabels[item.name]
                    if (label) {
                        item.fieldLabel = label
                    }
                }, this);

                var grids = ['verificationSeries', 'accounts']
                Ext.each(grids, function(gridname) {
                    var selector = Ext.String.format('grid[name={0}]', gridname)
                    var grid = this.down(selector)
                    var translations = this.l10n[gridname]

                    grid.title = translations.title // setTitle() eats collapse tool!
                    Ext.each(grid.columns, function(column) {
                        var text = translations.columnHeaders[column.dataIndex]
                        if (text) {
                            column.setText(text)
                        }
                    });
                    Ext.each(grid.query('button'), function(button) {
                        var text = translations.buttons[button.action]
                        if (text) {
                            button.setText(text)
                        }
                    });
                }, this);

                var dock = this.getDockedItems('toolbar[dock="bottom"]')[0]
                Ext.each(dock.query('button'), function(button) {
                    var text = this.l10n.buttons[button.action]
                    if (text) {
                        button.setText(text)
                    }
                }, this);
            }
        }
    },

    constructor: function() {
        this.callParent(arguments)
        this._storeListeners = []
    },

    getAccountsGrid: function() {
        return this.down('grid[name=accounts]')
    },

    getSeriesGrid: function() {
        return this.down('grid[name=verificationSeries]')
    },

    setReadOnly: function(readOnly) {
        this.readOnly = readOnly
        var components = this.query(
            'datefield, grid, button:not([action=export])')
        Bokf.lib.Utils.setOEReadOnly(components, readOnly)
    },

    setAccounting: function(record) {
        this.loadRecord(record)
        this.setTitle(record.get('name'))

        var seriesStore = record.verificationSeries()
        var seriesGrid = this.down('grid[name=verificationSeries]')
        this.down('grid[name=verificationSeries]').reconfigure(seriesStore)

        var accountStore = record.accounts()
        this.down('grid[name=accounts]').reconfigure(accountStore)
        accountStore.load()

        var exportButton = this.down('button[action=export]')
        exportButton.setHref('/export/' + record.get('id'))

        while (this._storeListeners.length) {
            var listener = this._storeListeners.pop()
            listener.destroy()
        }

        var listener = {
            scope: this,
            destroyable: true,
            datachanged: this.updateButtonState,
            update: this.updateButtonState
        }

        this._storeListeners.push(accountStore.on(listener),
                                  seriesStore.on(listener))
    },

    isDirty: function() {
        return this.callParent(arguments) ||
            this.getSeriesGrid().getStore().isDirty() ||
            this.getAccountsGrid().getStore().isDirty()
    },

    reset: function() {
        this.getForm().reset()
        this.getSeriesGrid().getStore().rejectChanges()
        this.getAccountsGrid().getStore().rejectChanges()
    },

    updateButtonState: function() {
        // xxx this is the same implementation as in Bokf.view.org.Edit, merge?
        var save = this.down('[action=save]')
        var cancel = this.down('[action=cancel]')

        var valid = this.isValid()
        var dirty = this.isDirty()

        var saveEnabled = dirty && valid
        var cancelEnabled = dirty

        save.setDisabled(!saveEnabled)
        cancel.setDisabled(!cancelEnabled)
    }
})
