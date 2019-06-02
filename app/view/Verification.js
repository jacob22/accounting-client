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

Ext.define('Bokf.view.Verification', {
    extend: 'Ext.Container',
    alias: 'widget.verification',

    requires: [
        'Bokf.lib.Utils',
        'Bokf.view.Transactions'
    ],

    layout: 'vbox',
    autoScroll: true,
    border: 0,

    items: [
        {xtype: 'container',
         name: 'transactions-card',
         layout: 'card',
         flex: 1,
         width: '100%',

         items: [
             {xtype: 'container', itemId: 'blank'},
             {xtype: 'container', itemId: 'empty',
              cls: 'empty-transactions',
              padding: '50 50 50 50',
              layout: {type: 'fit'},
              items: [{xtype: 'component', width: '80%', name: 'empty-caption',
                       style: {'text-align': 'center', 'font-size': '120%'}}]
             },
             {xtype: 'transactions', itemId: 'transactions',
              border: 0,
              dockedItems: [
                  {xtype: 'verificationform', dock: 'top'}
              ],
              buttons: [
                  {action: 'revert', tooltipType: 'title', hidden: true},
                  {action: 'print', tooltipType: 'title'},
                  {action: 'save', tooltipType: 'title'}
              ]
             }
         ]
        },
        {xtype: 'uxiframe', name: 'printframe', height: 0}

    ],

    l10n: {
        noSeriesCaption: ('You need to select an fiscal year with at '+
                          'least one verification series in order to '+
                          'create a new verification.'),
        buttons: {
            texts: {
                revert: 'Revert',
                save: 'Save',
                print: 'Print'
            },
            tooltips: {
                save: 'Keypad\xa0+'
            }
        }
    },

    listeners: {
        beforerender: function() {
            var caption = this.down('container [name=empty-caption]')
            caption.html = this.l10n.noSeriesCaption
        },

        afterrender: function() {
            Bokf.lib.Utils.translateComponents(this, this.l10n.buttons.texts,
                                               '[action={0}]')
            Bokf.lib.Utils.translateComponents(this, this.l10n.buttons.tooltips,
                                               '[action={0}]', 'setTooltip')
        }
    }
})

Ext.define('Bokf.view.VerificationFormPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.verificationform',

    requires: [
        'Bokf.lib.Date',
        'Bokf.lib.SeriesEditor',
        'Bokf.lib.VerNumber'
    ],

    border: 0,
    trackResetOnLoad: true,

    l10n: {
        fieldLabels: {
            series: 'Series',
            number: 'Number',
            transaction_date: 'Date'
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
        }
    },

    items: [
        {xtype: 'toolbar', layout: 'hbox', dock: 'top', border: 0,
         defaults: {labelWidth: 60},
         items: [
             {xtype: 'series', name: 'series'},
             {xtype: 'tbspacer', width: 20},

             {xtype: 'vernumber', name: 'number'},
             {xtype: 'tbspacer', width: 20},

             {xtype: 'datefield', name: 'transaction_date',
              submitFormat: 'Y-m-d', showToday: false}
         ]
        }
    ],

    setReadOnly: function(readOnly) {
        Bokf.lib.Utils.setOEReadOnly([this.down('datefield')], readOnly)
    }
})
