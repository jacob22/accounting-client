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

Ext.define('Bokf.lib.AccountingRules', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.accounting-rules',

    requires: [
        'Bokf.lib.AccountEditor',
        'Bokf.lib.CellEditing',
        'Bokf.lib.CurrencyEditor',
        'Bokf.lib.DeleteColumnPlugin',
        'Bokf.lib.ExpandingGridPlugin',
        'Ext.grid.feature.Summary'
    ],

    cls: 'accounting-rules',

    header: {
        cls: 'accounting-rules',
        border: 0
    },

    readOnly: false,
    accountsStore: null, // replace in controller
    features: [{ftype: 'summary'}],

    listeners: {
        showeditor: function(plugin, editor, context, value) {
            if (context.field == 'accountNumber' &&
                editor.field.store !== plugin.grid.accountsStore) {
                editor.field.bindStore(plugin.grid.accountsStore)
            }
        }
    },

    columns: {
        items: [
            {dataIndex: 'accountNumber', flex: 1,
             editor: {xtype: 'accounteditor', allowBlank: false, valueField: 'number',
                      submitValue: false},
             renderer: function(value, metadata, record, rowIndex, colIndex,
                                store, view) {
                 var account
                 if (this.accountsStore) {
                     account = this.accountsStore.findRecord('number', value)
                 }
                 return account ? account.get('display') : value
             },
             summaryRenderer: function() {
                 var text = this.up('product').l10n.rules.summary
                 return '<div style="text-align: right;">' + text + '</div>'
             }
            },
            {dataIndex: 'amount', align: 'right',
             editor: {xtype: 'currencyeditor', allowBlank: false, submitValue: false},
             renderer: Bokf.lib.Utils.currencyRendererFactory(2, true, ''),
             summaryType: 'sum',
             summaryRenderer: Bokf.lib.Utils.currencyRendererFactory(2, true, 0)
            }
        ]
    },

    plugins: [
        {ptype: 'cellediting-enteristab', pluginId: 'celleditor', clicksToEdit: 1},
        {ptype: 'expandinggrid', pluginId: 'expandinggrid',
         addHeaderTool: false,
         recordComplete: function(record) {
             return !!record.get('accountNumber')
         }
        },
        {ptype: 'deletecolumn', pluginId: 'deletecolumn',
         canDelete: function(record) {
             return !!record.get('accountNumber')
         }
        }
    ]
})
