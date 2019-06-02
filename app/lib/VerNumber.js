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

Ext.define('Bokf.lib.VerNumber', {
    extend: 'Ext.form.field.Number',
    alias: 'widget.vernumber',
    minValue: 1,

    trigger1Cls: 'vernumber-trigger-1',
    trigger2Cls: 'vernumber-trigger-2',
    trigger3Cls: 'vernumber-trigger-3',
    trigger4Cls: 'vernumber-trigger-4',

    _myTriggerWidth: null,

    _getHTML: function(field) {
        var me = this
        var style = 'background-image: none; border-bottom: 0;'
        return '<table id="' + me.id + '-triggerWrap" class="' + Ext.baseCSSPrefix + 'form-trigger-wrap" cellpadding="0" cellspacing="0">' +
          '<tbody><tr>' +
            '<td>' +
              '<div class="vernumber-trigger-3 ' + Ext.baseCSSPrefix + 'trigger-index-2 ' + Ext.baseCSSPrefix + 'form-trigger" role="button" style="' + style + '">' +
                '<img class="vernumber-icon" src="images/resultset_first.png">' +
              '</div>' +
            '</td>' +
            '<td>' +
              '<div class="vernumber-trigger-2 ' + Ext.baseCSSPrefix + 'trigger-index-1 ' + Ext.baseCSSPrefix + 'form-trigger" role="button" style="' + style + '">' +
                '<img class="vernumber-icon" src="images/resultset_previous.png">' +
              '</div>' +
            '</td>' +
            '<td id="' + me.id + '-inputCell" class="' + Ext.baseCSSPrefix + 'form-trigger-input-cell">' + field + '</td>' +
            '<td>' +
              '<div class="vernumber-trigger-1 ' + Ext.baseCSSPrefix + 'trigger-index-0 ' + Ext.baseCSSPrefix + 'form-trigger" role="button" style="' + style + '">' +
                '<img class="vernumber-icon" src="images/resultset_next.png">' +
              '</div>' +
            '</td>' +
            '<td>' +
              '<div class="vernumber-trigger-4 ' + Ext.baseCSSPrefix + 'trigger-index-3 ' + Ext.baseCSSPrefix + 'form-trigger" role="button" style="' + style + '">' +
                '<img class="vernumber-icon" src="images/resultset_last.png">' +
              '</div>' +
            '</td>' +
            '<td>' +
              '<div class="vernumber-trigger-5 ' + Ext.baseCSSPrefix + 'trigger-index-4 ' + Ext.baseCSSPrefix + 'form-trigger" role="button" style="' + style + ' margin-left: 3px;">' +
                '<img class="vernumber-icon" src="images/table_add.png">' +
              '</div>' +
            '</td>' +
            '</tr></tbody></table>'
    },

    getSubTplMarkup: function() {
        var field = Ext.form.field.Base.prototype.getSubTplMarkup.apply(this, arguments)
        return this._getHTML(field)
    },

    beforeRender: function() {
        if (!this._myTriggerWidth) {
            var html = this._getHTML('')
            var tempEl = Ext.getBody().createChild({style: 'position: absolute;'})
            tempEl.dom.innerHTML = html
            Bokf.lib.VerNumber.prototype._myTriggerWidth = tempEl.getWidth()
            tempEl.remove()
        }
        this.triggerWidth = this._myTriggerWidth
        this.callParent()
    },

    onTrigger3Click: function() {
        this.setValue(this.minValue)
    },

    onTrigger4Click: function() {
        this.fireEvent('trigger4click')
    },

    onTrigger5Click: function() {
        this.fireEvent('trigger5click')
    }
})
