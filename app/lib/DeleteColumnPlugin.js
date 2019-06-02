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

Ext.define('Bokf.lib.DeleteColumnPlugin', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.deletecolumn',

    requires: [
        'Bokf.lib.Grid'
    ],

    mixins: {
        observable: 'Ext.util.Observable'
    },

    relayedEvents: [
        'afterdeleterecord',
        'beforedeleterecord'
    ],

    l10n: {
        tooltip: 'Delete',
        menuText: 'Delete'
    },

    constructor: function(config) {
        this.addEvents('afterdeleterecord', 'beforedeleterecord')
        this.callParent(arguments)
        this.mixins.observable.constructor.call(this)
    },

    init: function(grid) {
        this.grid = grid
        grid.relayEvents(this, this.relayedEvents);
        this.addColumn()
        grid.on('reconfigure', this.reconfigured, this)
        grid.on('readonly', this.refresh, this)
    },

    disable: function() {
        if (this.column) {
            this.column.hide()
        }
        this.callParent(arguments)
    },

    reconfigured: function(view, store, columns, oldStore) {
        if (oldStore) {
            oldStore.un('datachanged', this.refresh, this)
        }

        if (this.disabled) {
            return
        }

        store.on('datachanged', this.refresh, this)
    },

    refresh: function() {
        this.grid.getView().refresh()
    },

    canDelete: function(record, store) {
        return true
    },

    addColumn: function() {
        var me = this
        this.column = Ext.create('Ext.grid.column.Action', {
            width: 34,
            iconCls: 'oe-deletecol-icon',
            icon: '/images/delete.png',
            tooltip: this.l10n.tooltip,
            menuText: this.l10n.menuText,

            handler: function(view, rowIdx, colIdx, item, event, record) {
                var store = view.getStore()
                if (event.type == 'keydown') {
                    event.preventDefault()
                    var cand = store.getAt(rowIdx+1)
                    if (cand) {
                        me.grid.getView().focusNode(cand)
                        var editor = me.grid.getPlugin('celleditor')
                        if (editor) {
                            editor.startEdit(cand, 0)
                        }
                    }
                    return
                }
                if (me.grid.readOnly ||
                    !me.canDelete(record, store) ||
                    me.fireEvent('beforedeleterecord', me, record, store) === false) {
                    return
                }
                store.removeAt(rowIdx)
                me.fireEvent('afterdeleterecord', me, record)
            },
            isDisabled: function(view, rowIndex, colIdx, item, record) {
                return me.grid.readOnly || !me.canDelete(record, view.getStore())
            }
        })
        this.grid.headerCt.insert(this.grid.columns.length, this.column)
        this.grid.getView().refresh()
    }
})
