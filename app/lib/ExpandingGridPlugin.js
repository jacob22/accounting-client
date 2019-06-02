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

Ext.define('Bokf.lib.ExpandingGridPlugin', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.expandinggrid',

    modifySorters: true,
    addHeaderTool: true,

    mixins: {
        observable: 'Ext.util.Observable'
    },

    relayedEvents: [
        'beforeaddrecord'
    ],

    l10n: {
        add: {
            tooltip: 'Add'
        }
    },

    constructor: function(config) {
        this.addEvents('beforeaddrecord')
        this.callParent(arguments)
        this.mixins.observable.constructor.call(this)
    },

    init: function(grid) {
        this.grid = grid
        grid.relayEvents(this, this.relayedEvents)
        grid.on('reconfigure', this.reconfigured, this)
        grid.on('edit', this.edit, this)
        grid.on('readonly', function(readOnly) {
            if (readOnly) {
                this.disable()
            } else {
                this.enable()
            }
        }, this)

        if (this.addHeaderTool) {
            grid.on('render', function(grid) {
                var self = this
                var toolCfg = {
                    type: 'plus',
                    tooltip: this.l10n.add.tooltip,
                    handler: function() {
                        self.addAndFocus.apply(self)
                    }
                }

                var tool = Ext.ComponentManager.create(toolCfg, 'tool')
                var header = grid.getHeader()
                if (header) {
                    header.insert(header.titlePosition + 1, tool)
                }
                this.headerTool = tool
                grid.updateHeader()
            }, this)
        }
    },

    disable: function() {
        if (this.headerTool) {
            this.headerTool.hide()
        }
        this.callParent(arguments)
    },

    enable: function() {
        if (this.headerTool) {
            this.headerTool.show()
        }
        this.addRecord()
        this.callParent(arguments)
    },

    reconfigured: function(view, store, columns, oldStore) {
        if (oldStore) {
            oldStore.un('load', this.addRecord, this)
        }

        if (this.modifySorters) {
            store.sorters.each(function(sorter) {
                sorter.transform = function(value) {
                    return value == '' ? '1' + value : '0' + value
                }
            }, this);
        }

        this.addRecord()
        store.on('load', this.addRecord, this)
    },

    addRecord: function(force) {
        var store = this.grid.getStore()
        var context = {
            data: {},
            store: store
        }

        if (!force &&
            (!this.needsNewRow() ||
             this.fireEvent('beforeaddrecord', this, context) === false)) {
            return
        }
        var record = store.add(context.data)[0]
        return record
    },

    addAndFocus: function() {
        var grid = this.grid
        var store = grid.getStore()
        var cand = store.last()
        if (!cand || this.recordComplete(cand)) {
            cand = this.addRecord()
        }
        grid.getView().focusNode(cand)
        grid.getPlugin('celleditor').startEdit(cand, 0)
    },

    edit: function(editor, context) {
        if (this.needsNewRow(this.grid.getStore())) {
            this.addRecord()
        }
    },

    needsNewRow: function() {
        if (this.grid.readOnly || this.disabled) {
            return false
        }
        var recordsComplete = true
        this.grid.getStore().each(function(record) {
            recordsComplete = this.recordComplete(record)
            return recordsComplete
        }, this);
        return recordsComplete
    },

    recordComplete: function(record) {
        return true // assume record is complete by default
    }
})
