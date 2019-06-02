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

Ext.define('Bokf.model.members.ProductReader', {
    extend: 'Bokf.lib.TOIReader',
    alias: 'reader.product',
    requires: 'Bokf.lib.Utils',

    readRecords: function(data) {
        // data may be the result of a remove operation
        // ({success: true}), in which case we don't need to process much
        if (data && data.success && data.tois) {
            Ext.each(data.tois, function(toi) {
                var rulesData = []
                for (var key in toi['accountingRules']) {
                    rulesData.push({'accountNumber': key,
                                    'amount': toi['accountingRules'][key]})
                }
                toi['accountingRules'] = rulesData

                optionFieldData = Bokf.lib.Utils.parseOptionFields(toi.optionFields)
                toi.optionFields = optionFieldData
            })
        }
        return this.callParent(arguments)
    }
})

Ext.define('Bokf.model.members.ProductWriter', {
    extend: 'Bokf.lib.TOIWriter',
    alias: 'writer.product',

    getRecordData: function(record) {
        var data = this.callParent(arguments)
        var rulesData = {}
        record.accountingRules().each(function(record) {
            var accountNumber = record.get('accountNumber')
            var amount = record.get('amount')
            if (accountNumber && amount) {
                rulesData[accountNumber] = amount
            }
            record.commit()
            return true
        });
        data['accountingRules'] = rulesData

        var fieldsData = []
        record.optionFields().each(function(record) {
            if (!record.get('label')) {
                return true
            }
            var fields = ['label', 'optdescr', 'type', 'mandatory', 'typedata'].map(function(field) {
                if (record.fields.get(field).type.type == 'bool') {
                    return  record.get(field) ? '1': '0'
                }
                return record.get(field)
            })
            fieldsData.push(fields.join('\u001f'))
            record.commit()
            return true
        });
        data['optionFields'] = fieldsData
        return data
    }
})

Ext.define('Bokf.model.members.Product', {
    extend: 'Ext.data.Model',
    requires: [
        'Bokf.lib.ObjectId',
        'Ext.data.association.HasMany'
    ],

    idgen: 'objectid',

    fields: [
        {name: 'archived', type: 'boolean'},
        {name: 'available', type: 'boolean'},
        'availableFrom',
        'availableTo',
        'description',
        {name: 'hasImage', type: 'boolean', persist: false},
        {name: 'makeTicket', type: 'boolean'},
        'name',
        'notes',
        'org',
        {name: 'quantitySold', type: 'int', persist: false},
        {name: 'sold', type: 'boolean', persist: false},
        {name: 'tags', type: 'blmlist', defaultValue: []},
        {name: 'totalStock', type: 'int', defaultValue: null, useNull: true},
        'vatAccount'
    ],

    hasMany: [{model: 'Bokf.model.members.AccountingRule',
               name: 'accountingRules'},
              {model: 'Bokf.model.members.OptionField',
               name: 'optionFields'}
             ],

    proxy: {
        type: 'product',
        extraParams: {
            attributes: [
                'accountingRules',
                'archived',
                'available',
                'availableFrom',
                'availableTo',
                'description',
                'hasImage',
                'makeTicket',
                'name',
                'notes',
                'optionFields',
                'org',
                'quantitySold',
                'sold',
                'tags',
                'totalStock',
                'vatAccount'
            ]
        },
        reader: 'product',
        writer: 'product'
    }
})

Ext.define('Bokf.model.members.AccountingRule', {
    extend: 'Ext.data.Model',
    requires: ['Ext.data.association.BelongsTo'],

    fields: [
        'accountNumber',
        {name: 'amount', type: 'number'},
        'product'
    ],

    belongsTo: {
        model: 'Bokf.model.members.Product',
        getterName: 'getProduct',
        setterName: 'setProduct'
    }
})

Ext.define('Bokf.model.members.OptionField', {
    extend: 'Ext.data.Model',
    requires: ['Ext.data.association.BelongsTo'],

    fields: ['label',
             'optdescr',
             {name: 'type', defaultValue: 'text'},
             {name: 'mandatory', type: 'boolean'},
             'typedata'],

    validations: [
        {type: 'inclusion', field: 'type',   list: ['text', 'textarea']}
    ],

    // xxx the belongsTo association is broken now that optionFields exist
    // in PurchaseItem as well.
    // It is probably unused though - investigate and remove if possible
    belongsTo: {
        model: 'Bokf.model.members.Product',
        getterName: 'getProduct',
        setterName: 'setProduct'
    }
})

Ext.define('Bokf.model.members.OptionFieldType', {
    extend: 'Ext.data.Model',
    fields: ['id', 'name']
})

Ext.define('Bokf.store.members.OptionFieldType', {
    extend: 'Ext.data.Store',
    alias: 'store.optionfieldtypes',
    model: 'Bokf.model.members.OptionFieldType',

    data : [
        {id: 'text', name: 'Text field'},
        {id: 'textarea', name: 'Text area'},
        {id: 'personnummer', name: 'Swedish personal ID number'},
        {id: 'select', name: 'Multiple choice'}
     ]
})

Ext.define('Bokf.model.members.SelectOptionField', {
    extend: 'Ext.data.Model',
    fields: ['name'],

    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'options'
        },
        writer: 'json'
    }
})
