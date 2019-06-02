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

Ext.define('Bokf.lib.CheckColumn', {
    extend: 'Ext.grid.column.CheckColumn',
    alias: 'widget.tipcheckcolumn',

    processEvent: function() {
        return Ext.grid.column.Column.prototype.processEvent.apply(this, arguments)
    },

    renderer: function(value, meta) {
        var cssPrefix = Ext.baseCSSPrefix,
        cls = [cssPrefix + 'grid-checkcolumn'];

        if (this.disabled) {
            meta.tdCls += ' ' + this.disabledCls;
                                     }
        if (value) {
            cls.push(cssPrefix + 'grid-checkcolumn-checked');
        }
        return '<img class="' + cls.join(' ') + '" src="' + Ext.BLANK_IMAGE_URL + '"' +
            (this.tooltip ? ' data-qtip="' + this.tooltip + '"' : '') + '/>';
    }
})
