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

Ext.define('Bokf.model.Verification', {
    extend: 'Ext.data.Model',

    requires: ['Ext.Date'],

    fields: [
        'accounting',
        'number',
        'series',
        'transaction_date',
        {name: 'version', type: 'number', defaultValue: 0}
    ],

    hasMany: {model: 'Bokf.model.Transaction', name: 'transactions',
              foreignKey: 'verification'},

    proxy: {
        type: 'direct',
        api: {
            create: 'blm.accounting.Verification.create',
            read: 'blm.accounting.Verification.read',
            update: 'blm.accounting.Verification.update',
            destroy: 'blm.accounting.Verification.destroy'
        },
        reader: 'toi',
        writer: 'toi',
        extraParams: {
            attributes: [
                'accounting',
                'number',
                'series',
                'transaction_date',
                'version'
            ]
        }
    },

    get_transaction_date: function() {
        var datestr = this.get('transaction_date')
        return Ext.Date.parse(datestr, 'c') // c = ISO 8601 date
    }
})
