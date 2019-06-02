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

Ext.syncRequire(['Bokf.lib.CurrencyEditor'])

Tests = {
    test_getErrors: function() {
        var getErrors = Bokf.lib.CurrencyEditor.prototype.getErrors
        var form = {
            callParent: function() {
                return []
            },
            currencyRenderer: Bokf.lib.CurrencyEditor.prototype.currencyRenderer,
            currencyParser: Bokf.lib.CurrencyEditor.prototype.currencyParser,
            rawToValue: Bokf.lib.CurrencyEditor.prototype.rawToValue,
            nanText: "Not a number",
            negativeText: "Negative",
            negated: false
        }

        var res

        res = getErrors.call(form, '123')
        aisDeeply(res, [])

        res = getErrors.call(form, '-123')
        aisDeeply(res, ["Negative"])

        res = getErrors.call(form, 'abc')
        aisDeeply(res, ["Not a number"])
    },

    test_rawToValue: function() {
        var rawToValue = Bokf.lib.CurrencyEditor.prototype.rawToValue
        var form = {
            callParent: function() {
                return []
            },
            currencyRenderer: Bokf.lib.CurrencyEditor.prototype.currencyRenderer,
            currencyParser: Bokf.lib.CurrencyEditor.prototype.currencyParser,
            rawToValue: Bokf.lib.CurrencyEditor.prototype.rawToValue,
            nanText: "Not a number",
            negativeText: "Negative",
            negated: false,
            ownerCt: {}
        }

        var res

        res = rawToValue.call(form, '123')
        ais(res, 12300)

        form.negated = true
        res = rawToValue.call(form, '123')
        ais(res, -12300)

        form.negated = true
        form.ownerCt.startValue = -12300
        res = rawToValue.call(form, '')
        ais(res, null)

        form.negated = true
        form.ownerCt.startValue = 12300
        res = rawToValue.call(form, '')
        ais(res, 12300)
    }
}
