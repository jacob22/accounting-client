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

Ext.define('Bokf.model.SwishProvider', {
    extend: 'Ext.data.Model',
    requires: ['Ext.Date'],

    fields: [
        'org',
        'account',
        'series',
        'swish_id',
        'cert',
        {name: 'csr', persist: false},
        {name: 'cert_expires', persist: false,
         convert: function(value, record) {
             if (!value) {
                 return ''
             }
             return Ext.Date.format(new Date(value * 1000), 'Y-m-d H:i:s')
         }
        }
    ],

    proxy: {
        type: 'swishprovider',
        extraParams: {
            attributes: [
                'org',
                'account',
                'series',
                'swish_id',
                'cert',
                'csr',
                'cert_expires'
            ]
        }
    }
})
