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

Ext.define('Bokf.lib.Waiter', {

    debug: false,
    done: false,

    constructor: function(callback, scope) {
        this.id = Bokf.lib.Waiter.id = (Bokf.lib.Waiter.id || 0) + 1
        this.started = new Date()
        this.counter = 0
        this.callbacks = []
        if (callback) {
            this.wait(callback, scope)
        }
    },

    wait: function(callback, scope) {
        this.callbacks.push({callback: callback, scope: scope})
    },

    _debug: function(type, ref) {
        if (this.debug) {
            var name = Ext.String.format(
                '{0}[{1}] ({2})', Ext.getClassName(this),
                this.id, new Date() - this.started)
            console.log(name, type, ref, '->', this.counter)
        }
    },

    incref: function(ref) {
        this.counter += 1
        this._debug('INC', ref)
    },

    decref: function(ref) {
        this.counter -= 1
        this._debug('DEC', ref)

        if (this.counter == 0) {
            Ext.each(this.callbacks, function(obj) {
                obj.callback.call(obj.scope)
            });
            this.callbacks = []
        }
        this.done = true
    }
})
