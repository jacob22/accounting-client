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

Ext.define('Bokf.controller.Reports', {
    extend: 'Bokf.controller.ReportBase',

    views: ['Reports'],

    refs: [
        {ref: 'reports', selector: 'reports'},
        {ref: 'reportSelector', selector: 'reports reportselector'},
        {ref: 'accountingField', selector: 'reports hidden[name=accounting]'},
        {ref: 'filterArea', selector: 'reports container[name=filters]'},
        {ref: 'reportDisplayArea', selector: 'reports [name=report]'},
        {ref: 'printFrame', selector: 'reports [name=printframe]'}
    ],

    l10n: {
        loadMask: 'Generating report...'
    },

    rootWidgetSelector: 'reports',

    init: function(app) {
        this.control({
            'reports reportselector': {
                select: this.reportSelected
            }
        })

        this.listen({
            controller: {
                '*': {
                    accountingselected: this._accountingSelected
                }
            }
        })
        this.callParent(arguments)
    },

    _accountingSelected: function(accounting) {
        Bokf.lib.Utils.callAtShow(this.getReports(), this.accountingSelected,
                                  this, accounting)
    },

    accountingSelected: function(accounting) {
        var id = accounting ? accounting.get('id') : null
        this.getAccountingField().setValue(id)
        Ext.each(this.getFilterArea().query('reportfilter'), function(filter) {
            filter.setAccounting(accounting)
        }, this);
        this.clear()
        this._displayFilter()
        this.updateButtonState()
    },

    _displayFilter: function() {
        var accounting = this.getAccountingField().getValue()
        var selector = this.getReportSelector()
        var report = selector.findRecordByValue(selector.getValue())
        var filter = report.get('filter')
        var filterArea = this.getFilterArea()
        if (!accounting || !filter) {
            filterArea.hide()
            return
        }

        filterArea.show()
        filterArea.getLayout().setActiveItem(filter)
    },

    updateButtonState: function() {
        var disabled = !this.getAccountingField().getValue()
        var buttons = this.getReports().query('toolbar button')
        Ext.each(buttons, function(button) {
            button.setDisabled(disabled)
        })
    },

    reportSelected: function(combo, records) {
        this._displayFilter()
        this.callParent(arguments)
    },

    getAccounting: function() {
        return this.getAccountingField().getValue()
    },

    _getFilterParams: function() {
        var filterArea = this.getFilterArea()
        if (filterArea.isHidden()) {
            return {}
        }
        var filter = filterArea.getLayout().getActiveItem()
        var params = filter.getFilterParams()
        return {filters: Ext.JSON.encode(params)}
    },

    _getUrl: function() {
        var report = this.getReportSelector().getValue()
        var accounting = this.getAccountingField().getValue()
        return Ext.String.format('{0}/{1}', report, accounting)
    }
})
