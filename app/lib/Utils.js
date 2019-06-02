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
Ext.define('Bokf.lib.Utils', {
    singleton: true,

    requires: [
        'Ext.util.Cookies',
        'Ext.util.Format',
        'Bokf.lib.Waiter'
    ],

    isBetaTester: function() {
        var user = Ext.util.Cookies.get('userid')
        var beta = [
            '5195f09926ccb320b5000004',  // micke
            '5899e8a1a979ef34c3afa818',  // jacob oauth
            '53466f8f19971a5b19000030',  // jacob windows live
            '51ee873226ccb34cff000004',  // jacob gmail
            '52e9316619971a0aff00002b',  // jacob facebook
            '5294c76626ccb36224000004',  // sebastaian
            '5224a74767e54859fc00001a',  // iko
            '585284a819971a09eb80d935' // ulrika
        ].indexOf(user) != -1
        return beta
    },

    currencyRendererFactory: function(decimalPlaces, thousandSeparator, emptyText) {
        if (typeof(decimalPlaces) == "undefined") {
            return undefined
        }

        if (typeof(thousandSeparator) == "undefined") {
            thousandSeparator = true
        }

        return function currencyRenderer(value) {
            var res, negative = '';

            if (!Ext.isNumeric(value) || parseInt(value) == 0) {
                value = emptyText === undefined ? value : emptyText
                if (!Ext.isNumeric(value)) {
                    return emptyText || value
                }
            }

            value = Ext.String.trim(value.toString())
            if (value[0] == '-') {
                negative = '-';
                value = value.slice(1)
            }
            while (value.length < (decimalPlaces + 1)) {
                value = "0" + value
            }

            res = Ext.util.Format.decimalSeparator + value.slice(-decimalPlaces)

            value = value.slice(0,-decimalPlaces)

            if (!thousandSeparator) {
                res = value + res
            } else {
                while (value) {
                    res = value.slice(-3) + res;
                    value = value.slice(0,-3)
                    if (value) {
                        res = Ext.util.Format.thousandSeparator + res
                    }
                }
            }

            return negative + res
        }
    },

    currencyParserFactory: function(decimalPlaces) {
        if (typeof(decimalPlaces) == "undefined") {
            return undefined
        }
        var decimal = Ext.util.Format.decimalSeparator
        var thousand = Ext.util.Format.thousandSeparator
        var decimals = decimal + ".,:" // + Ext.util.Format.currencySign maybe?
        var thousands = thousand + ".,' "

        return function currencyParser(value) {
            var res = 0, multiplier = 0, sign = 1;

            if (typeof(value) != "string") {
                return value
            }

            // Split string into numerics and non-numerics
            var groups = value.match(/-|[0-9]+|[^-0-9]+/g)

            if (!groups) {
                return null;
            }
            if (groups[0] == '-') {
                groups.shift()
                sign = -1
            }

            if (groups.length == 0) {
                return null
            }

            groups.reverse()

            if (groups.length == 1) {
                return sign * parseInt(groups[0]) * Math.pow(10, decimalPlaces)
            }
            if (isNaN(groups[0])) {
                var endsep = groups.shift()
                if (decimals.indexOf(endsep[0]) != -1) {
                    multiplier = decimalPlaces
                }
            }
            if (groups.length == 0) {
                return null;
            }

            while (groups.length) {
                var num = groups.shift()
                var sep = groups.shift()
                if (sep && sep.length != 1) {
                    // Separator is not single character
                    return;
                }

                if (!multiplier && (decimals.indexOf(sep) != -1)) {
                    // Decimal part
                    num = num.slice(0, decimalPlaces)
                    multiplier = decimalPlaces - num.length
                    res = parseInt(num) * Math.pow(10, multiplier)
                    multiplier = decimalPlaces
                    continue
                }

                res += parseInt(num) * Math.pow(10, multiplier)
                multiplier += num.length
            }

            return sign * res
        }
    },

    translateComponents: function(root, translationMap, selectorFormat, fn,
                                  templateValues) {
        selectorFormat = selectorFormat || '[name={0}]'
        fn = fn || 'setText'
        Ext.Object.each(translationMap, function(key, value) {
            if (templateValues) {
                value = new Ext.Template(value).apply(templateValues)
            }
            var selector = Ext.String.format(selectorFormat, key)
            Ext.each(root.query(selector), function(component) {
                if (typeof(fn) == 'string') {
                    var func = component[fn]
                    if (func) {
                        func.call(component, value)
                    }
                } else {
                    fn(component, value)
                }
            });
        });
    },

    translateButtons: function(root, translationMap) {
        var selectorFormat = 'button[action={0}]'
        return Bokf.lib.Utils.translateComponents(root, translationMap,
                                                  selectorFormat)
    },

    translateFieldLabels: function(root, translationMap) {
        return Bokf.lib.Utils.translateComponents(root, translationMap,
                                                  null, 'setFieldLabel')
    },

    atRender: function(component, callback, scope) {
        if (component.rendered) {
            callback.call(scope)
        } else {
            component.on('afterrender', callback, scope, {single: true})
        }
    },

    waitForAssociations: function(record, associations, callback, scope) {
        var waiter = new Bokf.lib.Waiter(function() {
            callback.apply(scope, result)
        }, scope)
        var result = new Array(associations.length)
        waiter.incref('global')

        Ext.each(associations, function(association, index) {
            waiter.incref(index)
            association.call(record, function(associated) {
                result[index] = associated
                waiter.decref(index)
            })
        });
        waiter.decref('global')
    },

    waitForStores: function(stores, callback, scope) {
        var waiter = new Bokf.lib.Waiter(callback, scope)

        Ext.each(stores, function(store) {
            waiter.incref(store)
        });

        Ext.each(stores, function(store) {
            if (store.isLoading()) {
                store.on('load', function() {
                    waiter.decref(store)
                }, null, {single: true})
            } else {
                waiter.decref(store)
            }
        })
    },

    callAtShow: function(components, callback, scope /* args */) {
        var args = Array.prototype.slice.call(arguments, 3)

        if (!Array.isArray(components)) {
            components = [components]
        }

        var key = components.map(function(component) {
            return component.id
        }).join('-')

        if (!scope.__call_at_show) {
            scope.__call_at_show = {}
        }

        if (scope.__call_at_show[key]) {
            Ext.each(scope.__call_at_show[key], function(listener) {
                listener.destroy()
            });
        }

        scope.__call_at_show[key] = []

        var isShown = function() {
            var shown = true
            Ext.each(components, function(component) {
                shown = component.rendered && component.isVisible(true)
                return shown
            });
            return shown
        }

        var doCall = function() {
            Ext.each(scope.__call_at_show[key], function(listener) {
                listener.destroy()
            });
            delete scope.__call_at_show[key]
            callback.apply(scope, args)
        }

        var maybeCall = function() {
            if (isShown()) {
                Ext.each(scope.__call_at_show[key], function(listener) {
                    listener.destroy()
                })
                delete scope.__call_at_show[key]
                callback.apply(scope, args)
            }
        }

        if (isShown()) {
            doCall()
        } else {
            Ext.each(components, function(component) {
                scope.__call_at_show[key].push(
                    component.on({
                        scope: scope,
                        destroyable: true,
                        show: maybeCall,
                        activate: maybeCall
                    })
                )
            });
            return true
        }
    },

    logEvent: function(event, message) {
        var fmt = '{0}{charCode: {1}, keyCode: {2}}'
        if (message == undefined) {
            message = ''
        }
        var msg = Ext.String.format(fmt, message, event.charCode, event.keyCode)
        console.log(msg)
    },

    sortAlpha: function(sortable, key) {
        key = key || function(obj) { return obj }
        var sortable = Ext.Array.sort(sortable, function(a, b) {
            return Bokf.lib.Utils.localeCompare(key(a), key(b))
        })
        return sortable
    },

    localeCompare: function(a, b, locales, options) {
        locales = locales || 'sv' // assume sv for now
        options = options || {sensitivity: 'accent'}
        return a.localeCompare(b, locales, options)
    },

    setOEReadOnly: function(components, readonly) {
        Ext.each(components, function (comp) {
            if (comp.setReadOnly) {
                comp.setReadOnly(readonly)
            }
            if (readonly) {
                comp.addCls('oe-readonly')
            } else {
                comp.removeCls('oe-readonly')
            }
        });
    },

    parseOptionFields: function(optionFields) {
        var optionFieldData = []
        for (var i = 0; i < optionFields.length; i++) {
            var value = optionFields[i]
            // Python's value.split('\u001f', 4) in JavaScript:
            var parts = value.match(
                    /([^\u001f]*)\u001f([^\u001f]*)\u001f([^\u001f]*)\u001f([^\u001f]*)\u001f(.*)/).
                slice(1)

            optionFieldData.push({
                'label': parts[0],
                'optdescr': parts[1],
                'type': parts[2],
                'mandatory': parts[3],
                'typedata': parts[4]
            })
        }
        return optionFieldData
    },

    getLogger: function(prefix) {
        var counter = 0
        var start = new Date()
        var previous = start
        var max = 0
        var max_msg = null
        return {
            log: function(msg) {
                var now = new Date()
                var total = now - start
                var delta = now - previous
                previous = now
                console.log(counter++, total, delta, prefix, msg)
                if (delta > max) {
                    max = delta
                    max_msg = msg
                }
            },
            max: function() {
                console.log('MAX', prefix, max, max_msg)
            }
        }
    }
})
