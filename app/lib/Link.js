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

Ext.define('Bokf.lib.Link', {
    extend: 'Ext.Component',
    alias: 'widget.link',

    tpl: '<a href="{href}" target="{target}">{text}</a>',

    data: {
        target: '_blank'
    },

    _setData: function(field, value) {
        this.data[field] = value
        this.update(this.data)
    },

    setHref: function(href) {
        this._setData('href', href)
    },

    setTarget: function(target) {
        this._setData('target', target)
    },

    setText: function(text) {
        this._setData('text', text)
    }
})
