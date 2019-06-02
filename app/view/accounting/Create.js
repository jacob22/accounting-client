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

Ext.define('Bokf.view.accounting.Create', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.accountingcreate',

    requires: [
        'Bokf.view.accounting.CopyPreviousYear',
        'Bokf.view.accounting.FromTemplate',
        'Bokf.view.accounting.Upload'
    ],

    title: 'Create new fiscal year',

    autoScroll: true,

    layout: {
        type: 'vbox',
        align: 'stretch',
        padding: '5 5',
        defaultMargins: '0 0 5 0'
    },

    items: [
        {xtype: 'accounting-fromtemplate'},
        {xtype: 'container',

         layout: {
             type: 'hbox',
             align: 'stretch'
         },

         items: [
             {xtype: 'accounting-upload', flex: 1, margin: '0 5 0 0'},
             {xtype: 'accounting-copy', flex: 1}
         ]
        }
    ],

    showRecord: function(record) {
        var values = {org: record.get('parentId')}
        this.down('accounting-upload').getForm().setValues(values)
        this.down('accounting-fromtemplate').getForm().setValues(values)
        this.down('accounting-copy').getForm().setValues(values)
    }
})
