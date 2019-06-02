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

Ext.define('Bokf.view.org.APIUser', {
    extend: 'Ext.form.Panel',
    alias: 'widget.apiuser',

    requires: [
        'Bokf.lib.DisplayText'
    ],

    l10n: {
        emptyTexts: {
            apikey: 'There is no API Key.'
        },
        fieldLabels: {
            apikey: 'API Key'
        },
        texts: {
            help: '<a href="{url}" target="_blank">What\'s this?</a>'
        },
        buttons: {
            generatekey: 'Generate API Key'
        }
    },

    bodyPadding: 5,

    layout: 'hbox',

    fieldDefaults: {
        labelWidth: 150
    },

    trackResetOnLoad: true,

    items: [
        {name: 'apikey', xtype: 'textfield', width: 435, readOnly: true},
        {xtype: 'component', html: '\xa0', flex: 1},
        {name: 'help', xtype: 'displayhtml'}
    ],

    buttons: [
        '->',
        {action: 'generatekey', hidden: true}
    ],

    listeners: {
        beforerender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
            Bokf.lib.Utils.translateButtons(this, this.l10n.buttons)
            Bokf.lib.Utils.translateComponents(
                this, this.l10n.emptyTexts, undefined, function(comp, val) {
                    comp.emptyText = val
                })
            Bokf.lib.Utils.translateComponents(
                this, this.l10n.texts, undefined, undefined,
                {url: 'http://www.eutaxia.se/#tab_api'})
       }
    },

    loadRecord: function(record) {
        this.callParent(arguments)
        var hasKey = !!record.get('apikey')
        this.down('button[action=generatekey]').setVisible(!hasKey)
    }
})
