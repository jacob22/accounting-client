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

Ext.define('Bokf.lib.ApplicationState', {
    singleton: true,

    requires: [
        'Ext.state.Manager',
        'Ext.state.CookieProvider',
        'Ext.state.LocalStorageProvider',
        'Bokf.store.Orgs'
    ],

    constructor: function() {
        this.manager = Ext.state.Manager
        var provider
        if (Ext.supports.LocalStorage) {
            provider = new Ext.state.LocalStorageProvider()
        } else {
            provider = new Ext.state.CookieProvider()
        }
        this.manager.setProvider(provider)
    },

    setSelectedAccounting: function(record) {
        this.manager.set('selected-accounting', record.get('id'))
        this.manager.set('selected-org', record.get('org'))
    },

    setSelectedOrg: function(record) {
        this.manager.set('selected-org', record.get('id'))
        this.manager.clear('selected-accounting')
    },

    getSelectedOrg: function(callback, scope) {
        var id = this.manager.get('selected-org', null)
        var store = Ext.getStore('orgs')
        return this._getRecord(store, id, callback, scope)
    },

    _getRecord: function(store, id, callback, scope) {
        callback = Ext.bind(callback, scope)
        if (id == null) {
            callback(null)
        } else {
            var record
            if (record = store.getById(id)) {
                callback(record)
            } else {
                store.on('load', function(store) {
                    if (record = store.getById(id)) {
                        callback(record)
                    }
                }, this, {single: true})
            }
        }
    }
})
