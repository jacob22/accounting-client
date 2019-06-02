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

Ext.define('Bokf.controller.members.PurchaseBase', {
    extend: 'Ext.app.Controller',

    requires: [
        'Bokf.lib.LoadMaskController',
        'Bokf.lib.Utils',
        'Ext.window.MessageBox'
    ],

    l10n: {
        loadMask: 'Filtering...',
        refund: {
            loadMask: 'Processing refund request...',
            failure: {
                title: 'Error',
                msg: 'Could not refund payment.'
            }
        },
        remind: {
            loadMask: 'Sending reminder email...',
            verify: {
                title: 'Send reminder email?',
                msg: ('Do you want to send an email to {0}, reminding them that ' +
                      'payment has not yet been received?'),
                ok: 'Send reminder email',
                cancel: 'Abort'
            },
            failure: {
                title: 'Error',
                msg: 'Could not send reminder.'
            }
        }
    },

    init: function init(app) {
        this.listen({
            controller: {
                // this should only listen to 'org',
                // see http://www.sencha.com/forum/showthread.php?258692
                '*': {
                    orgselected: this._orgSelected
                }
            }
        })

        this._currencyRenderer = Bokf.lib.Utils.currencyRendererFactory(2)
    },

    _orgSelected: function(org, implicit, loader) {
        Bokf.lib.Utils.callAtShow(this.getPanel(), this.populate, this,
                                  org, loader)
    },

    // Inheriting class need to connect the click event of the search
    // button to this function
    search: function() {
        Bokf.lib.ApplicationState.getSelectedOrg(function(org) {
            if (org) {
                var loader = new Bokf.lib.LoadMaskController(
                    this.getPanel(), this.l10n.loadMask, true, 'filtering')
                this.populate(org, loader)
                loader.decref('filtering')
            }
        }, this)
    },

    getMidnight: function(dateStr, midnight_after) {
        var d = Date.parse(dateStr) / 1000 + new Date().getTimezoneOffset() * 60
        if (midnight_after) {
            d += 86400
        }
        return d
    },

    makeFilters: function(org) {
        var selector = this.getFilterCombo() // Set up as a ref
        var filters = {
            paid: [{property: 'paymentState', value: 'paid'},
                   {property: 'cancelled', value: false}],
            unpaid: [{property: 'paymentState', value: ['unpaid', 'partial']},
                     {property: 'cancelled', value: false}],
            cancelled: [{property: 'cancelled', value: true}],
            credited: [{property: 'paymentState', value: ['credited']},
                       {property: 'cancelled', value: false}]
        }[selector.getValue() || 'unpaid']
        filters.push({id: 'org', property: 'org', value: org.get('id')})
        filters.push({id: 'kind', property: 'kind', value: this.kind})

        var lower_upper = this.getDateRange().getValue()
        lower_upper = [this.getMidnight(lower_upper[0], false),
                       this.getMidnight(lower_upper[1], true)]
        filters.push({
            id: 'range',
            property: 'date',
            value: {
                op: 'Between',
                value: lower_upper
            }
        })

        return filters
    },

    createPanelForRecord: function() {
        throw 'Not implemented'
    },

    populate: function(org, loader) {
        loader.incref('populate basepurchases')
        var panel = this.getPanel() // Set up as a ref
        panel.removeAll()

        var filters = this.makeFilters(org)
        var store = Ext.create(this.storeClass, {
            filters: filters,
            sorters: ['date']
        })

        store.load({
            scope: this,
            callback: function(records) {
                var widgets = []
                Ext.each(records, function(record, index) {
                    var widget = this.createPanelForRecord({
                        collapsed: index != 0,
                        readOnly: !(org.isStoreKeeper() || org.isAccountant())
                    })
                    widgets.push(widget)

                    widget.loadRecord(record)
                    var itemsTable = widget.down('purchaseitems')

                    var items = record.items()

                    items.load({
                        callback: function(records) {
                            itemsTable.reconfigure(items)
                        }
                    })
                }, this);
                panel.add(widgets)
                loader.decref('populate basepurchases')
            }
        })
    },

    cancelPurchase: function(button) {
        this._setCancelled(button, true)
    },

    reactivatePurchase: function(button) {
        this._setCancelled(button, false)
    },

    _setCancelled: function(button, cancelled) {
        var form = button.up('form')
        var record = form.getRecord()
        record.set('cancelled', cancelled)
        record.save({
            failure: function() {
                record.set('cancelled', !cancelled)
            },
            success: function() {
                form.loadRecord(record)
            }
        })
    },

    paymentReceived: function(button) {
        var form = button.up('form')
        var record = form.getRecord()
        var id = record.get('id')

        var window = Ext.create('Bokf.view.members.PaymentReceived')
        window.setContainerWidth(form.getWidth())
        window.show()
        window.setPurchase(record, form)

        // blm.members.manualPayment.call([id], {
        //     scope: this,
        //     success: function(result) {
        //         record.set('paymentState', 'paid')
        //         form.loadRecord(record)
        //         blm.members.sendPaymentConfirmationEmail.call(result)
        //     }
        // })
    },

    verificationCreated: function(win, purchase, form, paymentId) {
        win.close()
        purchase.set('paymentState', 'paid')
        form.loadRecord(purchase)
        blm.members.sendPaymentConfirmationEmail.call([paymentId])
    },

    credit: function(button) {
        var form = button.up('form')
        var record = form.getRecord()
        var id = record.get('id')
        blm.members.createCreditInvoice.call([id], {
            scope: this,
            success: function(result) {
                record.set('paymentState', 'credited')
                form.loadRecord(record)
            }
        })
    },

    refund: function(button) {
	var form = button.up('form')
	var record = form.getRecord()
	var id = record.get('id')
        var loader = new Bokf.lib.LoadMaskController(
            this.getPanel(), this.l10n.refund.loadMask, true, 'refund')
        blm.members.refundCredited.call([id], {
	    scope: this,
	    success: function(result) {
		record.set('paymentState', 'paid')
		form.loadRecord(record)
	    },
	    failure: function(result) {
		Ext.Msg.alert(this.l10n.refund.failure.title,
			      this.l10n.refund.failure.msg)
            },
            callback: function() {
                loader.decref('refund')
            }
	})
    },

    sendReminder: function(button) {
        var form = button.up('form')
        var record = form.getRecord()
        var email = record.get('buyerEmail')

        Ext.Msg.show({
            title: this.l10n.remind.verify.title,
            msg: Ext.String.format(this.l10n.remind.verify.msg, email),
            buttons: Ext.MessageBox.OKCANCEL,
            buttonText: {
                ok: this.l10n.remind.verify.ok,
                cancel: this.l10n.remind.verify.cancel
            },
            defaultFocus: 'cancel',
            scope: this,
            icon: Ext.MessageBox.QUESTION,
            fn: function(buttonId) {
                if (buttonId != 'ok') {
                    return
                }
                var loader = new Bokf.lib.LoadMaskController(
                    this.getPanel(), this.l10n.loadMask, true)
                loader.incref()
                var id = record.get('id')
                blm.members.sendReminderEmail.call([id], {
                    scope: this,
                    success: function(result) {
                        record.reload(function(record) {
                            form.updateReminderEmails(record)
                            loader.decref()
                        }, this)
                    },
                    failure: function(result) {
                        loader.decref()
                        Ext.Msg.alert(this.l10n.remind.failure.title,
                                      this.l10n.remind.failure.msg)
                    }
                })
            }
        })
    }
})
