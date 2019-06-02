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

Ext.syncRequire('Bokf.lib.BLMTypes')
Ext.syncRequire('Bokf.lib.TOIWriter')

Tests = {

test_getRecordData: function() {
    Ext.define('Tests.model.Foo', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'foo'},
            {name: 'bar', type: 'blmlist', defaultValue: []}
        ],
        proxy: 'memory'
    })

    var writer = Ext.create('Bokf.lib.TOIWriter')

    var record = Ext.create('Tests.model.Foo', {
        id: 1,
        foo: 'foo',
        bar: [1, 2, 3]
    })
    var data = writer.getRecordData(record)
    aisDeeply(data, {id: [1], foo: ['foo'], bar: [1, 2, 3]})

    var record = Ext.create('Tests.model.Foo', {
        id: 1,
        foo: null,
        bar: []
    })
    var data = writer.getRecordData(record)
    aisDeeply(data, {id: [1], foo: [], bar: []})
}

}
