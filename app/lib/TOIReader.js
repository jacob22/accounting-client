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

Ext.define('Bokf.lib.TOIReader', {
    extend: 'Ext.data.reader.Json',
    alias: 'reader.toi',

    root: 'tois',
    messageProperty: 'message',

    readRecords: function(data) {
        var convertFields = {}
        var success = data.success
        var data = this.getRoot(data)
        if (data === undefined) {
            data = []  // xxx this updates arguments
        }

        // retain the success property, as extjs needs it to decide
        // whether the request was successful
        data.success = success

        Ext.each(this.model.getFields(), function(field) {
            convertFields[field.name] = (field.type.type != 'blmlist' &&
                                         field.type.type != 'blmmap')
        });

        Ext.each(data, function(toi) {
            for (var attrname in toi) {
                if (!(attrname in convertFields)) {
                    var model = Ext.ClassManager.getByAlias('blm.' + toi._toc)
                    if (model) {
                        Ext.each(model.getFields(), function(field) {
                            if (field.name == attrname) {
                                convertFields[field.name] = (
                                    field.type.type != 'blmlist' &&
                                    field.type.type != 'blmmap')
                            }
                        })
                    }
                }
                if (convertFields[attrname]) {
                    if (toi[attrname].length) {
                        toi[attrname] = toi[attrname][0]
                    } else {
                        toi[attrname] = null
                    }
                }
            }
        })

        return this.callParent(arguments)
    },

    getConvertRecordData: function(model) {
        if (this._converterCache === undefined) {
            this._converterCache = {}
            this._lastFieldGenerationCache = {}
        }
        var name = Ext.ClassManager.getName(model)
        if (this._lastFieldGenerationCache[name] !== model.prototype.fields.generation) {
            var origConvertRecordData = this.convertRecordData
            var origLastFieldGeneration = this.lastFieldGeneration
            if (model !== this.model) {
                var origModel = this.model
                this.model = model
                this.buildExtractors(true)
                this.model = origModel
            }
            this._converterCache[name] = this.convertRecordData
            this._lastFieldGenerationCache[name] = this.lastFieldGeneration
            this.convertRecordData = origConvertRecordData
            this.lastFieldGeneration = origLastFieldGeneration
        }
        return this._converterCache[name]
    },

    extractData: function(root) {
        var me = this
        var i
        var records = new Array(root.length)
        for (i = 0; i < root.length; i++) {
            var node = root[i]
            var Model
            var convertedValues
            if (node._toc) {
                Model = Ext.ClassManager.getByAlias('blm.' + node._toc)
            } else {
                Model = me.model
            }

            var record = records[i] = new Model(undefined, me.getId(node), node,
                                                convertedValues = {});

            record.phantom = false;

            me.getConvertRecordData(Model)(convertedValues, node, record);

            if (me.implicitIncludes && record.associations.length) {
                me.readAssociated(record, node);
            }
        }
        return records
    }
})
