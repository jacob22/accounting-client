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

Ext.define('Bokf.lib.Summary', {
    extend: 'Ext.grid.feature.Summary',

    alias: 'feature.oesummary',

    renderTFoot: function(values, out) {
        var view = values.view,
            me = view.findFeature('oesummary');

        if (me.showSummaryRow) {
            out.push('<tfoot>');
            me.outputSummaryRecord(me.createSummaryRecord(view), values, out);
            out.push('</tfoot>');
        }
    },

    createSummaryRecord: function(view) {
        var columns = view.headerCt.getVisibleGridColumns(),
            info = {
                records: view.store.getRange()
            },
            colCount = columns.length, i, column,
            summaryRecord = this.summaryRecord || (this.summaryRecord = new view.store.model(null, view.id + '-summary-record'));

        // Set the summary field values
        summaryRecord.beginEdit();
        for (i = 0; i < colCount; i++) {
            column = columns[i];

            // In summary records, if there's no dataIndex, then the value in regular rows must come from a renderer.
            // We set the data value in using the column ID.
            if (!column.dataIndex) {
                column.dataIndex = column.id;
            }

            //summaryRecord.set(column.dataIndex, this.getSummary(view.store, column.summaryType, column.dataIndex, info));
            // OE: Base record data on column ID rather than dataIndex.
            summaryRecord.set(column.id, this.getSummary(view.store, column.summaryType, column.dataIndex, info));
        }
        summaryRecord.endEdit(true);
        // It's not dirty
        summaryRecord.commit(true);
        summaryRecord.isSummary = true;

        return summaryRecord;
    },

    outputSummaryRecord: function(summaryRecord, contextValues, out) {
        // While running the regular outputSummaryRecord, change the
        // columns' dataIndex to their ids, in order to make each
        // dataIndex uniqe, and match the values in ther record.
        var view = contextValues.view
        var columns = contextValues.columns || view.headerCt.getVisibleGridColumns()
        var i
        var dataIndexes = {}
        for (i = 0; i < columns.length; i++) {
            var column = columns[i]
            dataIndexes[column.id] = column.dataIndex
            column.dataIndex = column.id
        }

        this.callParent(arguments)

        for (i = 0; i < columns.length; i++) {
            var column = columns[i]
            var dataIndex = dataIndexes[column.id]
            if (dataIndex) {
                column.dataIndex = dataIndex
            } else {
                delete column.dataIndex
            }
        }
    }
})
