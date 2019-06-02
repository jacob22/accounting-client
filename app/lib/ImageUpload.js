/**
   FileUpload element with optional preview for images

   author : Jan van de Klok
**/
Ext.define('Bokf.lib.ImageUpload', {
    alias : 'widget.imageupload',
    extend : 'Ext.form.Panel',

    requires: ['Ext.form.field.File', 'Ext.Img' ],

    url: '/imageUpload',
    border: false,

    // these should be overwritten using setText()
    texts: {
        add: '',
        change: '',
        'delete': ''
    },

    initComponent : function() {
        var me = this;

        var upLoadButton = {
            xtype : 'fileuploadfield',
            margin : '0 5 0 0',
            name : 'image',
            layout : me.layout,
            buttonText : me.buttonText,
            buttonOnly: true,
            listeners : {
                afterrender: function(cmp) {
                    cmp.fileInputEl.set({
                        accept:'image/*'
                    });
                },
                change : function(input, value, opts){
                    // can't get the file path directly from the component due to
                    // browser security that does not allow for javascript to access the local file system directly
                    // Browser will return a "fakePath" reference to the actual local file
                    // To work around this, we have to access the dom file directly from the input element!!!

                    //var canvas = Ext.ComponentQuery.query('image[canvas="'+ input.inputId+ '"]')[0];
                    var canvas = me.down('image')
                    var file = input.getEl().down('input[type=file]').dom.files[0];
                    me.getForm().setValues({'delete': null})

                    // When the form has been submitted once, its listeners in this widget are lost.
                    // Manually tickle checkDirty() to produce dirtychange event.
                    me.getForm().checkDirty()

                    if (file.type == "image/jpeg" ||
                        file.type == "image/jpg" ||
                        file.type == "image/png" ||
                        file.type == "image/gif")
                    {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            canvas.setSrc(e.target.result);
                        }
                        reader.readAsDataURL(file);
                        canvas.show();
                    } else {
                        canvas.hide();
                    }
                }
            }
        }

        var previewImage = {
            xtype : 'image',
            frame : true,
            canvas : upLoadButton.inputId,
            hidden : true, // initially hidden
            scope : this,
            style: "max-width: 100%;",

            listeners: {
                show: function() {
                    me.down('[name=deleteButton]').enable()
                    me.down('fileuploadfield').button.setText(me.texts.change)
                },
                hide: function() {
                    me.down('[name=deleteButton]').disable()
                    me.down('fileuploadfield').button.setText(me.texts.add)
                }
            }
        }

        var deleteButton = {
            xtype: 'button',
            name: 'deleteButton',
            disabled: true,

            listeners: {
                click: function() {
                    me.getForm().setValues({'delete': 'true'})
                    me.down('image').hide()
                    me.down('fileuploadfield').reset()
                }
            }
        }

        // rename original name and id to avoid conflits

        me.items= [
            {name: 'owner', xtype: 'hidden' },
            {name: 'delete', xtype: 'hidden'},
            {xtype: 'container',
             layout: 'hbox',
             padding: '0 0 5 0',
             items: [
                 upLoadButton,
                 deleteButton
             ]
            },
            previewImage
        ]
        me.callParent(arguments);

        me.enableBubble('dirtychange')
        me.getForm().enableBubble('dirtychange')
    },

    listeners: {
        afterrender: function() {
            this.down('image').el.on('load', this.doLayout, this)
        }
    },

    setText: function(texts) {
        this.texts = texts
        var field = this.down('fileuploadfield')
        field.buttonText = texts.add
        if (field.button) {
            field.button.setText(texts.add)
        }

        var deleteButton = this.down('button[name=deleteButton]')
        deleteButton.setText(texts['delete'])
    },

    setImage: function(record) {
        var canvas = this.down('image')

        if (record.get('hasImage')) {
            var url = '/image/' + record.get('id') +
                '?nocache=' + new Date().getTime()
            canvas.setSrc(url)
            canvas.show()
        } else {
            canvas.setSrc(null)
            canvas.hide()
        }
    },

    upload: function(record, done) {
        done = done || function() {}
        if (this.isDirty()) {
            var form = this.getForm()
            record.set('hasImage', !form.getValues()['delete'])
            form.setValues({owner: record.get('id')})
            this.submit({
                scope: this,
                success: function(form, action) {
                    form.reset()
                    done()
                }
            })
        } else {
            done()
        }
    }
});
