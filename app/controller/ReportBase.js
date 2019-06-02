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

Ext.define('Bokf.controller.ReportBase', {
    extend: 'Ext.app.Controller',
    requires: ['Ext.ux.IFrame'],

    refs: [
        // subclasses need to define:
        // reports
        // reportDisplayArea
        // printFrame
    ],

    l10n: {
        loadMask: 'Generating report...'
    },

    rootWidgetSelector: null,

    init: function(app) {
        var rootWidgetSelector = this.rootWidgetSelector
        var mkSelector = function(selector) {
            return rootWidgetSelector + ' ' + selector
        }

        this.control(mkSelector('splitbutton[action=generate]'),
                     {click: this.generateReport})
        this.control(mkSelector('splitbutton[action=generate] menu'),
                     {click: this.menuItemSelected})
    },

    clear: function() {
        this.getReportDisplayArea().update('')
    },

    reportSelected: function(combo, records) {
        this.clear()
    },

    menuItemSelected: function(menu, item) {
        switch (item.action) {
        case 'generate':
            this.generateReport()
            break;
        case 'print':
            this.printReport()
            break;
        case 'save':
            this.saveReport()
            break;
        case 'newwin':
            this.newWindow()
            break;
        }
    },

    _getUrl: function() {
        throw 'not implemented'
    },

    _getFilterParams: function() {
        return {}
    },

    _getReport: function(options) {
        options.scope = this
        options.url = this._getUrl()
        options.params = this._getFilterParams()
        Ext.Ajax.request(options)
    },

    generateReport: function() {
        var area = this.getReportDisplayArea()
        area.setLoading(this.l10n.loadMask)
        this._getReport({
            callback: function(options, success, response) {
                var responseText = response.responseText
                if (console && console.log) {
                    console.log('showing report: ' + responseText.length + ' ' +
                                responseText.substr(0, 100))
                }
                area.update(responseText)
                area.setLoading(false)
            }
        })
    },

    printReport: function() {
        var area = this.getReportDisplayArea()
        area.setLoading(this.l10n.loadMask)
        this._getReport({
            success: function(response, options) {
                var frame = this.getPrintFrame().getFrame()
                frame.contentDocument.documentElement.innerHTML = response.responseText

                if (frame.contentDocument.queryCommandSupported('print')) {
                    // http://bytes.com/topic/misc/answers/629926-ie7-printing-iframe-solution
                    frame.contentDocument.execCommand('print', false, null)
                } else {
                    frame.contentWindow.print()
                }
            },
            callback: function() {
                area.setLoading(false)
            }
        })
    },

    newWindow: function() {
        var params = this._getFilterParams()
        qs = Ext.Object.toQueryString(params)
        var url = Ext.String.format('{0}?{1}', this._getUrl(), qs)
        window.open(url)
    },

    saveReport: function() {
        var frame = this.getPrintFrame().getFrame()
        var params = {mode: 'download'}
        Ext.Object.merge(params, this._getFilterParams())
        var qs = Ext.Object.toQueryString(params)
        var url = Ext.String.format('{0}?{1}', this._getUrl(), qs)
        frame.src = url
    }
})
