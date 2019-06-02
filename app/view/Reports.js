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

Ext.define('Bokf.view.Reports', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.reports',

    requires: [
        'Bokf.lib.Utils',
        'Ext.ux.IFrame'
    ],

    layout: 'border',

    tbar: [
        {xtype: 'hidden', name: 'accounting'},

        {xtype: 'reportselector', name: 'reportselector'},
        {xtype: 'tbspacer', width: 20},

        {xtype: 'splitbutton', action: 'generate', disabled: true,
         menu: {
             items: [
                 {action: 'generate'},
                 {action: 'print'},
                 {action: 'save'},
                 {action: 'newwin'}
             ]
         }
        }
    ],

    items: [
        {name: 'filters', xtype: 'container', region: 'north',
         layout: 'card',
         defaults: {
             border: 0
         },
         items: [
             {xtype: 'reportfilter-period', itemId: 'period'},
             {xtype: 'reportfilter-accounts', itemId: 'accounts'},
             {xtype: 'reportfilter-verifications', itemId: 'verifications'}
         ],
         hidden: true // start hidden
        },
        {name: 'report', autoScroll: true, region: 'center', layout: 'fit'},
        {name: 'printframe', xtype: 'uxiframe', hidden: true, src: '/static/empty.html'}
    ],

    l10n: {
        actions: {
            generate: 'Generate report',
            print: 'Print report',
            save: 'Save report',
            newwin: 'Open report in new window'
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateComponents(
                this, this.l10n.actions, 'component[action={0}]')
          }
    }
})

Ext.define('Bokf.view.ReportFilter', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.reportfilter'
})


Ext.define('Bokf.view.ReportFilterPeriod', {
    extend: 'Bokf.view.ReportFilter',
    alias: 'widget.reportfilter-period',

    requires: [
        'Bokf.lib.DateRange',
        'Bokf.lib.Utils'
    ],

    l10n: {
        captions: {
            caption: 'Filter by date'
        }
    },

    layout: {
        type: 'hbox',
        padding: 4
    },

    items: [
        {xtype: 'displayfield', name: 'caption',
         fieldStyle: {'font-size': '90%', 'font-weight': 'bold'}},
        {xtype: 'tbspacer', width: 50},
        {xtype: 'daterange'}
    ],

    listeners: {
        afterrender: function() {
             Bokf.lib.Utils.translateComponents(this, this.l10n.captions, undefined,
                                                'setValue')
        }
    },

    setAccounting: function(accounting) {
        if (!accounting) {
            return
        }

        var daterange = this.down('daterange')
        daterange.setMinMax(accounting.get('start'), accounting.get('end'))
    },

    getFilterParams: function() {
        return {
            daterange: this.down('daterange').getValue()
        }
    }
})


Ext.define('Bokf.view.ReportFilterAccounts', {
    extend: 'Bokf.view.ReportFilter',
    alias: 'widget.reportfilter-accounts',

    requires: [
        'Bokf.lib.NumberRange',
        'Bokf.lib.Utils'
    ],

    l10n: {
        captions: {
            caption: 'Filter'
        },
        range: {
            captions: {
                label: 'Accounts:',
                example: 'E.g. 1000-1999, 3001, 3003'
            }
        }
    },

    layout: {
        type: 'hbox',
        padding: 4
    },

    items: [
        {xtype: 'displayfield', name: 'caption',
         fieldStyle: {'font-size': '90%', 'font-weight': 'bold'}},
        {xtype: 'tbspacer', width: 50},
        {xtype: 'numberrange', name: 'accounts', emptyText: '1000-9999',
         regex: /^((\d{4}|\d{4}-\d{4})[, ]*)*$/
        }
    ],

    listeners: {
        beforerender: function() {
            this.down('numberrange').setL10n(this.l10n.range)
        },
        afterrender: function() {
            Bokf.lib.Utils.translateComponents(this, this.l10n.captions, undefined,
                                               'setValue')
            Bokf.lib.Utils.translateButtons(this, this.l10n.buttons)
        }
    },

    setAccounting: function(accounting) {
    },

    getFilterParams: function() {
        var field = this.down('[name=accounts]')
        var params = {}
        if (field.isValid()) {
            var value = field.getValue()
            if (value) {
                params.accounts = value
            }
        }
        return params
    }
})


Ext.define('Bokf.view.ReportFilterVerifications', {
    extend: 'Bokf.view.ReportFilter',
    alias: 'widget.reportfilter-verifications',

    requires: [
        'Bokf.lib.ComboCheckBox',
        'Bokf.lib.DateRange',
        'Bokf.lib.NumberRange',
        'Bokf.lib.Utils'
    ],

    layout: {
        type: 'hbox',
        padding: 4
    },

    items: [
        {xtype: 'displayfield', name: 'caption',
         fieldStyle: {'font-size': '90%', 'font-weight': 'bold'}},
        {xtype: 'tbspacer', width: 50},
        {xtype: 'daterange', name: 'daterange'},
        {xtype: 'tbspacer', width: 50},
        {xtype: 'displayfield', name: 'seriesLabel'},
        {xtype: 'tbspacer', width: 10},
        {xtype: 'combocheckbox', name: 'series',
         valueField: 'id', displayField: 'display'},
        {xtype: 'tbspacer', width: 20},
        {xtype: 'numberrange', name: 'numbers'}
    ],

    l10n: {
        captions: {
            caption: 'Filter',
            seriesLabel: 'Series:'
        },
        emptySeriesText: 'all series',
        range: {
            emptyText: 'all verifications',
            captions: {
                label: 'Verification numbers:',
                example: 'e.g.: 1-10, 25, 40-50'
            }
        }
    },

    listeners: {
        beforerender: function() {
            this.down('combo[name=series]').emptyText = this.l10n.emptySeriesText
            this.down('numberrange[name=numbers]').setL10n(this.l10n.range)
        },
        afterrender: function() {
            Bokf.lib.Utils.translateComponents(this, this.l10n.captions, undefined,
                                               'setValue')
        }
    },

    setAccounting: function(accounting) {
        if (!accounting) {
            return
        }

        var daterange = this.down('daterange')
        daterange.setMinMax(accounting.get('start'), accounting.get('end'))

        var combo = this.down('combo[name=series]')
        combo.setValue(null)
        var store = Ext.create('Bokf.store.VerificationSeries')
        store.filter({property: 'accounting', value: accounting.get('id')})
        store.load()
        combo.bindStore(store)
    },

    getFilterParams: function() {
        var params = {
            daterange: this.down('daterange').getValue()
        }

        var combo = this.down('combo[name=series]')
        var series = combo.getValue()
        if (series && series.length) {
            params.series = series
        }
        var numbers = this.down('numberrange[name=numbers]')
        if (numbers.isValid()) {
            var value = numbers.getValue()
            if (value) {
                params.numbers = value
            }
        }
        return params
    }
})


Ext.define('Bokf.view.ReportSelectionCombo', {
    extend: 'Ext.form.field.ComboBox',
    requires: ['Bokf.store.Reports'],
    alias: 'widget.reportselector',
    store: 'reports',
    queryMode: 'local',
    valueField: 'url',
    displayField: 'name',
    autoSelect: true,
    forceSelection: true,
    editable: false,

    stateful: true,
    stateEvents: ['select'],
    stateId: 'report-select-combo',

    initComponent: function() {
        this.callParent()
        this.setValue(this.store.first().get('url'))
    }
})
