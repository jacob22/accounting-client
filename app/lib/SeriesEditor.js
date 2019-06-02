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

Ext.define('Bokf.lib.SeriesEditor', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.series',
    requires: ['Bokf.store.VerificationSeries'],

    valueField: 'id',
    displayField: 'display',

    editable: false,
    queryMode: 'local',
    forceSelection: true,
    allowBlank: false,
    autoSelect: true,

    resetToDefault: function() {
        // this.ignoreSelection is a counter that is incremented while
        // actions that can be broken by user selection are
        // performed. It is decremented again when those actions are
        // ignored.
        // Loading the bound store is one of those actions.
        // This means that if a store is replaced while it is loading,
        // the ignoreSelection counter is perpetually left positive.
        // A workaround seems to be to reset it to 0 whenever a new
        // store is bound.
        // http://docs-origin.sencha.com/extjs/4.2.0/#!/api/Ext.form.field.ComboBox-method-resetToDefault
        this.ignoreSelection = 0
    },

    bindStore: function(store) {
        this.callParent([store])
        var store = this.getStore()
        if (store && this.autoSelect) {
            if (store.count()) {
                if (this.rendered) {
                    this.select(store.first())
                } else {
                    this.on('beforerender', function() {
                        this.select(store.first())
                    }, this, {single: true})
                }
            } else {
                store.on('refresh', function() {
                    if (store.count()) {
                        this.select(store.first())
                    }
                }, this, {single: true})
            }
        }
    }
})
