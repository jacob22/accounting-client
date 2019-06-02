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

Ext.define('Bokf.lib.NumberRange', {
    extend: 'Ext.container.Container',
    alias: 'widget.numberrange',

    layout: 'hbox',
    regex: /^((\d|\d-\d)[, ]*)*$/,

    emptyText: null,
    label: null,
    example: null,

    l10n: {
        buttons: {
            reset: 'Reset'
        }
    },

    items: [
        {xtype: 'displayfield', name: 'label'},
        {xtype: 'tbspacer', width: 10},
        {xtype: 'textfield', name: 'input', grow: true, growMin: 100,
         listeners: {
             change: function(field, value) {
                 this.up('numberrange').down('[action=reset]').
                     setDisabled(!value)
             }
         }
        },
        {xtype: 'tbspacer', width: 10},
        {xtype: 'button', action: 'reset', disabled: true,
         listeners: {
             click: function() {
                 this.up('numberrange').down('[name=input]').
                     setValue(null)
             }
         }
        },
        {xtype: 'tbspacer', width: 20},
        {xtype: 'displayfield', name: 'example'}
    ],

    listeners: {
        beforerender: function() {
            var input = this.getInput()
            input.regex = this.regex
            input.emptyText = this.l10n.emptyText || this.emptyText
        },

        afterrender: function() {
            Bokf.lib.Utils.translateButtons(this, this.l10n.buttons)
            if (this.l10n.captions) {
                Bokf.lib.Utils.translateComponents(
                    this, this.l10n.captions, undefined, 'setValue')
            }
        }
    },

    setL10n: function(l10n) {
        this.l10n = [{}, this.l10n, l10n].reduce(Ext.Object.merge)
    },

    getInput: function() {
        return this.down('textfield[name=input]')
    },

    getValue: function() {
        return this.getInput().getValue()
    },

    isValid: function() {
        return this.getInput().isValid()
    }
})
