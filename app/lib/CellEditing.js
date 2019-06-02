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

Ext.define('Bokf.lib.CellEditing', {
    extend: 'Ext.grid.plugin.CellEditing',
    alias: 'plugin.cellediting-enteristab',

    clicksToEdit: 1,

    constructor: function(config) {
        this.callParent(arguments)
        this.addEvents('showeditor')
        this.relayedEvents = this.relayedEvents.concat(['showeditor'])
    },

    showEditor: function(ed, context, value) {
        this.fireEvent('showeditor', this, ed, context, value)
        this.callParent(arguments)
    },

    // Duplicates (copies) the functionality from
    // Ext.grid.plugin.CellEditing, but triggers on ENTER rather than
    // TAB.
    onSpecialKey: function(ed, field, e) {
        var sm;

        if (e.getKey() === e.ENTER) {
            e.stopEvent();

            if (ed) {
                // Allow the field to act on tabs before onEditorTab, which ends
                // up calling completeEdit. This is useful for picker type fields.
                ed.onEditorTab(e);
            }

            sm = ed.up('tablepanel').getSelectionModel();
            if (sm.onEditorTab) {
                return sm.onEditorTab(ed.editingPlugin, e);
            }
        }
        return this.callParent(arguments)
    },

    beforeEdit: function(context) {
        return !context.grid.readOnly
    }
})
