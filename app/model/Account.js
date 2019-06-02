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

Ext.define('Bokf.model.Account', {
    extend: 'Ext.data.Model',
    requires: ['Bokf.lib.BLMTypes',
               'Bokf.store.AccountTypes'],

    fields: [
        {name: 'accounting'},
        {name: 'balance', type: 'number', persist: false},
        {name: 'budget', type: 'number'},
        {name: 'name'},
        {name: 'number'},
        {name: 'opening_balance', defaultValue: 0},
        {name: 'transactions', type: 'blmlist', defaultValue: [], persist: false},
        {name: 'type', defaultValue: undefined},
        {name: 'vatCode', defaultValue: undefined},
        {name: 'vatPercentage', persist: false,
         convert: function(value, record) {
             if (value != null) {
                 value /= 100
             }
             return value
         }
        },
        // client side:
        {name: 'display', persist: false,
         convert: function(v, record) {
             return Ext.String.format(
                 '{0} {1}',  record.get('number'), record.get('name'))
         }
        }
    ],

    proxy: {
        type: 'account',
        extraParams: {
            attributes: [
                'accounting',
                'balance',
                'budget',
                'name',
                'number',
                'opening_balance',
                'transactions',
                'type',
                'vatCode',
                'vatPercentage'
            ]
        }
    },

    validations: [
        {field: 'number', type: 'format', matcher: /[0-9]{4}/}
    ],

    canBeDeleted: function() {
        return (this.get('transactions').length == 0 &&
                this.get('opening_balance') == 0)
    },

    get_description: function() {
        return (this.get('number') + " " + this.get('name')).trim()
    },

    get_type_name: function() {
        var store = Ext.getStore('Bokf.store.AccountTypes')
        return store.getById(self.get('type')).get('name')
    }
})
