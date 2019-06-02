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

Ext.define('Bokf.controller.members.Products', {
    extend: 'Ext.app.Controller',
    requires: [
        'Bokf.lib.Utils',
        'Bokf.store.members.Products'
    ],

    refs: [
        {ref: 'products', selector: 'products'},
        {ref: 'filterCombo', selector: 'products combo[name=filter]'},
        {ref: 'invoiceLink', selector: 'products [name=invoicelink]'},
        {ref: 'webshopLink', selector: 'products [name=webshoplink]'},
        {ref: 'viewPort', selector: 'vp'}
    ],

    l10n: {
        loadMask: 'Loading products...',
        expand: {
            loadMask: 'Opening product...'
        },
        optionFieldDefaults: {
            personnummer: {
                label: 'Personal ID number',
                optdescr: 'Please fill in your personal ID number.'
            }
        },
        newProductDefaults: {
            name: 'New product'
        },
        copyProduct: {
            loadMask: 'Copying product...'
        },
        remove: {
            failure: {
                title: 'Could not remove product',
                msg: 'The product could not be removed. This is probably because it has been sold already.'
            }
        }
    },

    init: function controller_init(app) {
        this.control({
            'products combo[name=filter]': {
                select: this.filterSelected
            },

            'products button[action=addproduct]': {
                click: this.addProduct
            },

            'products product button[action=removeproduct]': {
                click: this.removeProduct
            },

            'products product button[action=copyproduct]': {
                click: this.copyProduct
            },

            'products button[action=saveproduct]': {
                click: this.save
            },

            'products product': {
                dirtychange: function(form, dirty) {
                    this.updateButtonState(dirty, form.owner)
                }
            },

            'products imageupload': {
                dirtychange: function(form, dirty) {
                    // Propagate dirtychange from image form. Needed
                    // because listeners are lost on form submit.
                    // See also: ImageUpload.js upload button change listener.
                    form.owner.up('product').getForm().checkDirty()
                }
            },

            'products optionfields button[action=addoption] menu': {
                click: function(button, event) {
                    var store = button.up('product').getRecord().optionFields()
                    var type = event.itemId
                    var data = {type: type}
                    var defaults = this.l10n.optionFieldDefaults[type] || {}
                    Ext.Object.each(defaults, function(key, item) {
                        data[key] = item
                    })
                    store.add(data)
                }
            },

            'products optionfields optionfield field': {
                change: function(field) {
                    var form = field.findParentByType('form')
                    var record = form.getRecord()
                    var values = form.getValues(
                        undefined, undefined, undefined,
                        true // use getModelData(), returns true from checkbox
                             // rather than "on"
                    )
                    record.set(values)
                    field.up('product').getForm().checkDirty()
                }
            },

            'products optionfields selectoptionfield': {
                change: function(form) {
                    var record = form.getRecord()
                    var values = form.getValues(
                        undefined, undefined, undefined,
                        true // use getModelData(), returns true from checkbox
                             // rather than "on"
                    )
                    record.set(values)
                    this.setDirty(form.up('product'))
                }
            },

            'products optionfields optionfield button[action=delete]': {
                click: function(button) {
                    var optionfield = button.up('optionfield')
                    var form = optionfield.up('product')
                    var record = optionfield.getRecord()
                    record.store.remove(record)
                    this.setDirty(form)
                }
            },

            'products optionfields selectoptionfield button[action=add]': {
                click: function(button) {
                    var grid = button.up('grid')
                    var store = grid.getStore()
                    store.add({})
                }
            },

            'products grid[name=rules]': {
                edit: this.handleRuleEdit,
                afterdeleterecord: this.ruleDeleted
            },

            'products button[action=clearvat]': {
                click: this.clearVatAccount
            },

            'product accounteditor[name=vatAccount]': {
                change: this.recalculateTotalPrice
            },

            'product checkbox[name=available]': {
                change: this.updateArchivable
            },

            'product checkbox[name=archived]': {
                change: this.updateArchivable
            }

        })

        this.listen({
            controller: {
                '*': {
                    orgselected: this._orgSelected
                }
            }
        })
    },

    filterSelected: function(combo, filter) {
        Bokf.lib.ApplicationState.getSelectedOrg(this.orgSelected, this)
    },

    _orgSelected: function(org, implicit, loader) {
        Bokf.lib.Utils.callAtShow(this.getProducts(), this.orgSelected, this,
                                  org, loader)
    },

    orgSelected: function(org, loader) {
        if (!loader || loader.done) {
            loader = new Bokf.lib.LoadMaskController(
                this.getViewPort(), this.l10n.loadMask, true)
        }
        loader.incref('Loading products')
        this.getProducts().setReadOnly(!org.isStoreKeeper())
        this.getProducts().removeAll()
        this.getWebshopLink().setLink('/webshop/' + org.get('id'))
        this.getInvoiceLink().setLink('/invoicing/invoice/' + org.get('id'))

        var products = Ext.create('Bokf.store.members.Products', {
            filters: [
                {id: 'org', property: 'org', value: org.get('id')}
            ],
            sorters: ['name']
        })

        var filter = this.getFilterCombo().getValue()
        var filters = []
        if (filter == 'archived') {
            filters.push({id: 'archived', property: 'archived',
                          value: true})
        } else {
            filters.push({id: 'archived', property: 'archived',
                          value: false})
            if (filter == 'published') {
                filters.push({id: 'published', property: 'available',
                              value: true})
            } else if (filter == 'unpublished') {
                filters.push({id: 'published', property: 'available',
                              value: false})
            }
        }
        products.filter(filters)
        products.load()

        Bokf.lib.Utils.waitForStores([org.accountings()], function() {
            var accounts = org.currentAccounts()
            accounts.load()
            var vatAccounts = org.currentVatAccounts(true)

            Bokf.lib.Utils.waitForStores([accounts, products], function() {
                var components = []
                products.each(function(product) {
                    components.push(
                        this.createProductComponent(product,
                                                    accounts.clone(),
                                                    vatAccounts,
                                                    !org.isStoreKeeper()))
                }, this);
                this.getProducts().add(components)
                loader.decref('Loading products')
            }, this)
        }, this)
    },

    createProductComponent: function(product, accounts, vatAccounts, readOnly, position) {
        var component = new Bokf.view.members.Product({
            title: product.get('name')
        })

        component.on('expand', function() {
            // Display a load mask, and put the expansion code in a
            // delayed task, otherwise the loadmask will never be
            // rendered.
            // Return false in order to block the immediate expansion.
            // Since the signal code will only be run once ({single:
            // true}), we can safely expand the widget once all widget
            // creation is complete.
            var loader = new Bokf.lib.LoadMaskController(
                this.getViewPort(), this.l10n.expand.loadMask, true,
                'Load product')

            var task = new Ext.util.DelayedTask(function() {
                var content = new Bokf.view.members.ProductView({
                    readOnly: readOnly
                })

                content.setAccountsStore(accounts)
                content.getRulesGrid().accountsStore = accounts
                content.getVatAccountSelector().bindStore(vatAccounts)
                this.displayProduct(product, content)
                component.expand()
                component.add(content)
                loader.decref('Load product')
            }, this)
            task.delay(0)

            return false

        }, this, {single: true})

        if (position != undefined) {
            this.getProducts().insert(position, component)
        }
        return component
    },

    displayProduct: function(record, component) {
        if (!record.isModel) {
            return
        }

        var form = component
        form.loadRecord(record)

        form.getImageForm().setImage(record)

        var store = record.accountingRules()
        form.getRulesGrid().reconfigure(store)
        this.recalculateTotalPrice(component)

        store.on('datachanged', function() {
            record.setDirty(component)
            this.recalculateTotalPrice(component)
        }, this)

        store.on('update', function() {
            this.recalculateTotalPrice(component)
        }, this)

        var store = record.optionFields()
        form.down('optionfields').reconfigure(store)

        form.getDeleteButton().setDisabled(record.get('available'))

        this.updateArchivable(form)

        // The form has an internal object 'monitor' that caches the
        // list of fields.  If any fields are added/removed after the
        // firs time the monitors getItems() has been invoked it needs
        // to be invalidated.
        form.getForm().monitor.invalidateItems()

        // Some times dirtychange event will not be triggered when
        // loading a non dirty record into a dirty form. Manually
        // trigger it by calling checkDirty()
        form.getForm().checkDirty()

        this.updateButtonState(false, form)
    },

    addProduct: function addProduct() {
        Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
            var data = {org: org.get('id')}
            data = Ext.Object.merge(data, this.l10n.newProductDefaults)

            var product = Ext.create('Bokf.model.members.Product', data)
            var component = this.createProductComponent(
                product, org.currentAccounts(true), org.currentVatAccounts(true),
                false, 0)
            component.expand()
        }, this)
    },

    removeProduct: function removeProduct(button) {
        var form = button.up('product')
        var record = form.getRecord()
        record.destroy({
            scope: this,
            success: function() {
                var wrapper = form.up('product-wrapper')
                form.up('products').remove(wrapper)
            },
            failure: function() {
                var texts = this.l10n.remove.failure
                Ext.Msg.show({
                    title: texts.title,
                    msg: texts.msg,
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.ERROR
                })
            }
        })
    },

    copyProduct: function(button) {
        var form = button.up('product')
        var record = form.getRecord()

        var loader = new Bokf.lib.LoadMaskController(
            this.getViewPort(), this.l10n.copyProduct.loadMask, true,
            'copy product')

        blm.members.copyProduct.call(
            [record.get('id')], function(result) {
                var id = result[0]
                Bokf.model.members.Product.load(id, {
                    scope: this,
                    failure: function(record, operation) {
                        loader.decref('copy product')
                    },
                    success: function(record, operation) {
                        Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
                            var component = this.createProductComponent(
                                record, org.currentAccounts(true), org.currentVatAccounts(true),
                                false, 0)
                            component.expand()
                            component.focus()
                            loader.decref('copy product')
                        }, this)
                    }
                })
            }, this)
    },

    save: function save(button) {
        var form = button.up('product')
        var imageform = form.getImageForm()
        var record = form.getRecord()

        // form.getValues() will ignore disabled widgets when the
        // dirty only flag is set to true.
        var availableCb = form.down('[name=available]')
        var available_dis = availableCb.disabled
        availableCb.disabled = false
        var archivedCb = form.down('[name=archived]')
        var archived_dis = archivedCb.disabled
        archivedCb.disabled = false

        var values = form.getValues(
            undefined,
            true, // dirty only
            undefined,
            true // use data values
        )

        availableCb.disabled = available_dis
        archivedCb.disabled = archived_dis

        // need to manually format the dates, as submitValue is ignored
        // when getValues() is called with useDataValues (param 4)
        if (values.availableFrom) {
            values.availableFrom = Ext.Date.format(values.availableFrom, 'Y-m-d')
        }

        if (values.availableTo) {
            values.availableTo = Ext.Date.format(values.availableTo, 'Y-m-d')
        }

        if (!form.down('[name=limited]').getValue()) {
            values.totalStock = null
        }

        if (values.tags) {
            values.tags = Bokf.lib.Utils.sortAlpha(values.tags)
        }

        record.set(values)

        record.setDirty(form)

        record.save({
            scope: this,
            callback: function() {
                var self = this
                imageform.upload(record, function() {
                    self.displayProduct(record, form)
                })
            }
        })
    },

    handleOptionEdit: function(editor, event) {
        if (event.value != event.originalValue) {
            this.setDirty(event.grid.up('product'))
        }
    },

    handleRuleEdit: function(editor, event) {
        if (event.value != event.originalValue) {
            // workaround for non updating summary, as per
            // http://www.sencha.com/forum/showthread.php?174953#post865995
            event.grid.getView().refresh()

            this.setDirty(event.grid.up('product'))
        }
    },

    ruleDeleted: function(plugin) {
        var form = plugin.grid.up('product')
        this.setDirty(form)
    },

    clearVatAccount: function(button) {
        var productForm = button.up('product')
        var combo = productForm.down('accounteditor[name=vatAccount]')
        combo.setValue(null)
    },

    recalculateTotalPrice: function(widget) {
        var productForm
        if (widget.xtype == 'product') {
            productForm = widget
        } else {
            productForm = widget.up('product')
        }
        var record = productForm.getRecord()

        var price = productForm.getRulesGrid().getStore().sum('amount')

        var vatAccountSelector = productForm.getVatAccountSelector()
        var vatAccount = vatAccountSelector.findRecordByValue(
            vatAccountSelector.getValue())

        var vat = 0
        if (vatAccount) {
            var percentage = vatAccount.get('vatPercentage')
            vat = price * percentage / 100
        }
        productForm.getPriceDisplay().setValue(price + vat)

    },

    setDirty: function(form) {
        // Set associated product as dirty and update button
        form.getRecord().setDirty()
        this.updateButtonState(true, form)
    },

    updateArchivable: function(widget, value) {
        var productForm
        if (widget.xtype == 'product') {
            productForm = widget
        } else {
            productForm = widget.up('product')
        }
        var availableCb = productForm.down('checkbox[name=available]')
        var archivedCb = productForm.down('checkbox[name=archived]')

        availableCb.setDisabled(archivedCb.getValue())
        archivedCb.setDisabled(availableCb.getValue())
    },

    updateButtonState: function(dirty, form) {
        var record = form.getRecord()
        dirty = dirty || record.dirty
        form.getCopyButton().setDisabled(dirty || record.phantom)
        form.getSaveButton().setDisabled(!dirty)
    }
})
