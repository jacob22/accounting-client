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

Ext.define('Bokf.store.AccountTypes', {
    extend: 'Ext.data.Store',
    autoLoad: true,
    model: 'Bokf.model.AccountType',
    storeId: 'accounttype',

    proxy: {
        type: 'memory'
    },

    data: [
        // the names are based on
        // http://en.wikipedia.org/wiki/Double-entry_bookkeeping_system#Debits_and_credits
        {id: undefined, name: null},
        {id: 'T', name: 'Asset'},
        {id: 'S', name: 'Liability'},
        {id: 'K', name: 'Expense'},
        {id: 'I', name: 'Income'}
    ]
})
