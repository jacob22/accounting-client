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

Ext.define('Bokf.lib.LoadMaskController', {
    extend: 'Bokf.lib.Waiter',

    constructor: function(component, loadMask, start, ref) {
        this.callParent()
        this.component = component
        this.setup(loadMask)

        if (start) {
            this.start()
        }

        if (typeof(ref) != 'undefined') {
            this.incref(ref)
        }
    },

    setup: function(loadMask) {
        this.loadMask = loadMask
        this.wait(this.stop, this)
    },

    start: function() {
        this.component.setLoading(this.loadMask)
    },

    restart: function(loadMask, ref) {
        if (this.done) {
            this.done = false
            this.setup(loadMask)
            this.start()
        }

        if (typeof(ref) != 'undefined') {
            this.incref(ref)
        }
    },

    stop: function() {
        this.component.setLoading(false)
    }
})
