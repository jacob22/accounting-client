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

Ext.define('Bokf.view.org.View', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.org-view',

    requires: [
        'Bokf.lib.CellEditing',
        'Bokf.lib.RoleComboBox',
        'Bokf.store.Roles',
        'Bokf.view.org.APIUser',
        'Bokf.view.org.Subscription'
    ],

    layout: {
        type: 'column',
        columns: 2
    },

    autoScroll: true,

    items: [
        {xtype: 'panel',
         columnWidth: 0.5,
         layout: {
             type: 'vbox',
             align: 'stretch',
             padding: '5 5',
             defaultMargins: '0 0 10 0'
         },
         border: false,
         items: [
             {xtype: 'orgedit'},
             {name: 'members', xtype: 'grid', hideHeaders: true,
              columns: {items: [
                  {dataIndex: 'name', flex: 1},
                  {dataIndex: 'roles', width: 150,
                   editor: {xtype: 'rolecombo'},
                   renderer: function(value, metadata, record) {
                       return Bokf.store.Roles.get_description(value)
                   }}
              ]},
              plugins: [{ptype: 'deletecolumn',
                         canDelete: function(record, store) {
                             return store.count() > 1
                         }},
                        {ptype: 'cellediting-enteristab'}
                       ],
              buttons: [{action: 'save'},
                        {action: 'cancel'}],
              listeners: {
                  showeditor: function(plugin, editor, context, value) {
                      var combo = editor.field
                      combo.noEdit = !plugin.grid.isAdmin
                  }
              }
             },
             {name: 'invite', xtype: 'invite'},
             {name: 'invitations', xtype: 'grid', hideHeaders: true,
              columns: {items: [{dataIndex: 'emailTo', flex: 1}]},
              plugins: [{ptype: 'deletecolumn'}]
             },
             {xtype: 'apiuser'}
         ]
        },
        {xtype: 'panel',
         columnWidth: 0.5,
         layout: {
             type: 'vbox',
             align: 'stretch',
             padding: '5 5',
             defaultMargins: '0 0 10 0'
         },
         border: false,
         items: [
             {xtype: 'subscription'},
             {xtype: 'paymentproviders'}
         ]
        }
    ],

    l10n: {
        members: {
            title: 'Users',
            buttons: {
                save: 'Save',
                cancel: 'Revert'
            }
        },
        invitations: {
            title: 'Invited'
        }
    },

    listeners: {
        beforerender: function() {
            var members = this.down('grid[name=members]')
            members.setTitle(this.l10n.members.title)
            Bokf.lib.Utils.translateButtons(members, this.l10n.members.buttons)
            this.down('grid[name=invitations]').setTitle(
                this.l10n.invitations.title)
        }
    },

    getMembersList: function() {
        return this.down('grid[name=members]')
    },

    showRecord: function(record) {
        var membersList = this.getMembersList()
        var invite = this.down('invite')
        var editor = this.down('orgedit')
        var apiuser = this.down('apiuser')

        editor.loadRecord(record)
        apiuser.loadRecord(record)

        if (record.phantom) {
            membersList.hide()
            invite.hide()
        } else {
            membersList.show()
            membersList.isAdmin = record.isAdmin()
            if (record.isAdmin()) {
                invite.show()
                var invitationForm = invite.getForm()
                invitationForm.reset()
                invitationForm.setValues({org: record.get('id')})
                invitationForm.clearInvalid()
            } else {
                invite.hide()
            }
        }

        this.loadMembers(record)
        this.loadInvited()
    },

    updateMemberButtons: function() {
        var membersList = this.getMembersList()
        var dirty = membersList.getStore().isDirty()
        membersList.down('button[action=save]').setDisabled(!dirty)
        membersList.down('button[action=cancel]').setDisabled(!dirty)
    },

    loadMembers: function(record) {
        var membersList = this.getMembersList()
        var memberStore = Ext.create('Ext.data.Store', {
            model: 'Bokf.model.User',
            proxy: 'writablememory',
            data: record.get('userpermissions'),
            sorters: ['name']
        })
        if (membersList.getStore()) {
            membersList.getStore().un('update', this.updateMemberButtons, this)
        }
        membersList.reconfigure(memberStore)
        memberStore.on('update', this.updateMemberButtons, this)
        this.updateMemberButtons()
    },

    loadInvited: function() {
        var editor = this.down('orgedit')
        var record = editor.getRecord()
        var invitedList = this.down('grid[name=invitations]')

        var invitations = Ext.create('Ext.data.Store', {
            model: 'Bokf.model.Invitation',
            autoLoad: true,
            autoSync: true,
            filters: [
                {property: 'accepted', value: false},
                {property: 'org', value: record.get('id')}
            ],
            sorters: ['emailTo']
        })

        invitations.on('datachanged', function() {
            if (invitations.count()) {
                invitedList.show()
            } else {
                invitedList.hide()
            }
        })
        invitedList.reconfigure(invitations)
    }
})
