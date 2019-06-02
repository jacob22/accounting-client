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

Ext.define('Bokf.model.Transaction', {
    extend: 'Ext.data.Model',
    fields: [
        'account',
        { name: 'amount', type: 'number'},
        { name: 'text', type: 'string'},
        'verification',
        {name: 'version', type: 'number', defaultValue: 0}
    ],
    associations: [
        { type: 'belongsTo', model: 'Bokf.model.Account', foreignKey: 'account',
          getterName: 'getAccount', setterName: 'setAccount' }
    ],
    proxy: {
        type: 'direct',
        api: {
            create: 'blm.accounting.Transaction.create',
            read: 'blm.accounting.Transaction.read',
            update: 'blm.accounting.Transaction.update',
            destroy: 'blm.accounting.Transaction.destroy'
        },
        writer: 'toi',
        reader: 'toi',
        extraParams: {
            attributes: [
                'account',
                'amount',
                'text',
                'transaction_date',
                'verification',
                'version'
            ]
        }
    },

    isEmpty: function() {
        return !this.get('account') && !this.get('text') && !this.get('verification')
    }
})
