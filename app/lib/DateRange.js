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

Ext.define('Bokf.lib.DateRange', {
    extend: 'Ext.container.Container',
    alias: 'widget.daterange',

    requires: [
        'Bokf.lib.Utils'
    ],

    l10n: {
        captions: {
            startLabel: 'Start:',
            endLabel: 'End:'
        },
        buttons: {
            resetdate: 'Reset'
        }
    },

    layout: 'hbox',

    items: [
        {xtype: 'displayfield', name: 'startLabel'},
        {xtype: 'tbspacer', width: 10},
        {name: 'start', xtype: 'datefield', submitFormat: 'Y-m-d',
         showToday: false, grow: true, minWidth: 100},
        {xtype: 'tbspacer', width: 25},
        {xtype: 'displayfield', name: 'endLabel'},
        {xtype: 'tbspacer', width: 10},
        {name: 'end', xtype: 'datefield', submitFormat: 'Y-m-d',
         showToday: false, grow: true, minWidth: 100},
        {xtype: 'tbspacer', width: 25},
        {xtype: 'button', action: 'resetdate', disabled: true}
    ],

    showReset: true,

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateComponents(
                this, this.l10n.captions, undefined, 'setValue')
            Bokf.lib.Utils.translateButtons(this, this.l10n.buttons)
        }
    },

    initComponent: function() {
        this.callParent(arguments)
        this.setupListeners()
        this.reset()
        if (!this.showReset) {
            this.down('button[action=resetdate]').hide()
        }
    },

    setupListeners: function() {
        this.mon(this.getStart(), 'change', this.updateButtonState, this)
        this.mon(this.getEnd(), 'change', this.updateButtonState, this)
        this.mon(this.getResetButton(), 'click', this.reset, this)
    },

    updateButtonState: function() {
        if (this.getStart().getValue() || this.getEnd().getValue()) {
            this.getResetButton().enable()
        } else {
            this.getResetButton().disable()
        }
    },

    getStart: function() {
        return this.down('[name=start]')
    },

    getEnd: function() {
        return this.down('[name=end]')
    },

    getResetButton: function() {
        return this.down('button[action=resetdate]')
    },

    getValue: function() {
        // getSubmitValue() is private.
        return [this.getStart().getSubmitValue() || null,
                this.getEnd().getSubmitValue() || null]
    },

    setMinValue: function(min) {
        this.getStart().setMinValue(min)
        this.getEnd().setMinValue(min)
        this.getStart().setSuggestedPickerDate(min)
        this.getStart().emptyText = min
        this.getStart().applyEmptyText()
    },

    setMaxValue: function(max) {
        this.getStart().setMaxValue(max)
        this.getEnd().setMaxValue(max)
        this.getEnd().setSuggestedPickerDate(max)
        this.getEnd().emptyText = max
        this.getEnd().applyEmptyText()
    },

    setMinMax: function(min, max) {
        this.setMinValue(min)
        this.setMaxValue(max)
    },

    getDefaultValue: function(start, end) {
        return [null, null]
    },

    setValue: function(start, end) {
        this.getStart().setValue(start)
        this.getEnd().setValue(end)
    },

    reset: function() {
        this.setValue.apply(this, this.getDefaultValue())
        this.updateButtonState()
    }
})
