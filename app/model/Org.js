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

Ext.define('Bokf.model.Org', {
    extend: 'Ext.data.Model',
    requires: ['Bokf.lib.ObjectId',
               'Bokf.model.Accounting',
               'Bokf.model.Invitation',
               'Bokf.model.PaysonProvider',
               'Bokf.model.PlusgiroProvider',
               'Bokf.model.PGOrder',
               'Bokf.model.SeqrProvider',
               'Bokf.model.SimulatorProvider',
	       'Bokf.model.StripeProvider',
               'Bokf.model.SwishProvider',
               'Bokf.model.IzettleProvider',
	       'Bokf.lib.BLMTypes',
               'Bokf.store.Accounts',
               'Bokf.store.VerificationSeries'
              ],

    idgen: 'objectid',

    fields: [
        'address',
	{name: 'apikey', persist: false},
	{name: 'currency', defaultValue: 'SEK'},
        'email',
        {name: 'fskatt', type: 'boolean', defaultValue: false},
        {name: 'hasImage', type: 'boolean', persist: false},
        'name',
        'orgnum',
        'phone',
        'seat',
        {name: 'subscriptionLevel', type: 'blmlist', defaultValue: []},
        {name: 'ug', persist: false},
        'url',
        'vatnum',
        {name: 'permissions', type: 'blmlist', defaultValue: [], persist: false},
        {name: 'userpermissions', type: 'blmlist', persist: false},
        // for org tree list:
        {name: 'leaf', type: 'boolean', persist: false,
         defaultValue: false},
        {name: 'parentId', type: 'string', persist: false,
         defaultValue: null, useNull: false},
        {name: 'iconCls', defaultValue: 'invisible', persist: false}
    ],

    hasMany: [
        {model: 'Bokf.model.Accounting', name: 'accountings', foreignKey: 'org',
         storeConfig: {
             // currentAccountingYear() depends on sort order
             sorters: ['start']
         },
         autoLoad: true},
        {model: 'Bokf.model.Invitation', name: 'invitations', foreignKey: 'org',
         autoLoad: true},
        {model: 'Bokf.model.PGOrder', name: 'pgorders', foreignKey: 'org',
         autoLoad: true},

        {model: 'Bokf.model.SimulatorProvider', name: 'simulatorprovider', foreignKey: 'org',
         autoLoad: true},
        {model: 'Bokf.model.PlusgiroProvider', name: 'plusgiroprovider', foreignKey: 'org',
         autoLoad: true},
        {model: 'Bokf.model.PaysonProvider', name: 'paysonprovider', foreignKey: 'org',
         autoLoad: true},
        {model: 'Bokf.model.SeqrProvider', name: 'seqrprovider', foreignKey: 'org',
	 autoLoad: true},
	{model: 'Bokf.model.StripeProvider', name: 'stripeprovider', foreignKey: 'org',
	 autoLoad: true},
        {model: 'Bokf.model.SwishProvider', name: 'swishprovider', foreignKey: 'org',
         autoLoad: true},
        {model: 'Bokf.model.IzettleProvider', name: 'izettleprovider', foreignKey: 'org',
	 autoLoad: true}
    ],

    proxy: {
        type: 'org',
        extraParams: {
            attributes: [
                'address',
		'apikey',
		'currency',
                'email',
                'fskatt',
                'hasImage',
                'name',
                'orgnum',
                'phone',
                'seat',
                'subscriptionLevel',
                'ug',
                'url',
                'userpermissions',
                'vatnum',
                'permissions', 'admins' // Extra attrs for permissions
            ]
        }
    },

    isAdmin: function() {
        return this.phantom || this.get('permissions').indexOf('admins') != -1
    },

    isAccountant: function() {
        return this.get('permissions').indexOf('accountants') != -1
    },

    isStoreKeeper: function() {
        return this.get('permissions').indexOf('storekeepers') != -1
    },

    isMember: function() {
        return this.get('permissions').indexOf('members') != -1
    },

    currentAccountingYear: function() {
        return this.accountings().last() // accountings store is sorted
    },

    _currentAccountingYearStore: function(type, load, filters) {
        var accounting = this.currentAccountingYear()
        var args = {}
        if (accounting) {
            args.filters = filters || []
            args.filters.push({id: 'accounting',
                               property: 'accounting',
                               value: accounting.get('id')})
        } else {
            args.proxy = 'memory'
        }
        var store = Ext.create('Bokf.store.' + type, args)
        if (load) {
            store.load()
        }
        return store
    },

    currentSeries: function(load) {
        return this._currentAccountingYearStore('VerificationSeries', load)
    },

    currentAccounts: function(load) {
        return this._currentAccountingYearStore('Accounts', load)
    },

    currentVatAccounts: function(load) {
        var filter = {property: 'vatPercentage',
                      value: {
                          op: 'NotEmpty',
                          // the following is needed for tricking
                          // ExtJs into believing the filter is a
                          // regex, and evaluating it by invoking
                          // test() rather than comparing the value
                          // with a string representation of this
                          // object
                          exec: true, test: function(value) {
                              return value != null
                          }
                      }
                     }
        return this._currentAccountingYearStore('Accounts', load, [filter])
    }
})
