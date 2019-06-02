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

Ext.define('Bokf.model.VerificationSeries', {
    extend: 'Ext.data.Model',
    fields: ['accounting',
             {name: 'canBeDeleted', type: 'bool', defaultValue: true, persist: false},
             'description',
             'name',

             {name: 'display', persist: false,
              convert: function(v, record) {
                  if (record.get('description')) {
                      return Ext.String.format(
                          '{0} - {1}',  record.get('name'), record.get('description'))
                  } else {
                      return record.get('name')
                  }
              }
             }
            ],

    validations: [
        {field: 'name', type: 'length', min: 1}
    ],

    hasMany: [
        {model: 'Bokf.model.Verification', name: 'verifications',
         foreignKey: 'series'}
    ],

    proxy: {
        type: 'verificationseries',
        extraParams: {
            attributes: [
                'accounting',
                'canBeDeleted',
                'description',
                'name'
            ]
        }
    }
})
