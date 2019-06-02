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

Ext.define('Bokf.view.org.Invite', {
    extend: 'Ext.form.Panel',
    alias: 'widget.invite',

    requires: ['Bokf.lib.RoleComboBox'],

    bodyPadding: 5,

    trackResetOnLoad: true,

    items: [
        {xtype: 'textfield', name: 'email', inputType: 'email', size: 40,
         regex: /^.+@.+$/, allowBlank: false},
        {xtype: 'rolecombo', name: 'roles', value: ['member']},
        {xtype: 'hiddenfield', name: 'org'}
    ],
    buttons: [
        {action: 'invite', formBind: true}
    ],

    l10n: {
        title: 'Invite a new user',
        fieldLabels: {
            email: 'E-mail address',
            roles: 'Roles'
        },
        buttons: {
            invite: 'Invite'
        }
    },

    listeners: {
        beforerender: {
            fn: function() {
                this.setTitle(this.l10n.title)
                this.items.each(function(item) {
                    item.fieldLabel = this.l10n.fieldLabels[item.name]
                }, this);
                this.down('button[action=invite]').setText(
                    this.l10n.buttons.invite)
            }
        }
    }
})
