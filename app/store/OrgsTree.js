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

Ext.define('Bokf.model.AddAccounting', {
    extend: 'Ext.data.Model',
    fields: ['name',
             {name: 'leaf', type: 'boolean', defaultValue: true, persist: false},
             {name: 'parentId', type: 'string', mapping: 'org', persist: false},
             {name: 'iconCls', defaultValue: 'invisible', persist: false},
             {name: 'cls', defaultValue: 'addAccounting', persist: false}
            ],
    proxy: {type: 'memory'}
})


Ext.define('Bokf.model.AddOrg', {
    extend: 'Ext.data.Model',
    fields: ['name',
             {name: 'leaf', type: 'boolean', defaultValue: true, persist: false},
             {name: 'iconCls', defaultValue: 'invisible', persist: false},
             {name: 'cls', defaultValue: 'addOrg', persist: false}
            ],
    proxy: {type: 'memory'}
})


Ext.define('Bokf.proxy.OrgsTree', {
    extend: 'Ext.data.proxy.Server',
    alias: 'proxy.orgstree',
    requires: [
        'Bokf.lib.Utils',
        'Bokf.store.Orgs'
    ],
    orgsStore: {type: 'orgs'},

    l10n: {
        newOrg: 'Create new organisation',
        newAccounting: 'Create new fiscal year'
    },

    read: function read(operation, callback, scope) {
        var store = this.orgsStore = Ext.getStore(this.orgsStore)
        if (operation.id != 'root') {
            // accountings store autoloads, so no reason to force loading
            store = operation.node.accountings()
        } else {
            store.load()
        }

        Bokf.lib.Utils.waitForStores([store], function() {
            this._loaded(operation, callback, scope, store.getRange())
        }, this)
    },

    _loaded: function _loaded(operation, callback, scope, records) {
        if (operation.id != 'root') {  // sub tree with accounting objects
            if (operation.node.isAccountant()) {
                var add = new Bokf.model.AddAccounting()
                add.set('parentId', operation.id)
                add.set('name', '+ ' + this.l10n.newAccounting)
                records.push(add)
            }
        } else {
            var add = new Bokf.model.AddOrg()
            add.set('name', '+ ' + this.l10n.newOrg)
            records.push(add)
        }

        var resultSet = new Ext.data.ResultSet({
            total: records.length,
            count: records.length,
            records: records,
            success: true})
        operation.resultSet = resultSet

        operation.setCompleted()
        operation.setSuccessful()
        Ext.callback(callback, scope || this, [operation])
    }
})


Ext.define('Bokf.store.OrgsTreeSorter', {
    sorterFn: function(o1, o2) {
        if (o1 instanceof Bokf.model.AddOrg ||
            o1 instanceof Bokf.model.AddAccounting) {
            return 1
        }
        if (o2 instanceof Bokf.model.AddOrg ||
            o2 instanceof Bokf.model.AddAccounting) {
            return -1
        }
        return o1.get('name').localeCompare(o2.get('name'))
    }
})


Ext.define('Bokf.store.OrgsTree', {
    extend: 'Ext.data.TreeStore',
    model: 'Bokf.model.Org',

    requires: ['Bokf.model.Accounting'],
    proxy: {
        type: 'orgstree'
    },

    sorters: [Ext.create('Bokf.store.OrgsTreeSorter')],

    setRootNode: function() {
        Ext.data.NodeInterface.decorate(Bokf.model.Accounting)
        Ext.data.NodeInterface.decorate(Bokf.model.AddAccounting)
        Ext.data.NodeInterface.decorate(Bokf.model.AddOrg)
        return this.callParent(arguments)
    }
})
