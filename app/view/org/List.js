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

Ext.define('Bokf.view.org.List' ,{
    extend: 'Ext.tree.Panel',
    alias: 'widget.orglist',
    requires: ['Bokf.store.OrgsTree'],
    store: 'OrgsTree',

    rootVisible: false,
    selModel: 'row',
    viewConfig: {markDirty: false},

    stateful: true,
    stateId: 'orglist',
    stateEvents: ['select'],

    sortableColumns: false,

    columns: [
        // both org and accounting have a name attribute, so column 0
        // can display it without worrying about object type
        {dataIndex: 'name',  flex: 1, xtype: 'treecolumn'},
        {dataIndex: 'orgnum', flex: 1}
    ],

    l10n: {
        title: 'Organisations',
        columnHeaders: {
            name: 'Name',
            orgnum: 'Organisation number'
        }
    },

    listeners: {
        afterrender: {
            fn: function() {
                Ext.each(this.columns, function(column) {
                    column.setText(this.l10n.columnHeaders[column.dataIndex])
                }, this)
            }
        },

        load: {
            fn: function(panel, node, records, successful) {
                var self = this
                if (self.isVisible()) {
                    self.initiateSelection(records)
                } else {
                    self.on('render', function() {
                        self.initiateSelection(records)
                    }, self, {single: true})
                }
            }
        },

        expand: function() {
            this.updateTitle()
        },
        collapse: function() {
            this.updateTitle()
        },

        // float & unfloat is triggered when user clicks on the header
        // (not the expand tool) when the panel is collapsed
        float: function() {
            this.updateTitle()
        },
        unfloat: function() {
            this.updateTitle()
        }
    },

    _select: function(store, select) {
        if (select && select.length) {
            var id = select.shift()
            var node = store.getNodeById(id)
            if (node && select.length) {
                node.expand(false, function() {
                    this._select(store, select)
                }, this)
            } else {
                this.getSelectionModel().select(node)
            }
        }
    },

    newStore: function(select) {
        var store = Ext.create('Bokf.store.OrgsTree')
        this.reconfigure(store)
        store.load({
            scope: this,
            callback: function() {
                this._select(store, select)
            }
        })
    },

    updateTitle: function() {
        var title = this.l10n.title
        if (this.getCollapsed()) {
            // set title to selected organisation and fiscal year
            // when collapsed
            var selected = this.getSelectionModel().getSelection()
            if (selected.length) {
                selected = selected[0]
                var parts = []
                while (selected !== this.getRootNode()) {
                    parts.push(selected.get('name'))
                    selected = selected.parentNode
                }
                parts.reverse()
                title = parts.join(' - ')
            }
        }
        this.setTitle(title)
    },

    getState: function () {
        var state = this.callParent()
        var selected = this.getSelectionModel().getSelection()
        if (selected.length) {
            var path = []
            selected = selected[0]
            while (selected && selected !== this.getRootNode()) {
                path.push(selected.get('id'))
                selected = selected.parentNode
            }
            path.reverse()
            state['selected'] = path.join('-')
        }
        return state
    },

    applyState: function(state) {
        this.callParent([state])
        if (state.selected) {
            this._selected = state.selected.split('-')
        }
    },

    initiateSelection: function(records) {
        var selected = this._selected
        var selModel = this.getSelectionModel()
        if (!selected || selModel.getSelection().length) {
            return
        }
        Ext.each(records, function(record) {
            var match = Ext.Array.indexOf(selected, record.get('id'))
            if (match == -1) {
                return true
            }
            if (match == 0) { // record is an org
                if (selected.length == 1) {
                    // selection path is only one element
                    // long, so selected element was this
                    // element, select it
                    selModel.select(record)
                }
                // unconditionally expand element - either
                // we're looking for an accounting object to
                // select, or we want to expand it for users
                // convenience anyway
                record.expand()
            } else if (match == 1) { // record is an accounting
                selModel.select(record)
            }
            return false
        });
        this.updateTitle()
    }
})
