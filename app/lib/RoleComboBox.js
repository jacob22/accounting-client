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

Ext.define('Bokf.lib.RoleComboBox', {
    extend: 'Bokf.lib.ComboCheckBox',
    alias: 'widget.rolecombo',

    requires: [
        'Bokf.store.Roles'
    ],
    store: 'roles',

    valueField: 'id',
    displayField: 'name',

    matchFieldWidth: false,
    forceSelection: true,

    noEdit: false,

    listeners: {
        change: function(combo, newValue, oldValue) {
            var roles = newValue
            var isMember = (roles.indexOf('admin') != -1 ||
                            roles.indexOf('accountant') != -1 ||
                            roles.indexOf('storekeeper') != -1 ||
                            roles.indexOf('ticketchecker') == -1)
            if (isMember && roles.indexOf('member') == -1) {
                roles.push('member')
                combo.setValue(roles)
            }
        },

        beforedeselect: function() {
            return !this.noEdit
        },

        beforeselect: function() {
            return !this.noEdit
        }
    }
})
