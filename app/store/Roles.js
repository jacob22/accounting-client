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

Ext.define('Bokf.store.Roles', {
    extend: 'Ext.data.Store',
    autoLoad: true,
    model: 'Bokf.model.Role',
    storeId: 'roles',

    proxy: {
        type: 'memory'
    },

    data: [
        {id: 'admin', name: 'Administrator'},
        {id: 'accountant', name: 'Accountant'},
        {id: 'storekeeper', name: 'Store keeper'},
        {id: 'member', name: 'User'},
        {id: 'ticketchecker', name: 'Ticket checker'}
    ],

    statics: {
        get_description: function(value) {
            var store = Ext.getStore('roles')
            if (value.indexOf('admin') != -1) {
                return store.getById('admin').get('name')
            } else if (value.indexOf('accountant') != -1) {
                return store.getById('accountant').get('name')
            } else if (value.indexOf('storekeeper') != -1) {
                return store.getById('storekeeper').get('name')
            } else if (value.indexOf('member') != -1) {
                return store.getById('member').get('name')
            } else if (value.indexOf('ticketchecker') != -1) {
                return store.getById('ticketchecker').get('name')
            }
            return value.join(', ')
        }
    }
})
