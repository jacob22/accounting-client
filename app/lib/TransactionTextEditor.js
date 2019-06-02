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

Ext.define('Bokf.lib.TransactionTextEditor.Model', {
    extend: 'Ext.data.Model',
    fields: ['org',
             'text',
             {name: 'meta', type: 'boolean', defaultValue: false},
             {name: 'value',
              convert: function(v, record) {
                  return record.get('meta') ? '' : record.get('text')
              }
             }
            ]
})


Ext.define('Bokf.lib.TransactionTextEditor.Store', {
    extend: 'Ext.data.Store',
    storeId: 'transactiontext',
    model: 'Bokf.lib.TransactionTextEditor.Model',

    sorters: [
        {property: 'meta', direction: 'DESC'},
        {property: 'text', direction: 'ASC'}
    ],

    proxy: {
        type: 'direct',
        directFn: 'blm.accounting.transactionIndex.call'
    },

    // listeners: {
    //     load: function() {
    //         this.add({
    //             text: '\xa0', // no break space
    //             meta: true,
    //             org: this.orgid
    //         })
    //     }
    // },

    filterByOrg: function(orgid) {
        this.orgid = orgid
        this.filter({id: 'org', property: 'org', value: this.orgid})
    },

    reset: function() {
        // disable filter coming from combobox...
        this.filters.each(function(filter) {
            if (filter.id != 'org') {
                filter.disabled = true
            }
        });
        this.filter()
    },

    register: function(org, transactions) {
        this.reset()
        var meta
        while (meta = this.findRecord('meta', true)) {
            this.remove(meta)
        }

        transactions.each(function(transaction) {
            var text = transaction.get('text')
            if (text && this.find('text', text) == -1) {
                var data = {org: org, text: text, meta: false}
                this.add(data)
            }
        }, this);
    },

    register_text: function(text) {
        text = text.trim()
        if (!text || this.find('text', text) != -1) {
            return
        }
        this.add({
            text: text,
            org: this.orgid,
            meta: true
        })
    }
})


Ext.define('Bokf.lib.TransactionTextEditor', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.transactiontexteditor',

    store: 'transactiontext',

    valueField: 'value',
    displayField: 'text',
    queryMode: 'local',
    hideTrigger: true,
    autoSelect: false,

    enableKeyEvents: true

    // listeners: {
    //     keyup: function(textfield, event) {
    //         if (textfield.getValue() == null) {
    //             var picker = this.getPicker()
    //             // highlight the first (empty) element
    //             picker.highlightItem(picker.getNode(this.getStore().first()))
    //         }
    //     }
    // }
})
