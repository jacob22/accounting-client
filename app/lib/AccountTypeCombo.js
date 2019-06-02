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

Ext.define('Bokf.lib.AccountTypeCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.accounttypecombo',

    requires: ['Bokf.store.AccountTypes'],
    store: 'accounttype',

    cls: 'accounttype-combo',

    valueField: 'id',
    displayField: 'name',

    allowBlank: true,
    matchFieldWidth: false,
    forceSelection: true,
    queryMode: 'local',

    tpl: Ext.create(
        'Ext.XTemplate',
        '<tpl for=".">',
        '  <tpl if="id">',
        '    <div class="x-boundlist-item">{name}</div>',
        '  <tpl else>',
        '    <div class="x-boundlist-item">\xa0</div>',
        '  </tpl>',
        '</tpl>')
})
