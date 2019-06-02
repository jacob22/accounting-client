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

fakeProxies('account', 'accounting', 'invitation', 'org', 'pgorder', 'user', 'verificationSeries')
Ext.syncRequire(['Bokf.controller.Org'])

Tests = {

test_create: function() {
    var ctrl = Ext.create('Bokf.controller.Subscription')
    ctrl.init()
},

test_subscribe: function() {
    var ctrl = Ext.create('Bokf.controller.Subscription')
    var org = Ext.create('Bokf.model.Org', {id: 27})
    var calls = []
    ctrl.callBLM = function(method, params, org, l10n, captionData) {
        calls.push([method, params, org.get('id'), l10n, captionData])
    }
    substitute({'Bokf.lib.ApplicationState.getSelectedOrg': function(cb, scope) {
        cb.call(scope, org)
    }}, function() { ctrl.subscribe() })
    ais(calls.length, 1)
},

test_connectpg: function() {
    var ctrl = Ext.create('Bokf.controller.Subscription')
    var org = Ext.create('Bokf.model.Org', {id: 27})
    var calls = []
    ctrl.callBLM = function(method, params, org, l10n, captionData) {
        calls.push([method, params, org.get('id'), l10n, captionData])
    }
    ctrl.getPGOrderForm = function() {
        return { getValues: function() { return 'values' } }
    }
    substitute({'Bokf.lib.ApplicationState.getSelectedOrg': function(cb, scope) {
        cb.call(scope, org)
    }}, function() {
        ctrl.connectpg()
    })
    ais(calls.length, 1)
},

test__addSubscriptionLevel: function() {
    var ctrl = Ext.create('Bokf.controller.Subscription')
    var org = Ext.create('Bokf.model.Org', {id: 27})
    //ctrl._addSubscriptionLevel(org, 'subscriber')
}

}
