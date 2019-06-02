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

Ext.define('Bokf.lib.TagsEditor', {
    extend: 'Ext.container.Container',
    alias: 'widget.tagseditor',

    requires: [
        'Bokf.lib.DisplayText'
    ],

    mixins: {
        field: 'Ext.form.field.Field'
    },

    layout: {
        type: 'hbox',
        padding: '0 10 0 0'
    },

    defaults: {
        isFormField: false
    },

    items: [
        {xtype: 'displaytext', tpl: '{0:htmlEncode}'},
        {xtype: 'tbspacer', width: 10},
        {xtype: 'combocheckbox', displayField: 'tag', flex: 1, maxWidth: 400},
        {xtype: 'tbspacer', width: 20},
        {xtype: 'textfield', name: '_newtag', enableKeyEvents: true}
    ],

    l10n: {
        emptyText: 'add new tag',
        label: 'Current tags:'
    },

    listeners: {
        beforerender: function() {
            this.getTextField().emptyText = this.l10n.emptyText
            this.getDisplayField().setText(this.l10n.label)
        }
    },

    bindStore: function(store) {
        this.down('combocheckbox').bindStore(store)
    },

    initComponent: function() {
        this.callParent(arguments)
        this.on('change', this.changed, this)
        this.getTextField().on('keypress', this.addTag, this)
        this.getComboCheckBox().on('change', this.comboChanged, this)
    },

    changed: function() {
        this.getComboCheckBox().setValue(this.value)
    },

    comboChanged: function(combo) {
        this.setValue(combo.getValue())
    },

    getComboCheckBox: function() {
        return this.down('combocheckbox')
    },

    getDisplayField: function() {
        return this.down('displaytext')
    },

    getTextField: function() {
        return this.down('textfield[name=_newtag]')
    },

    addTag: function(field, event) {
        if (event.getKey() != Ext.EventObject.ENTER) {
            return
        }
        var combo = this.getComboCheckBox()
        var store = combo.getStore()
        var tag = this.getTextField().getValue()

        var record = store.findRecord('tag', tag)
        if (!record) {
            var data = {tag: tag}
            record = store.add(data)[0]
            store.sync()
        }

        var data = combo.getValue()
        data.push(record.get('tag'))
        combo.setValue(data)

        field.reset()
    }
})
