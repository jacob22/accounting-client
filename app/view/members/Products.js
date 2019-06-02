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

Ext.syncRequire(['Bokf.lib.Utils'])

Ext.define("Bokf.view.members.Products", {
    extend: 'Ext.panel.Panel',
    alias: 'widget.products',

    requires: [
        'Bokf.lib.CurrencyDisplay',
        'Bokf.lib.TagsEditor',
        'Bokf.lib.Utils',
        'Bokf.lib.WritableMemoryProxy',
        'Bokf.store.members.ProductFilters',
        'Bokf.store.members.ProductTags'
    ],

    autoScroll: true,

    tbar: [
        {xtype: 'tbspacer', width: 10},
        {xtype: 'combo', name: 'filter', editable: false, forceSelection: true,
         store: {type: 'productfilters'}, valueField: 'id',
         listeners: {
             afterrender: function() {
                 this.select(this.getStore().first())
             }
         }
        },
        {xtype: 'tbspacer', width: 10},
        {xtype: 'button', action: 'addproduct'},
        '->',
        {xtype: 'component', name: 'invoicelink',
         autoEl: {tag: 'a', target: '_blank'},
         hidden: true,
         setLink: function(link) {
             if (this.getEl()) {
                 this.getEl().set({href: link})
             } else {
                 this.on('render', function() {
                     this.getEl().set({href: link})
                 }, this)
             }
         }
        },
        {xtype: 'tbtext', text: ' | ', name: 'linksep', hidden: true},
        {xtype: 'component', name: 'webshoplink',
         autoEl: {tag: 'a', target: '_blank'},
         setLink: function(link) {
             if (this.getEl()) {
                 this.getEl().set({href: link})
             } else {
                 this.on('render', function() {
                     this.getEl().set({href: link})
                 }, this)
             }
         }
        },
        ' '
    ],

    l10n: {
        buttons: {
            addproduct: 'Add product'
        },
        fieldLabels: {
            filter: 'Filter by'
        },
        invoice: 'Send an invoice',
        webshop: 'The web shop can be found here'
    },

    listeners: {
        beforerender: function() {
            this.down('[name=invoicelink]').autoEl.html = this.l10n.invoice
            this.down('[name=webshoplink]').autoEl.html = this.l10n.webshop
        },
        afterrender: function() {
            Bokf.lib.Utils.translateButtons(this, this.l10n.buttons)
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
        }
    },

    setReadOnly: function(readOnly) {
        Bokf.lib.Utils.setOEReadOnly([this.down('[action=addproduct]')],
                                     readOnly)
        this.setInvoiceLinkVisible(!readOnly)
    },

    setInvoiceLinkVisible: function(visible) {
        if (visible) {
            this.down('[name=linksep]').show()
            this.down('[name=invoicelink]').show()
        } else {
            this.down('[name=linksep]').hide()
            this.down('[name=invoicelink]').hide()
        }
    }

})

Ext.define("Bokf.view.members.Product", {
    extend: 'Ext.panel.Panel',
    alias: 'widget.product-wrapper',

    collapsed: true,
    collapsible: true,
    padding: '5 5 5 5',
    margin: '5 0 5 0',

    header: {
        cls: 'payment',
        listeners: {
            click: function() {
                if (this.ownerCt.getCollapsed()) {
                    this.ownerCt.expand()
                } else {
                    this.ownerCt.collapse()
                }
            }
        }
    }
})


Ext.define("Bokf.view.members.ProductView", {
    extend: 'Ext.form.Panel',
    alias: 'widget.product',

    requires: [
        'Bokf.lib.AccountingRules',
        'Bokf.lib.DisplayText'
    ],

    header: false,
    border: false,

    name: 'product-form', autoScroll: true,
    region: 'center',
    layout: {
        type: 'vbox',
        align: 'stretch',
        padding: '5 5',
        defaultMargins: '0 0 10 0'
    },

    trackResetOnLoad: true,
    readOnly: false,

    items: [
        {xtype: 'container', layout: 'hbox', name: 'form',
         items: [
             {name: 'name', xtype: 'textfield', allowBlank: false, flex: 1,
              margin: '0 25 0 0'}
         ]
        },

        {name: 'tagsdescr', xtype: 'displaytext'},

        {name: 'tags', xtype: 'tagseditor'},

        {name: 'description', xtype: 'textarea', labelAlign: 'top'},

        {name: 'image', xtype: 'imageupload'},

        {name: 'notes', xtype: 'textarea', labelAlign: 'top'},

        {name: 'optionFields', xtype: 'optionfields'},

        {name: 'makeTicket', xtype: 'checkbox'},

        {name: 'stock', xtype: 'productstock'},

        {name: 'rules', xtype: 'accounting-rules',
         maxWidth: 500},

        {xtype: 'container', layout: 'hbox', //hidden: true,
         items: [
             {name: 'vatAccount', xtype: 'accounteditor',
              valueField: 'number',
              forceSelection: false, width: 400},
             {action: 'clearvat', xtype: 'button',
              margin: '0 0 0 25'}
         ]
        },

        {name: 'price', xtype: 'currencydisplay'},

        {name: 'available', xtype: 'checkbox'},
        {xtype: 'datefield', name: 'availableFrom', submitEmptyText: false,
         submitFormat: 'Y-m-d', maxWidth: 250},
        {xtype: 'datefield', name: 'availableTo', submitEmptyText: false,
         submitFormat: 'Y-m-d', maxWidth: 250},
        {name: 'archived', xtype: 'checkbox'}
    ],

    buttons: [
        {action: 'removeproduct'},
        ' ',
        {action: 'copyproduct'},
        {action: 'saveproduct'}
    ],

    l10n: {
        productForm: {
            captions: {
                tagsdescr: 'Tags will be used to categorise the product in the web shop. If the product has more than one tag, it will show up under multiple categories. If it has no tags, it will show up at the top level.'
            },
            fieldLabels: {
                name: 'Name',
                archived: 'Archived',
                available: 'Published',
                availableFrom: 'Available from',
                availableTo: 'Availableto to',
                description: 'Product description (shown to buyer)',
                makeTicket: 'Produce tickets',
                notes: 'Administrative notes (not shown to buyer)',
                price: 'Total price',
                tags: 'Tags',
                vatAccount: 'VAT account'
            },
            emptyTexts: {
                availableFrom: 'no start date',
                availableTo: 'no end date'
            },
            buttons: {
                clearvat: 'Clear VAT account',
                removeproduct: 'Delete product',
                copyproduct: 'Copy',
                saveproduct: 'Save'
            }
        },
        rules: {
            title: 'Accounting rules',
            summary: 'VAT-exclusive price:',
            columnTitles: {
                accountNumber: 'Account',
                amount: 'Amount'
            }
        },
        imageform: {
            add: 'Add image',
            change: 'Change image',
            'delete': 'Delete image'
        }
    },

    listeners: {
        beforerender: function() {
            Bokf.lib.Utils.translateFieldLabels(
                this, this.l10n.productForm.fieldLabels)
            Bokf.lib.Utils.translateComponents(
                this, this.l10n.productForm.captions, undefined, 'setText')

            this.down('[name=availableFrom]').emptyText =
                this.l10n.productForm.emptyTexts.availableFrom
            this.down('[name=availableTo]').emptyText =
                this.l10n.productForm.emptyTexts.availableTo

            Bokf.lib.Utils.translateButtons(this, this.l10n.productForm.buttons)

            var root = this.down('grid[name=rules]')
            root.title = this.l10n.rules.title
            Bokf.lib.Utils.translateComponents(
                root, this.l10n.rules.columnTitles, '[dataIndex={0}]')

            root = root.getDockedItems('[dock="bottom"]')[0]

            this.down('imageupload').setText(this.l10n.imageform)

            Bokf.lib.Utils.setOEReadOnly(this.query('field'), this.readOnly)
            Bokf.lib.Utils.setOEReadOnly(this.query('button'), this.readOnly)
        },

        render: function(form) {
            // ignore nested grid fields
            form.getForm().monitor.selector = '[isFormField]:dontignore'
        }
    },

    setAccountsStore: function(accountsStore) {
        this.accountsStore = accountsStore
    },

    loadRecord: function(record) {
        this.setTitle(record.get('name'))
        this.callParent(arguments)

        this.getOptionFields().setReadOnly(this.readOnly)
        this.getRulesGrid().setReadOnly(this.readOnly)

        this.down('productstock').loadRecord(record)

        var storeId = 'producttags-' + record.get('org')
        var tagsStore = Ext.getStore(storeId)
        if (!tagsStore) {
            // Try reusing the same tags store in all products in the same org.
            // The reason we're replacing the proxy is that we want
            // the tags editors to be able to add new records to the
            // store, without them necessarily being synced to the
            // back end.
            // This is not possible to do by just keeping the original
            // proxy and just not syncing, as the combobox will force
            // reloads every now and then.
            tagsStore = Ext.create('Bokf.store.members.ProductTags', {
                storeId: storeId,
                filters: [
                    {id: 'org', property: 'org', value: record.get('org')}
                ]
            })
            tagsStore.load({
                callback: function(records) {
                    var proxy = Ext.create('Bokf.lib.WritableMemoryProxy', {
                        fields: ['tag'],
                        data: records
                    })
                    tagsStore.setProxy(proxy)
                    tagsStore.clearFilter()
                }
            })
        }
        this.getTagsEditor().newTagData = {org: record.get('org')}
        this.getTagsEditor().bindStore(tagsStore)
    },

    getTagsEditor: function() {
        return this.down('[name=tags]')
    },

    getImageForm: function() {
        return this.down('imageupload')
    },

    getOptionFields: function() {
        return this.down('optionfields')
    },

    getRulesGrid: function() {
        return this.down('grid[name=rules]')
    },

    getVatAccountSelector: function() {
        return this.down('accounteditor[name=vatAccount]')
    },

    getPriceDisplay: function() {
        return this.down('currencydisplay[name=price]')
    },

    getDeleteButton: function() {
        return this.down('button[action=removeproduct]')
    },

    getCopyButton: function() {
        return this.down('button[action=copyproduct]')
    },

    getSaveButton: function() {
        return this.down('button[action=saveproduct]')
    }
})

Ext.define('Bokf.view.members.ProductStock', {
    extend: 'Ext.container.Container',
    alias: 'widget.productstock',
    requires: [
        'Bokf.lib.Utils'
    ],

    layout: 'hbox',

    items: [
        {xtype: 'checkbox', name: 'limited', margin: '0 50 0 0',
         listeners: {
             change: function(field, newVal, oldVal) {
                 var fieldset = field.up('productstock').down('fieldset')
                 fieldset.setDisabled(!newVal)
                 var totalStock = fieldset.down('[name=totalStock]')
                 if (newVal && isNaN(parseInt(totalStock.getValue()))) {
                     totalStock.setValue(0)
                     totalStock.resetOriginalValue()
                 }
             }
         }
        },
        {xtype: 'fieldset', layout: 'hbox', border: 0,
         defaults: {
             margin: '0 50 0 0'
         },
         items: [
             {xtype: 'numberfield', name: 'totalStock', grow: true,
              listeners: {
                  change: function(field, newVal) {
                      var currentStockField = field.up('productstock').
                          down('[name=currentStock]')
                      var currentStock = ''
                      if (typeof(newVal) == 'number') {
                          currentStock = newVal - parseInt(field.up('productstock').
                                 down('[name=quantitySold]').getValue(), 10)

                      }
                      currentStockField.setValue(currentStock)
                  }
              }
             },
             {xtype: 'displayfield', name: 'quantitySold'},
             {xtype: 'displayfield', name: 'currentStock', margin: 0}
         ]
        }
    ],

    l10n: {
        fieldLabels: {
            limited: 'Use inventory',
            totalStock: 'Total stock',
            quantitySold: 'Quantity sold',
            currentStock: 'Left in stock'
        }
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
        }
    },

    loadRecord: function(record) {
        var checkbox = this.down('[name=limited]')
        var limited = record.get('totalStock') != null
        checkbox.setValue(limited)
        checkbox.resetOriginalValue()
        checkbox.fireEvent('change', checkbox, limited, !limited)
        var totalStock = this.down('[name=totalStock]')
        totalStock.fireEvent('change', totalStock, record.get('totalStock'))
    }
})


Ext.define("Bokf.view.members.OptionFields", {
    extend: 'Ext.panel.Panel',
    alias: 'widget.optionfields',

    margin: '0 0 20 0',
    border: 0,

    readOnly: false,

    header: {
        cls: 'option-fields',
        border: 0
    },

    dockedItems: [
        {xtype: 'displaytext', name: 'option-fields-caption', border: 0}
    ],

    buttons: [
        {xtype: 'button', action: 'addoption', menu: {xtype: 'menu'}}
    ],

    l10n: {
        title: 'Product options',
        caption: '\
If you want your customer to specify any product specific options (such as name of membership owner or color of t-shirt) you can specify the options here.',
        buttons: {
            addoption: 'Add new option'
        }
    },

    listeners: {
        afterrender: function() {
            this.setTitle(this.l10n.title)
            Bokf.lib.Utils.translateButtons(this, this.l10n.buttons)

            this.down('displaytext[name=option-fields-caption]').setText(
                this.l10n.caption)

            var menu = this.down('button[action=addoption] menu')
            var store = Ext.create('Bokf.store.members.OptionFieldType')
            store.each(function(record) {
                menu.add({itemId: record.get('id'), text: record.get('name')})
            })
        }
    },

    reconfigure: function(store) {
        // remove old listener if one has been added already
        store.un('add', this._recordsAdded, this)

        this.removeAll(true)
        store.each(this.addOptionWidget, this);
        store.on('add', this._recordsAdded, this)
        store.on('remove', function(store, record) {
            var widget = this.down('[recordId=' + record.id + ']')
            this.remove(widget)
        }, this)
    },

    _recordsAdded: function(store, records) {
        Ext.each(records, this.addOptionWidget, this)
    },

    addOptionWidget: function(record) {
        var store = Ext.create('Bokf.store.members.OptionFieldType')
        var type = store.getById(record.get('type'))

        var widget = Ext.createByAlias('optionfield.' + type.get('id'), {
            recordId: record.id,
            title: type.get('name'),
            readOnly: this.readOnly
        })

        widget.loadRecord(record)
        this.add(widget)
    },

    setReadOnly: function(readOnly) {
        this.readOnly = readOnly
        this.down('button[action=addoption]').setDisabled(readOnly)
    }
})


Ext.define("Bokf.view.members.OptionField", {
    extend: 'Ext.form.Panel',
    alias: [
        'widget.optionfield',
        'optionfield.text',
        'optionfield.textarea',
        'optionfield.personnummer'
    ],

    readOnly: false,

    trackResetOnLoad: true,
    border: 0,
    padding: '5 5 5 5',

    header: {
        cls: 'option-field',
        titlePosition: 0,
        border: 0,
        items: [
            {xtype: 'button', action: 'delete', text: '&times;',
             margin: 0, padding: 0}
        ]
    },

    layout: {
        type: 'table',
        columns: 2
    },

    items: [
        {name: 'label', xtype: 'textfield', allowBlank: false, margin: '0 10 0 0'},
        {name: 'mandatory', xtype: 'checkbox',
         boxLabel: ' ' // must be defined otherwise setBoxLabel() won't work
        },
        {name: 'optdescr', xtype: 'textarea', colspan: 2, grow: true, cols: 60}
    ],

    l10n: {
        fieldLabels: {
            label: 'Name',
            optdescr: 'Description'
        },
        mandatory: 'Mandatory'
    },

    listeners: {
        afterrender: function() {
            Bokf.lib.Utils.translateFieldLabels(this, this.l10n.fieldLabels)
            this.down('checkbox[name=mandatory]').setBoxLabel(this.l10n.mandatory)

            Ext.each(this.getHeader().query('button[action=delete]'), function(button) {
                button.setDisabled(this.readOnly)
            }, this);

            Bokf.lib.Utils.setOEReadOnly(this.query('field'), this.readOnly)
        }
    },

    initComponent: function() {
        this.callParent(arguments)
        this.addEvents('change')
        this.enableBubble('change')
    }
})


Ext.define('Bokf.view.members.SelectOptionField', {
    extend: 'Bokf.view.members.OptionField',

    alias: [
        'widget.selectoptionfield',
        'optionfield.select'
    ],

    initComponent: function() {
        var grid = {xtype: 'selectoptiongrid', colspan: 2}
        if (this.readOnly) {
            grid.plugins = [] // remove the editing plugin
            grid.readOnly = true
        }

        this.items = this.items.concat([grid])
        this.callParent(arguments)
    },

    gridChanged: function() {
        this.fireEvent('change', this)
    },

    loadRecord: function(record) {
        var grid = this.down('grid')
        var data = record.get('typedata')
        var store = Ext.create('Ext.data.Store', {
            model: 'Bokf.model.members.SelectOptionField'
        })
        if (data) {
            store.loadRawData({responseText: data})
        }

        grid.reconfigure(store)
        store.on({
            scope: this,
            datachanged: this.gridChanged,
            update: this.gridChanged
        })

        this.callParent(arguments)
    },

    getValues: function() {
        var values = this.callParent(arguments)
        var store = this.down('grid').store

        var options = []
        store.each(function(record) {
            options.push({name: record.get('name')})
        });

        var typedata = {options: options}
        values.typedata = Ext.JSON.encode(typedata)
        return values
    },

    destroy: function() {
        var grid = this.down('grid')
        if (grid.store) {
            grid.store.un('datachanged', this.gridChanged, this)
            grid.store.un('update', this.gridChanged, this)
        }
        this.callParent(arguments)
    }
})


Ext.define('Bokf.view.members.SelectOptionGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.selectoptiongrid',
    requires: [
        'Bokf.lib.CellEditing',
        'Ext.grid.column.Action',
        'Ext.grid.plugin.DragDrop'
    ],

    margin: '0 0 0 105',
    hideHeaders: true,
    header: {
        titlePosition: 0,
        items: [
            {xtype: 'button', action: 'add', text: '+',
             margin: 0, padding: 0}
        ]
    },
    viewConfig: {
        plugins: {
            ptype: 'gridviewdragdrop'
        }
    },
    plugins: [
        {ptype: 'cellediting-enteristab', clicksToEdit: 1}
    ],

    columns: [
        {name: 'drag', width: 24, renderer: function() {
            return '<span title="' + this.l10n.dragdropTooltip + '">\u2195</span>'
        } },
        {header: 'Name',  dataIndex: 'name', flex: true,
         editor: {xtype: 'textfield', ignore: true, allowBlank: 'false'}},
        {name: 'delete', xtype:'actioncolumn', width: 24,
         icon: 'packages/ext-theme-classic/resources/images/tab/tab-default-close.gif',
         handler: function(grid, rowIndex, colIndex) {
             grid.getStore().removeAt(rowIndex)
         }
        }
    ],

    l10n: {
        title: 'Options',
        dragdropTooltip: 'Reorder by dragging'
    },

    listeners: {
        beforerender: function(grid) {
            if (grid.readOnly) {
                Ext.each(grid.columns, function(column) {
                    if (column.dataIndex != 'name') {
                        column.hide()
                    }
                });
            }
        },

        afterrender: function() {
            this.setTitle(this.l10n.title)
        }
    },

    initComponent: function () {
        this.callParent()
        this.addEvents('change')
        this.enableBubble('change')
    }
})
