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

Ext.syncRequire(['Bokf.lib.Utils'])

Ext.define('Bokf.view.Transactions', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.transactions',

    requires: [
        'Bokf.lib.CurrencyEditor',
        'Bokf.lib.AccountEditor',
        'Bokf.lib.CellEditing',
        'Bokf.lib.DeleteColumnPlugin',
        'Bokf.lib.TransactionTextEditor',
        'Bokf.lib.Utils',
        'Bokf.model.Transaction',
        'Bokf.store.Accounts',
        'Bokf.lib.Summary'
    ],

    store: {
        type: 'store',
        model: 'Bokf.model.Transaction'
    },
    viewType: 'transactionsgridview',
    features: [{
        ftype: 'oesummary'
    }],

    initComponent: function() {
        this.callParent(arguments);
        this.store.add({})
    },

    displayBalance: true,
    readOnly: false,

    accountsStore: null,

    balanceRenderer: Bokf.lib.Utils.currencyRendererFactory(2, true, 0),

    listeners: {
        reconfigure: function() {
            var feature = this.view.features[0]
            feature.view.mon(feature.view.store, {
                update: feature.onStoreUpdate,
                datachanged: feature.onStoreUpdate,
                scope: feature
            })
        },

        edit: function(editor, context) {
            if (context.field == 'account' || context.field == 'amount') {
                // We need to recalculate all balances now.
                this.view.refresh()
            }

            if (context.field == 'text') {
                var store = Ext.getStore('transactiontext')
                store.register_text(context.value)
            }
        },

        afterrender: function() {
            // this code listens for KP_PLUS and sends the custom
            // 'kpplus' event, which the verification controller uses
            // to save as per
            // https://eutaxia.eu/#todo:51f122977af5765eb4007dc1
            this.getEl().on({
                scope: this,
                keyup: function(event, target) {
                    if (event.keyCode == event.NUM_PLUS) {
                        event.stopEvent()
                        this.fireEvent('kpplus')
                    }
                },
                keydown: function(event, target) {
                    if (event.keyCode == event.NUM_PLUS) {
                        // In Mozilla, stopping the keyup event is not
                        // sufficient to block the character.
                        event.stopEvent()
                    }
                }
            })
        },

        showeditor: function(plugin, editor, context, value) {
            if (context.field == 'account' &&
                editor.field.store !== plugin.grid.accountsStore) {
		editor.field.bindStore(plugin.grid.accountsStore)
		// ComboBox will think that its old query filter is applied
		// to the new store. Remove the old query filter so that
		// a new one is created.
		editor.field.queryFilter = null
            }
        },

        beforeedit: function(editor, event) {
            if (this.readOnly) {
                return false
            }

            var store = this.view.store
            var field = event.field
            var record = event.record

            // if (field == 'text' && !record.get('text')) {
            //     var prev = store.getAt(event.rowIdx - 1)
            //     if (prev) {
            //         record.set('text', prev.get('text'))
            //     }
            // }

            if (field == 'amount' && !record.get('amount')) {
                var sum = store.sum('amount')
                var column = event.column.name
                if ((column == 'debit'  && sum < 0) ||
                    (column == 'credit' && sum > 0)) {
                    event.value = sum * -1
                    record.set('amount', event.value)
                }
            }

            return true
        },
        beforerender: function() {
            Ext.each(this.columns, function(column) {
                var text = this.l10n.columnHeaders[column.name]
                column.setText(text)
            }, this);
        }
    },

    columns: {
        items: [
            {
                name: 'account',  dataIndex: 'account', minWidth: "200",
                editor: {xtype: 'accounteditor', allowBlank: false},
                renderer: function(value, metadata, record, rowIndex, colIndex,
                                   store, view) {
                    var account = null
                    if (this.accountsStore) {
                        account = this.accountsStore.getById(value)
                    }
                    return account ? account.get('display') : value
                }
            },
            { name: 'text', dataIndex: 'text', flex: 1,
              editor: {xtype: 'transactiontexteditor', selectOnFocus: true},
              summaryType: function(records) {
                  var sum = 0;

                  for (var i=0; i<records.length; i++) {
                      sum += records[i].get('amount')
                  }
                  return sum;
              },
              summaryRenderer: function(value) {
                  var fn = Bokf.lib.Utils.currencyRendererFactory(2, true, 0)
                  var text = ''
                  if (value) {
                      text = fn(value)
                  }
                  return '<div style="text-align: right;">' + text + '</div>'
              }
            },
            { name: 'debit', dataIndex: 'amount', align: 'right',
              editor: {xtype: 'currencyeditor', selectOnFocus: true},
              renderer: function(value) {
                  var fn = Bokf.lib.Utils.currencyRendererFactory(2, true, "")

                  if (value > 0) {
                      return fn(value)
                  } else {
                      return ""
                  }
              },
              summaryType: function(records) {
                  var sum = 0;

                  for (var i=0; i<records.length; i++) {
                      var val = records[i].get('amount')
                      if (val > 0) {
                          sum = sum + val
                      }
                  }
                  return sum;
              },
              summaryRenderer: Bokf.lib.Utils.currencyRendererFactory(2, true, 0)
            },
            { name: 'credit', dataIndex: 'amount', align: 'right',
              editor: {xtype: 'currencyeditor', selectOnFocus: true,
                       negated: true},
              renderer: function(value) {
                  var fn = Bokf.lib.Utils.currencyRendererFactory(2, true, "")

                  if (value < 0) {
                      return fn(-value)
                  } else {
                      return ""
                  }
              },
              summaryType: function(records) {
                  var sum = 0;

                  for (var i=0; i<records.length; i++) {
                      var val = records[i].get('amount')
                      if (val < 0) {
                          sum = sum - val
                      }
                  }
                  return sum;
              },
              summaryRenderer: Bokf.lib.Utils.currencyRendererFactory(2, true, 0)
            },

            { name: 'balance', align: 'right',
              renderer: function(value, metadata, record, rowIndex, colIndex, store, view) {
                  if (!this.displayBalance || !record || !record.get('account')) {
                      return ''
                  }

                  var accountId = record.get('account')
                  var account = this.accountsStore.getById(accountId)
                  var balance = account.get('balance')
                  for (var i=0; i <= rowIndex; i++) {
                      var transaction = store.getAt(i)
                      if (transaction.get('account') == accountId) {
                          balance += transaction.get('amount')
                      }
                  }
                  return Ext.String.format('<span class="{0}">{1}</span>',
                                           balance < 0 ? 'negative-balance': '',
                                           this.balanceRenderer(balance))
              }
            }
        ],

        defaults: {
            sortable: false,
            hideable: false,
            draggable: false,
            menuDisabled: true
        }
    },

    plugins: [
        {ptype: 'cellediting-enteristab', clicksToEdit: 1},
        {ptype: 'deletecolumn', pluginId: 'deletecolumn',
         canDelete: function(record) {
             return !!record.get('account')
         }
        },
        {ptype: 'expandinggrid', pluginId: 'expandinggrid',
         recordComplete: function(record) {
             return !!record.get('account')
         }
        }
    ],

    l10n: {
        columnHeaders: {
            account: 'Account',
            text: 'Text',
            debit: 'Debit',
            credit: 'Credit',
            balance: 'Balance'
        }
    },

    setAccountsStore: function(accountsStore) {
        this.accountsStore = accountsStore
        this.view.setAccountsStore(accountsStore)
    },

    isDirty: function() {
        var store = this.view.store
        if (store.getRemovedRecords().length) {
            return true
        }
        var dirty = false
        store.each(function(record) {
            dirty = !!(record.dirty &&
                       record.get('account') && record.get('amount'))
            return !dirty
        });
        return !!dirty
    },

    isValid: function() {
        // Validation rules:
        // - Each transaction must have an amount (i.e. not zero).
        // - Sum of all transactions' amount must be zero.
        var sum = 0
        var valid = true
        this.view.store.each(function(record) {
            if (record.get('account')) {
                amount = record.get('amount')
                sum += amount
                if (amount == 0) {
                    valid = false
                }
                return valid
            }
        });
        return valid && sum == 0
    }
})


Ext.define('Bokf.view.TransactionsGridView', {
    extend: 'Ext.grid.View',
    alias: 'widget.transactionsgridview',
    requires: [ 'Bokf.store.Accounts' ],

    setAccountsStore: function(accountsStore) {
        this.accountsStore = accountsStore
    },

    getValueOf: function(colname, row) {
        var self = this
        var context = self.panel.editingPlugin.context

        if (typeof(row) != 'undefined' && context.rowIdx != row) {
            var record = self.store.data.getAt(row)
            return record.get(colname)
        } else if (context.field != colname) {
            return context.record.get(colname)
        } else {
            var col = self.headerCt.getHeaderAtIndex(context.colIdx)
            return col.getEditor().getValue()
        }
    },

    // The next cell is not always the one immediately adjacent
    // We want either debit och credit logically adjacent to text
    // depending on which account has been selected.
    walkCells: function(pos, direction, e, preventWrap, verifierFn, scope) {
        if (!pos) {
            return
        }
        direction = direction.toLowerCase()

        if (direction == 'left' || direction == 'right') {
            // Fetch the current record
            var amount = this.getValueOf('amount', pos.row)
            var account = this.accountsStore.getById(
                this.getValueOf('account', pos.row))
            var type = account ? account.get('type') : undefined

            if (amount > 0) {
                // Skip 'credit' when tabbing
                var colOrder = [
                    /* acct */    [0,0],
                    /* text */    [1,1],
                    /* debit */   [2,3],
                    /* credit */  [3,3],
                    /* balance */ [3,4],
                    /* delete */  [5,5]
                ]
                pos = { column: colOrder[pos.column][direction == 'right'?1:0],
                        row: pos.row }

            } else if (amount < 0) {
                // Skip 'debit' when tabbing
                var colOrder = [
                    /* acct */    [0,0],
                    /* text */    [1,2],
                    /* debit */   [2,2],
                    /* credit */  [2,3],
                    /* balance */ [4,4],
                    /* delete */  [5,5]
                ]
                pos = { column: colOrder[pos.column][direction == 'right'?1:0],
                        row: pos.row }

            } else if (type == 'I') {
                // Skip 'debit' when tabbing
                var colOrder = [
                    /* acct */    [0,0],
                    /* text */    [1,2],
                    /* debit */   [2,2],
                    /* credit */  [3,3],
                    /* balance */ [4,4],
                    /* delete */  [5,5]
                ]
                pos = { column: colOrder[pos.column][direction == 'right'?1:0],
                        row: pos.row }

            }
        }
        var args = [pos].concat(Array.prototype.slice.call(arguments, 1))
        return this.callParent(args)
    }
})
