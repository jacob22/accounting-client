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

Ext.define('Bokf.view.accounting.Upload', {
    extend: 'Ext.form.Panel',
    alias: 'widget.accounting-upload',
    bodyPadding: 10,
    frame: true,
    items: [{xtype: 'filefield', name: 'siefile', allowBlank: false,
             anchor: '100%'},
            {xtype: 'hiddenfield', name: 'org'}],

    buttons: [{action: 'import'}],

    l10n: {
        title: 'Import SIE file',
        fieldLabel: 'SIE file',
        fieldButtonText: 'Choose file...',
        button: 'Import'
    },

    listeners: {
        beforerender: {
            fn: function() {
                this.setTitle(this.l10n.title)
                var field = this.down('filefield')
                field.fieldLabel = this.l10n.fieldLabel
                field.buttonText = this.l10n.fieldButtonText
                this.down('button[action=import]').setText(this.l10n.button)
            }
        }
    }
})
