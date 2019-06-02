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

//translate me
Ext.syncRequire(['Bokf.lib.Utils'])

/* Modified Ext.form.field.Number */
Ext.define('Bokf.lib.CurrencyEditor', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.currencyeditor',

    cls: 'currency-editor',

    requires: ['Bokf.lib.Utils'],

    decimalSeparator: ".,:" + Ext.util.Format.decimalSeparator,
    baseChars: "01234567890., " + Ext.util.Format.thousandSeparator,
    minus: '-',

    currencyRenderer: Bokf.lib.Utils.currencyRendererFactory(2, false, ""),
    currencyParser: Bokf.lib.Utils.currencyParserFactory(2),

    negated: false,
    allowNegative: false,

    nanText : '{0} is not a valid number',
    negativeText : 'The value cannot be negative',

    initComponent: function() {
        var me = this,
            allowed;

        me.callParent(arguments);

        // XXX Why not? The code seems to handle it.
        if (me.allowNegative && me.negated) {
            throw "You can not set the 'allowNegative' and 'negated' "+
                "flags at the same time."
        }

        // Build regexes for masking and stripping based on the configured options
        if (me.disableKeyFilter !== true) {
            allowed = me.baseChars + me.decimalSeparator + ''
            if (this.allowNegative) {
                allowed += this.minus
            }
            allowed = Ext.String.escapeRegex(allowed)
            me.maskRe = new RegExp('[' + allowed + ']')
        }
    },

    valueToRaw: function(value) {
        if (this.negated) {
            value = -value
        }
        if (!this.allowNegative) {
            if (value < 0) {
                return ''
            }
        }
        return this.currencyRenderer(value)
    },

    rawToValue: function(raw) {
        var value = this.currencyParser(raw)
        if (value == null) {
            var startValue = this.ownerCt.startValue
            if (!this.allowNegative) {
                if ((!this.negated && startValue < 0) || (this.negated && startValue > 0)) {
                    return startValue
                } else {
                    return value
                }
            }
            return startValue
        }
        if (this.negated) {
            return -value
        }
        return value
    },

    /**
     * Runs all of Number's validations and returns an array of any errors. Note that this first runs Text's
     * validations, so the returned array is an amalgamation of all field errors. The additional validations run test
     * that the value is a number, and that it is within the configured min and max values.
     * @param {Object} [value] The value to get errors for (defaults to the current field value)
     * @return {String[]} All validation errors for this field
     */
    getErrors: function(value) {
        var me = this,
            errors = me.callParent(arguments),
            format = Ext.String.format,
            num;

        value = Ext.isDefined(value) ? value : this.processRawValue(this.getRawValue());

        if (value.length < 1) { // if it's blank and textfield didn't flag it then it's valid
             return errors;
        }

        num = me.rawToValue(value);

        if (!isFinite(num)) {
            errors.push(format(this.nanText, value))
        }

        if (!this.allowNegative) {
            if ((!this.negated && num < 0) || (this.negated && num > 0)) {
                errors.push(this.negativeText);
            }
        }

        return errors
    },

    getSubmitValue: function() {
        var me = this,
            value = me.callParent();
        return me.rawToValue(value).toString();
    },

    beforeBlur : function() {
        var me = this,
            v = me.rawToValue(me.getRawValue());

        if (!Ext.isEmpty(v)) {
            me.setValue(v);
        }
    }
})
