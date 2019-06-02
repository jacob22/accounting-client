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

Ext.define('Bokf.controller.members.SalesReports', {
    extend: 'Bokf.controller.ReportBase',
    requires: ['Bokf.store.members.Products'],

    refs: [
        {ref: 'reports', selector: 'salesreports'},
        {ref: 'productSelector', selector: 'salesreports combobox[name=productselector]'},
        {ref: 'reportDisplayArea', selector: 'salesreports [name=report]'},
        {ref: 'printFrame', selector: 'salesreports [name=printframe]'}
    ],

    l10n: {
        loadMask: 'Generating report...'
    },

    rootWidgetSelector: 'salesreports',

    init: function controller_init(app) {
        this.control({
            'salesreports combobox[name=productselector]': {
                select: this.productSelected
            }
        })

        this.listen({
            controller: {
                '*': {
                    orgselected: this._orgSelected
                }
            }
        })
        this.callParent(arguments)
    },

    _orgSelected: function(org, implicit, loader) {
        Bokf.lib.Utils.callAtShow(this.getReports(), this.orgSelected,
                                  this, org, implicit, loader)
    },

    orgSelected: function(org, implicit, loader) {
        loader.incref('salesreports')
        this.clear()

        var store = Ext.create('Bokf.store.members.Products', {
            filters: [
                {property: 'org', value: org.get('id')},
                {property: 'archived', value: false}
            ],
            sorters: 'name'
        })
        this.getProductSelector().bindStore(store)
        this.getProductSelector().setValue(null)
        this.updateButtonState()
        store.load({
            scope: this,
            callback: function() {
                loader.decref('salesreports')
            }
        })
    },

    updateButtonState: function() {
        var disabled = !this.getProductSelector().getValue()
        var buttons = this.getReports().query('toolbar button')
        Ext.each(buttons, function(button) {
            button.setDisabled(disabled)
        })
    },

    productSelected: function(combo, product) {
        this.updateButtonState()
    },

    _getUrl: function() {
        var product = this.getProductSelector().getValue()
        return 'salesreport/' + product
    }
})
