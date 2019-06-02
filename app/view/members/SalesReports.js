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

Ext.define('Bokf.view.members.SalesReports', {
    extend: 'Ext.Container',
    alias: 'widget.salesreports',

    requires: [
        'Bokf.lib.Utils',
        'Ext.ux.IFrame'
    ],

    layout: 'border',
    items: [
        {xtype: 'toolbar',
         region: 'north',
         layout: 'hbox',
         items: [
             ' ',
             {xtype: 'displayfield', name: 'selectorlabel'},
             ' ',
             {xtype: 'combobox', name: 'productselector',
              displayField: 'name', valueField: 'id',
              autoSelect: false, editable: false, width: 350},
             {xtype: 'tbspacer', width: 20},

             {xtype: 'splitbutton', action: 'generate',
              menu: {
                  items: [
                      {action: 'generate'},
                      {action: 'print'},
                      {action: 'save'},
                      {action: 'newwin'}
                  ]
              }
             }
         ]
        },
        {autoScroll: true, region: 'center', name: 'report'},
        {xtype: 'uxiframe', name: 'printframe', hidden: true}
    ],

    l10n: {
        selector: {
            emptyText: 'Not selected',
            label: 'Product:'
        },
        actions: {
            generate: 'Generate report',
            print: 'Print report',
            save: 'Save report',
            newwin: 'Open report in new window'
        }
    },

    listeners: {
        beforerender: function() {
            this.down('[name=selectorlabel]').setValue(this.l10n.selector.label)
            this.down('[name=productselector]').emptyText = this.l10n.selector.emptyText
            Bokf.lib.Utils.translateComponents(
                this, this.l10n.actions, 'component[action={0}]')
        }
    }
})
