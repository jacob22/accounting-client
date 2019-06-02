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

Ext.define('Bokf.view.accounting.FromTemplate', {
    extend: 'Ext.form.Panel',
    alias: 'widget.accounting-fromtemplate',
    requires: [
        'Bokf.store.ChartOfAccounts'
    ],

    bodyPadding: 10,
    frame: true,
    items: [
        {xtype: 'radiogroup', layout: 'vbox',
         items: []  // these are populated by _coaChanged() below
        },
        {xtype: 'hiddenfield', name: 'org'}
    ],

    buttons: [{action: 'submit'}],

    l10n: {
        title: 'Create from chart of accounts',
        buttons: {
            submit: 'Create'
        }
    },

    listeners: {
        afterrender: function() {
            this.setTitle(this.l10n.title)
            Bokf.lib.Utils.translateButtons(this, this.l10n.buttons)
        }
    },

    initComponent: function initComponent() {
        this.callParent()
        var store = Ext.create('Bokf.store.ChartOfAccounts')
        store.on('datachanged', this._coaChanged, this)
        store.load()
    },

    _coaChanged: function(store) {
        var group = this.down('radiogroup')
        var checked = true

        group.removeAll()

        store.each(function(record) {
            var button = Ext.create('Ext.form.field.Radio', {
                boxLabel: record.get('name'),
                inputValue: record.get('id'),
                name: 'chartofaccounts',
                checked: checked  // let first element be checked by default
            })
            group.add(button)
            checked = false
        })
    }
})
