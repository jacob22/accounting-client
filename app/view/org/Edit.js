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

Ext.define('Bokf.view.org.Edit', {
    extend: 'Ext.form.Panel',
    requires: ['Ext.grid.Panel',
               'Bokf.lib.ImageUpload',
               'Bokf.lib.OrgNum',
               'Bokf.lib.Utils',
               'Bokf.model.User'],
    alias: 'widget.orgedit',

    cls: 'orgedit',

    autoShow: true,

    l10n: {
        fieldLabels: {
            name: 'Name',
            orgnum: 'Organisation number',
            phone: 'Phone number',
            address: 'Address',
            email: 'Email address',
            url: 'Web address',
            seat: 'Registered office',
            vatnum: 'VAT regno',
	    currency: 'Currency',
	    fskatt: 'F-skattsedel'
	},
        logoButton: {
            add: 'Add logo',
            change: 'Change logo',
            'delete': 'Delete logo'
        },
        titles: {
            phantom: 'Create new organisation'
        },
        buttons: {
            save: {
                phantom: 'Create',
                real: 'Save'
            },
            cancel: {
                phantom: 'Clear',
                real: 'Revert'
            }
        },
        tos: {
            title: 'Terms of service',
            text: 'In order to continue you must agree to the '+
                '<a target="_new" href="http://www.eutaxia.se/#tab_agreement">terms of service<a> '+
                'on behalf of the organisation.',
            label: 'I agree'
        }
    },

    bodyPadding: 5,

    fieldDefaults: {
        labelWidth: 150
    },

    trackResetOnLoad: true,

    items: [
        {name: 'name', xtype: 'textfield', allowBlank: false},
        {name: 'orgnum', xtype: 'orgnum', allowBlank: false},
        {name: 'email', xtype: 'textfield', vtype: 'email', allowBlank: false},
        {name: 'url', xtype: 'textfield'},
        {name: 'address', xtype: 'textarea', cols: 40},
        {name: 'phone', xtype: 'textfield'},
        {name: 'seat', xtype: 'textfield'},
        {name: 'fskatt', xtype: 'checkbox'},
	{name: 'vatnum', xtype: 'textfield'},
	//{name: 'currency', xtype: 'combobox', store: ['SEK', 'EUR'], value: 'SEK',
	// forceSelection: true, editable: false},
	{name: 'logotype', xtype: 'imageupload'},
        {name: 'tos', xtype: 'fieldset', margin: '10 0 0 0',
         items: [
             {xtype: 'displayhtml'},
             {xtype: 'checkbox', labelAlign: 'right',
              isValid: function() {
                  return this.disabled || this.getValue()
              }}
         ]
        }
    ],

    buttons: [
        '->',
        {action: 'save'},
        {action: 'cancel'}
    ],

    listeners: {
        beforerender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
            this.down('imageupload[name=logotype]').setText(
                this.l10n.logoButton)

            var tos = this.down('fieldset[name=tos]')
            tos.setTitle(this.l10n.tos.title)
            tos.down('displayhtml').setText(this.l10n.tos.text)
            tos.down('checkbox').setBoxLabel(this.l10n.tos.label)
       }
    },

    loadRecord: function loadRecord(record) {
        var save = this.down('[action=save]')
        var cancel = this.down('[action=cancel]')
        var tos = this.down('[name=tos]')

        this.callParent(arguments)

        if (record.phantom) {
            this.setTitle(this.l10n.titles.phantom)
            save.setText(this.l10n.buttons.save.phantom)
            cancel.setText(this.l10n.buttons.cancel.phantom)
            tos.down('checkbox').setValue(false)
            tos.show()
            tos.enable()
        } else {
            this.setTitle(record.get('name'))
            save.setText(this.l10n.buttons.save.real)
            cancel.setText(this.l10n.buttons.cancel.real)
            tos.hide()
            tos.disable()
        }
        this.down('[name=logotype]').setImage(record)
        this.updateButtonState()
        this.updateAdminState()
    },

    updateAdminState: function() {
        var isAdmin = this.getRecord().isAdmin()

        Bokf.lib.Utils.setOEReadOnly(this.query('imageupload'), !isAdmin)
        Bokf.lib.Utils.setOEReadOnly(this.query('button'), !isAdmin)
        Bokf.lib.Utils.setOEReadOnly(this.query('field'), !isAdmin)

    },

    updateButtonState: function() {
        var save = this.down('[action=save]')
        var cancel = this.down('[action=cancel]')

        var isAdmin = this.getRecord().isAdmin()
        var valid = this.isValid()
        var dirty = this.isDirty()

        var saveEnabled = dirty && valid && isAdmin
        var cancelEnabled = dirty

        save.setDisabled(!saveEnabled)
        cancel.setDisabled(!cancelEnabled)
    }
})
