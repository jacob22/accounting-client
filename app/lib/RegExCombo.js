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

Ext.define('Bokf.lib.RegExCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.regexcombo',

    queryMode: 'local',
    minChars: 1,
    forceSelection: true,

    initComponent: function() {
        this.callParent(arguments)
        this.on('beforequery', this._modifyQuery, this)
    },

    _regexEscape: function(s) {
        // recipe: http://stackoverflow.com/a/3561711
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    },

    _modifyQuery: function(qe) {
        if (qe.query.length < this.minChars) {
            return
        }

        var flags = ''
        if (qe.query == qe.query.toLowerCase()) {
            // case insensitive search if query is only lower case
            flags = 'i'
        }

        var pattern = this._regexEscape(qe.query)
        if (!/^\s/.test(pattern)) {
            // Only match from beginning of word (unless query starts
            // with space).  Since \b isn't unicode aware, we simulate
            // it by our own, short, hard coded list of "word
            // boundary" characters or beginning of string.
            pattern = '(^|[-\\s\\(])' + pattern
        }

        // Overwrite query with our own constructed regexp, as
        // extjs offers no interface to define regexp style
        // patterns in conjunction with case insensitive searches.
        // This also means that we need to set the forceAll flag,
        // in order to override the length check in
        // Ext.form.field.ComboBox.doQuery().
        qe.query = new RegExp(pattern, flags)
        qe.forceAll = true
    }
})
