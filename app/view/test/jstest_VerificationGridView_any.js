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

Ext.syncRequire(['Ext.data.proxy.Memory'])

Ext.define('Test.proxy.Account', {
    extend: 'Ext.data.proxy.Memory',
    data: []
})
Ext.ClassManager.setAlias('Test.proxy.Account', 'proxy.account')

Ext.syncRequire(['Bokf.view.Transactions'])

Tests = {
    accountsStore: Ext.create('Bokf.store.Accounts', {
        data: [
            {'id' : '1234', type: 'T'},
            {'id' : '5678', type: 'I'}
        ],
        proxy: {
            type: 'memory'
        }
    }),

    gridStore: Ext.create('Ext.data.Store', {
        data: [
            {'account' : '1234'},
            {'account' : '5678'},
            {'account' : '1234', 'amount' : '-42'},
            {'account' : '5678', 'amount' : '42'}
            // Both debit and credit on same row not allowed
        ],
        model: 'Bokf.model.Transaction',
        proxy: {
            type: 'memory'
        }
    }),

    test_getValueOf: function() {
        var getValueOf = Bokf.view.TransactionsGridView.prototype.getValueOf
        var view = {
            accountsStore: this.Tests.accountsStore,
            store: this.Tests.gridStore,
            panel: { editingPlugin: { context: {

            }}}
        }

        var res = getValueOf.call(view, 'account', 0)
        ais(res, '1234')
    },

    test_walkCells: function() {
        var walkCells = Bokf.view.TransactionsGridView.prototype.walkCells
        var view = {
            getValueOf: function(colname, row) {
                var record = this.store.data.getAt(row)
                return record.get(colname)
            },
            accountsStore: this.Tests.accountsStore,
            store: this.Tests.gridStore,
            headerCt: {
                columns: (function() {
                    var cols = []
                    for (var colname in [ 'account', 'text', 'amount', 'amount', 'account' ]) {
                        cols.push(Ext.create('Ext.grid.column.Column', {
                            dataIndex: colname,
                            editor: { xtype: 'textfield' }
                        }))
                    }

                    return cols
                })(),
                getHeaderAtIndex: function(col) {
                    return this.columns[col]
                },
                getGridColumns: function() {
                    return this.columns
                }
            },
            callParent: function(args) {
                // Parent walkCells
                var pos = args[0]
                var dir = args[1]
                var row = pos.row
                var col = pos.column + (dir == 'right'?+1:-1)
                if (col < 0) {
                    row = row - 1
                    col = 4
                }
                if (col > 4) {
                    col = 0
                    row = row + 1
                }

                return { column: col,  row: row }
            }
        }

        var pos = { row: 0, column: 0 } // acct

        var newpos = walkCells.call(view, pos, 'right')

        ais(newpos.row, 0)
        ais(newpos.column, 1) // text

        pos = newpos
        var newpos = walkCells.call(view, pos, 'right')

        ais(newpos.row, 0)
        ais(newpos.column, 2) // debit

        pos = newpos
        var newpos = walkCells.call(view, pos, 'right')

        ais(newpos.row, 0)
        ais(newpos.column, 3) // credit

        pos = newpos
        var newpos = walkCells.call(view, pos, 'right')

        ais(newpos.row, 0)
        ais(newpos.column, 4) // balance

        pos = newpos
        var newpos = walkCells.call(view, pos, 'right')

        ais(newpos.row, 1)
        ais(newpos.column, 0) // acct

        pos = newpos
        var newpos = walkCells.call(view, pos, 'right')

        ais(newpos.row, 1)
        ais(newpos.column, 1) // text

        pos = newpos
        var newpos = walkCells.call(view, pos, 'right')

        ais(newpos.row, 1)
        ais(newpos.column, 3) // credit

        pos = newpos
        var newpos = walkCells.call(view, pos, 'right')

        ais(newpos.row, 1)
        ais(newpos.column, 4) // debit

        pos = newpos
        var newpos = walkCells.call(view, pos, 'right')

        ais(newpos.row, 2)
        ais(newpos.column, 0)

        pos = newpos
        var newpos = walkCells.call(view, pos, 'right')

        ais(newpos.row, 2)
        ais(newpos.column, 1)

        pos = newpos
        var newpos = walkCells.call(view, pos, 'right')

        ais(newpos.row, 2)
        ais(newpos.column, 3)

        pos = newpos
        var newpos = walkCells.call(view, pos, 'right')

        ais(newpos.row, 2)
        ais(newpos.column, 4)

        pos = newpos
        var newpos = walkCells.call(view, pos, 'right')

        ais(newpos.row, 3)
        ais(newpos.column, 0)

        pos = newpos
        var newpos = walkCells.call(view, pos, 'right')

        ais(newpos.row, 3)
        ais(newpos.column, 1)

        pos = newpos
        var newpos = walkCells.call(view, pos, 'right')

        ais(newpos.row, 3)
        ais(newpos.column, 2)

        pos = newpos
        var newpos = walkCells.call(view, pos, 'right')

        ais(newpos.row, 3)
        ais(newpos.column, 4)

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 3)
        ais(newpos.column, 2)

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 3)
        ais(newpos.column, 1)

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 3)
        ais(newpos.column, 0)

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 2)
        ais(newpos.column, 4)

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 2)
        ais(newpos.column, 3)

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 2)
        ais(newpos.column, 1)

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 2)
        ais(newpos.column, 0)

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 1)
        ais(newpos.column, 4) // balance

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 1)
        ais(newpos.column, 3) // credit

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 1)
        ais(newpos.column, 2) // debit

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 1)
        ais(newpos.column, 1) // text

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 1)
        ais(newpos.column, 0) // acct

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 0)
        ais(newpos.column, 4) // balance

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 0)
        ais(newpos.column, 3) // credit

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 0)
        ais(newpos.column, 2) // debit

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 0)
        ais(newpos.column, 1) // text

        pos = newpos
        var newpos = walkCells.call(view, pos, 'left')

        ais(newpos.row, 0)
        ais(newpos.column, 0) // acct

    }
}
