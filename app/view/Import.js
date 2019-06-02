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

Ext.define('Bokf.view.Import', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.import',

    requires: [
        'Ext.ux.IFrame'
    ],

    layout: 'border',

    items: [
        {
            xtype : 'component',
            name: 'iframe',
            autoEl : {
                tag : 'iframe'
                // src : '/izettle/transactions/536bc43e9e4ed02f2e000001'
            }
        }
    ],

    setAccounting: function(accounting) {
        var iframe = this.down('component')
        var org = accounting.get('org')
        var src = '/izettle/' + org + '/' + accounting.get('id')
        iframe.el.dom.src = src
    }
})
