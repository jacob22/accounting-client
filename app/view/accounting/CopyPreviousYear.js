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

Ext.define('Bokf.view.accounting.CopyPreviousYear', {
    extend: 'Ext.form.Panel',
    alias: 'widget.accounting-copy',

    bodyPadding: 10,
    frame: true,
    items: [
        {xtype: 'component'},
        {xtype: 'hiddenfield', name: 'org'}
    ],

    buttons: [{action: 'submit'}],

    l10n: {
        title: 'Copy previous year',
        html: '\
This will create a new fiscal year based on the previous one. \
All accounts will be copied, and opening balance will be set to the closing \
balance of the previous year.',
        buttonText: 'Copy'
    },

    listeners: {
        beforerender: {
            fn: function() {
                this.setTitle(this.l10n.title)
                this.items.items[0].html = this.l10n.html
                this.down('button[action=submit]').setText(this.l10n.buttonText)
            }
        }
    }
})
