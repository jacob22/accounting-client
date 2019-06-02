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

Ext.syncRequire(['Bokf.lib.Utils'])

Tests = {
    test_currencyRenderer: function() {
        var crfn = Bokf.lib.Utils.currencyRendererFactory(4)
        var res

        // Make sure they are default
        Ext.util.Format.decimalSeparator = "."
        Ext.util.Format.thousandSeparator = ","

        res = crfn('42')
        ais(res, '0.0042')

        res = crfn(42)
        ais(res, '0.0042')

        res = crfn(1234567)
        ais(res, '123.4567')

        res = crfn(23456789)
        ais(res, '2,345.6789')

        res = crfn(undefined)
        ais(res, undefined)

        res = crfn("")
        ais(res, "")

        res = crfn(0)
        ais(res, "0.0000")

        res = crfn(-12345)
        ais(res, "-1.2345")

        res = crfn(-1234)
        ais(res, "-0.1234")

        res = crfn(" ")
        ais(res, " ")

        res = crfn(" 12345 ")
        ais(res, "1.2345")

        var crfn = Bokf.lib.Utils.currencyRendererFactory(4, false, "-,")
        res = crfn(1234567890)
        ais(res, "123456.7890")

        res = crfn("")
        ais(res, "-,")

        var crfn = Bokf.lib.Utils.currencyRendererFactory(4, false, 0)
        res = crfn("")
        ais(res, "0.0000")

        var crfn = Bokf.lib.Utils.currencyRendererFactory(4, false, "")
        res = crfn("")
        ais(res, "")

        res = crfn(0)
        ais(res, "")
    },

    test_currencyParser: function() {
        var cpfn = Bokf.lib.Utils.currencyParserFactory(4)
        var res

        // Make sure they are default
        Ext.util.Format.decimalSeparator = "."
        Ext.util.Format.thousandSeparator = ","

        res = cpfn('1234')
        ais(res, 12340000)

        res = cpfn('12.34')
        ais(res, 123400)

        res = cpfn('12.')
        ais(res, 120000)

        res = cpfn('1,212.')
        ais(res, 12120000)

        res = cpfn('1.212.00')
        ais(res, 12120000)

        res = cpfn('.45')
        ais(res, 4500)

        res = cpfn('')
        ais(res, null)

        res = cpfn(undefined)
        ais(res, undefined)

        res = cpfn("-12")
        ais(res, -120000)

        res = cpfn("-12.34")
        ais(res, -123400)

        res = cpfn("-1.234.56")
        ais(res, -12345600)

        res = cpfn("-.45")
        ais(res, -4500)
    }
}
