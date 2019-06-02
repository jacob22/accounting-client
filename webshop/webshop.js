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

if (typeof translations == 'undefined') {
    translations = {}
}

_ = function(msgid) {
    return (translations[msgid] || [null, msgid])[1]
}

ngettext = function(msgid1, msgid2, n) {
    if (n == 1) {
	return (translations[msgid1] || [null, msgid1, msgid2])[1]
    } else {
	return (translations[msgid1] || [null, msgid1, msgid2])[2]
    }
}

EutaxiaShop = function(conf) {

    $.extend($.fn, {
	addValidator: function(validator) {
            $.each(this, function(_, element) {
                element = $(element)
                var validators = element.data('validators') || []
                validators.push(validator)
                element.data('validators', validators)
            })
        }
    })

    function validate(element) {
        var valid = true
        $.each(element.data('validators') || [], function(i, validator) {
            var value = element.val()
            switch (validator) {
            case "required":
                valid = !!value
                break;
            case "personnummer":
                if (value) {
                    valid = !!(value.match(/^\d{6}[-+]?\d{4}/) &&
                               luhnChk(value))
                }
                break;
            case "email":
                if (value) {
                    valid = !!(value.match(/^[\0-\x7f]+$/) &&
                               value.match(/^[^@]+@[^@]+\.[^@]+$/))
                }
                break;
            }
            var parent = element.parents('.form-group').first()
            if (!valid && value) {
                parent.addClass('has-error')
            } else {
                parent.removeClass('has-error')
            }
            return valid
        });
        return valid
    }

    var self = {
        root: '#webshop',
        baseurl: 'https://admin.eutaxia.eu/rest/',
        currency: 'SEK',

        window: window,
        jQuery: jQuery,

        ajax: function(type, conf) {
            var settings = {
                xhrFields: {withCredentials: true},
                data: {}
            }
            jQuery.extend(settings, conf)
            settings.data.org = self.org

            if (settings.contentType == 'application/json') {
                settings.data = $.toJSON(settings.data)
                settings.processData = false
            }

            var request = self.jQuery.ajax(self.baseurl + type, settings)
            return request
        },

        _toggleButton: function(root, button, title, disabled) {
            if (disabled === undefined) {
                disabled = false
            }
	    root.find('.entry').each(function(i, element) {
                if (!validate($(element))) {
                    disabled = true
                }
            });

            if (root.find('.item_stock').text() == '0') {
                disabled = true
            }

            var product = root.find('.item_product').val()

            $.each(simpleCart.find({product: product}), function(index, item) {
                if (!item.available(item.quantity() + 1)) {
                    disabled = true
                }
                return false
            })

            button.prop('disabled', disabled)
            if (disabled && title) {
                button.attr('title', title)
            } else {
                button.removeAttr('title')
            }
        },

        toggleAddButton: function() {
            var root = $(this).closest('.simpleCart_shelfItem')
            var button = root.find('.item_add')
	    var title = _('Please fill in the mandatory fields.')
	    self._toggleButton(root, button, title)
        },

        makeOptionField_text: function(mandatory) {
            var input = $('<input type="text" />').
                attr('size', 45)

            if (mandatory) {
                input.addValidator('required')
                input.prop('required', true).attr(
		    'placeholder', _('This field is mandatory.'))
                input.bind('change keyup', self.toggleAddButton)
            }
            return input
        },

        makeOptionField_textarea: function(mandatory) {
            var input = $('<textarea />').
                attr('cols', 40).
                attr('rows', 6)

            if (mandatory) {
                input.addValidator('required')
                input.prop('required', true).attr(
		    'placeholder', _('This field is mandatory.'))
                input.bind('change keyup', self.toggleAddButton)
            }
            return input
        },

        makeOptionField_select: function(mandatory, typedata) {
            var data = $.evalJSON(typedata)
            var select = $('<select>')
            $.each(data.options, function(i, option) {
                var name = option.name
                select.append($('<option />').val(name).text(name))
            });
            return select
        },

        makeOptionField_personnummer: function(mandatory) {
	    var input = $('<input type="text"/>').
                addClass('personnummer').
		attr('size', 45).
		attr('placeholder', _('YYMMDD-NNNN'))

            input.addValidator('personnummer')

            if (mandatory) {
                input.addValidator('required')
                input.prop('required', true)
            }

            input.bind('change keyup', self.toggleAddButton)
            return input
        },

        setupProduct: function(toidata, categoryIdx) {
            var toid = toidata.id[0]
            var shelfItem = $('<div class="simpleCart_shelfItem panel" />')

            var detailsId = 'shelfItemDetails_' + categoryIdx + '_' + toid
            var detailsDiv = $('<div class="details panel-collapse collapse" />').
                attr('id', detailsId)
            var headingDiv = $('<div class="shelfitem-heading panel-heading '+
                               'accordion-toggle collapsed"' +
                               'data-toggle="collapse"' +
                               'data-target="#'+detailsId+'" />')
            shelfItem.append(
                $('<input type="hidden" class="item_product" />').
                    val(toidata.id),
                headingDiv,
                detailsDiv)
            headingDiv.append(
                $('<span class="item_price" />').val(toidata.id).
                    html(simpleCart.toCurrency(toidata.price)),
                $('<span class="item_name" />').text(toidata.name)
            )
            detailsDiv.collapse({toggle: false})

            var optionsForm = $('<form role="form" class="form-horizontal options" />')
            if (toidata.hasImage[0]) {
                detailsDiv.append(
                    $('<img class="img-responsive pull-left product-image" src="/image/' +
                      toidata.id + '"/>'))
            }
            detailsDiv.append(
                $('<div class="description" />').
                    text(toidata.description),
                $('<div class="clearfix"/>'),
                optionsForm)

            var itemOrderDiv = $('<div class="pull-right form-inline" />')
            detailsDiv.append(itemOrderDiv)

            var buttonContainer = itemOrderDiv
            var stock = null

            if (toidata.currentStock.length) {
                stock = toidata.currentStock[0]
                buttonContainer = $('<label />').
		    append(_('Quantity remaining: '),
                           $('<span class="item_stock" />').text(toidata.currentStock))
                itemOrderDiv.append(buttonContainer)
            }
            buttonContainer.append(
		$('<button class="item_add btn"></button>').text(_('Add')))

            $.each(simpleCart.find({product: toidata.id[0]}), function(index, item) {
                item.set('stock', stock)
            });


            optionsForm.append(
                $('<input type="hidden" class="item_fieldcount" />').
                    val(toidata.optionFields.length))

            var hasMandatory = false

            jQuery.each(toidata.optionFields, function(index, fieldData) {
                var fieldDiv = $('<div class="form-group optionField" />')
                optionsForm.append(fieldDiv)

                var parts = fieldData.split('\u001f')
                var label = parts[0]
                var description = parts[1]
                var type = parts[2]
                var mandatory = Boolean(parseInt(parts[3]))
                var typedata = parts[4]

                hasMandatory = hasMandatory || mandatory

                var id = toidata.id + '_field' + index

                var label = $('<label />').attr('for', id).
                    addClass('item_label'+index).
                    addClass('col-sm-3 control-label').
                    toggleClass('mandatory', mandatory).
                    text(label)
                fieldDiv.append(label)

                var ffDiv = $('<div class="col-sm-9" />')

                var factory = self['makeOptionField_'+type]
                var field = factory(mandatory, typedata)

                field.attr('id', id).
                    addClass('item_field'+index).
                    addClass('entry form-control')
                ffDiv.append(field)
                fieldDiv.append(ffDiv)

                if (description) {
                    //label.addClass('has-description')
                    field.tooltip({
                        placement: 'auto bottom',
                        title: description,
                        trigger: 'hover focus'
                    })
                }
            });

            self.toggleAddButton.apply(optionsForm)

            var expl = $('<div class="mandatoryExplanation">').
                toggleClass('invisible', !hasMandatory).
		html(_('Fields marked with <span class="mandatory" /> are mandatory.</span>'))
	    detailsDiv.append(expl)
            return shelfItem
        },

        _setupProductListCb: function(dom, data) {
            var categories = {'': {}}
            jQuery.each(data, function(toid, toidata) {
                if (!toidata.tags.length) {
                    categories[''][toid] = toidata
                }
                jQuery.each(toidata.tags, function(_, tag) {
                    if (!categories[tag]) {
                        categories[tag] = {}
                    }
                    categories[tag][toid] = toidata
                })
                    });

            dom = $(dom || '.productlist')
            var catCtr = 0

            jQuery.each(categories, function(name, products) {
                var category = $('<div class="category">')
                var heading
                var productsContainer
                var top = !name

                if (top) {
                    productsContainer = category
                } else {
                    var detailsId = 'category_details_' + catCtr
                    heading = $(
                        '<div class="collapsed category-heading" '+
                            'data-toggle="collapse" data-target="#'+detailsId+'" />')
                    var details = $('<div class="collapse category-products" />').
                        attr('id', detailsId)
                    heading.append($('<span class="category-name" />').text(name),
                                   $('<span class="product-count" />'))
                    category.append(heading, details)
                    productsContainer = details
                }
                dom.append(category)

                category.addClass(name ? 'sublevel' : 'toplevel')

                jQuery.each(products, function(toid, toidata) {
                    var shelfItem = self.setupProduct(toidata, catCtr)
                    productsContainer.append(shelfItem)
                });

                if (heading) {
		    var count = productsContainer.find('.simpleCart_shelfItem').length
		    heading.find('.product-count').text(count + ' ' +
							ngettext('product', 'products', count))
		}

                productsContainer.find('.simpleCart_shelfItem').sort(function(p1, p2) {
                    var n1 = $(p1).find('.item_name').text()
                    var n2 = $(p2).find('.item_name').text()
                    return n1.localeCompare(n2, 'sv')
                }).appendTo(productsContainer)

                catCtr += 1
            });

            dom.find('.category').sort(function(c1, c2) {
                var n1 = $(c1).find('.category-name').text()
                var n2 = $(c2).find('.category-name').text()
                return n1.localeCompare(n2, 'sv')
            }).appendTo(dom)


            simpleCart.update()
        },

        setupProductList: function(dom) {
            var request = self.ajax('Product')
            request.done(function(data) { self._setupProductListCb(dom, data) })
        },

        setupCheckoutForm: function(dom) {
            dom = $(dom || '.addressForm')
            var form = $('<form role="form" class="form-horizontal" />')
            dom.append(form)
	    form.append(
		$('<div class="form-group"/>').append(
		    $('<label for="buyerName" class="col-xs-3 control-label mandatory"/>').text(_('Name')),
		    $('<div class="col-xs-9 inputwrap"/>').append(
			$('<input required name="buyerName" required type="text" class="form-control entry" />')
		    )
		),
		$('<div class="form-group"/>').append(
		    $('<label for="buyerAddress" class="col-xs-3 control-label mandatory"/>').text(_('Address')),
		    $('<div class="col-xs-9 inputwrap"/>').append(
			$('<textarea required rows="5" name="buyerAddress" class="form-control entry" />')
		    )
		),
		$('<div class="form-group"/>').append(
		    $('<label for="buyerEmail" class="col-xs-3 control-label mandatory"/>').text(_('E-mail')),
		    $('<div class="col-xs-9 inputwrap"/>').append(
			$('<input type="email" name="buyerEmail" required class="form-control entry" />')
		    )
		),
		$('<div class="form-group"/>').append(
		    $('<label for="buyerPhone" class="col-xs-3 control-label"/>').text(_('Phone')),
		    $('<div class="col-xs-9 inputwrap"/>').append(
			$('<input type="tel" name="buyerPhone" class="form-control" />')
		    )
		),
		$('<div class="form-group"/>').append(
		    $('<label for="buyerAnnotation" class="col-xs-3 control-label"/>').text(_('Note')),
		    $('<div class="col-xs-9 inputwrap"/>').append(
			$('<textarea rows="5" name="buyerAnnotation" class="form-control"/>').
			    attr('placeholder', _('Note on invoice'))
		    )
		)
	    )
            dom.append($('<div class="mandatoryExplanation">').
		       html(_('Fields marked with <span class="mandatory" /> are mandatory.</span>')))
	    dom.append($('<p class="pul"/>').text(
		_('By placing an order, you permit us to store the personal details you entered and use it for administrative purposes. This website uses cookies to store information about your order.')))
            var button = $('<button disabled/>').text(_('Order'))
            dom.append(button)
	    var disabledTitle = _('Name and address are mandatory.')
            button.attr('title', disabledTitle)
            button.bind('click', function() {
                self._toggleButton(form, button, _('Purchase already being processed...'), true)
            })
            button.bind('click', self.purchase)
            button.addClass('btn btn-primary')

	    form.find('[required]').addValidator('required')
            form.find('input[type="email"]').addValidator('email')
	    form.find('[required]').bind('change keyup', function(event) {
                var disabled = simpleCart.find().length == 0
                self._toggleButton(form, button, disabledTitle, disabled)
            })
            simpleCart.bind('update', function() {
                var disabled = simpleCart.find().length == 0
                self._toggleButton(form, button, disabledTitle, disabled)
            })
        },

        setup: function() {
	    $(self.root).append(
		$('<div id="webshopcontents" class="col-sm-12"/>').append(
		    $('<div id="productcolumn" class="col-sm-7"/>').append(
			$('<h2 />').text(_('Products')),
			$('<div class="productlist col-xs-12 panel-group" />')
		    ),
		    $('<div class="col-sm-5" id="shoppingcart"/>').append(
			$('<div id="cartheaderwrap" class="accordion-toggle collapsed" '+
			  '     data-toggle="collapse" data-target="#cartcontents"/>').append(
			      $('<span id="cartheader"/>').text(_('Shopping cart')).append(
				  $('<div id="cartsummary"/>').append(
				      $('<span class="simpleCart_quantity" />'),
				      ' ' + _('items') + ' ',
				      $('<div class="simpleCart_total" />')
				  )
			      )
			  ),
			$('<div id="cartheaderpad"/>'),
			$('<div id="cartcontents" class="panel-collapse collapse"/>').append(
			    $('<div class="simpleCart_items"/>'),
			    $('<div class="clearfix"/>').append(
				$('<div class="cart-total pull-right"/>').text(_('Amount to pay')).append(
				    $('<span class="total simpleCart_total" />')
				)
			    ),
			    $('<div class="addressForm" />')
			)
		    )
		)
	    )
            self.setupProductList()
            self.setupCheckoutForm()
            /*self.fixDimensions()*/
            /*$(window).resize(self.fixDimensions)*/
            $('#cartcontents').on('shown.bs.collapse', function() {
                $('body').addClass('cartshown')
                var dom = $('#shoppingcart')
                var offset = $(window).height() - dom.height()
                $('#cartheaderwrap').css({top: offset})
            })
            $('#cartcontents').on('hidden.bs.collapse', function() {
                $('body').removeClass('cartshown')
                $('#cartheaderwrap').css({top: 'auto'})
            })
        },

        fixDimensions: function() {
            var dom = $(self.root).find('#webshopcontents')
            var offset = dom.offset().top
            var height
            var cart_y = $(self.root).find('#shoppingcart').offset().top
            if (cart_y > offset) {
                height = cart_y
            } else {
                height = $(window).height()
            }

            dom.height(height - offset)
        },

        getCheckoutFormData: function() {
            return $('.addressForm form').serializeArray()
        },

        checkout: {
            type: 'custom',
            fn: function() {}
        },

        purchase: function() {
            var data = { items: [] }
            $.each(self.getCheckoutFormData(), function(i, item) {
                data[item.name] = [item.value]
            })

            self.simpleCart.each(function(item, index) {
                var itemData = {
                    product: item.get('product'),
                    quantity: item.get('quantity'),
                    options: []
                }
                var fieldcount = parseInt(item.get('fieldcount'))
                for (var i=0; i<fieldcount; i++) {
                    var fieldData = item.get('field' + i) || ''
                    itemData.options.push(fieldData)
                }
                data.items.push(itemData)
            });
            var request = self.ajax('purchase', {
                type: 'post',
                contentType: 'application/json',
                data: { data: [data] }
            })
            request.done(function(data) {
                var toid = data.purchase
                var invoice = data.invoiceUrl
                self.simpleCart.empty()
                self.window.location = invoice
            })
            request.error(function(response) {
                var json = response.responseJSON
                if (json.code == 'out of stock') {
                    var product = json.product
                    $('#shelfItemDetails_' + product + ' .item_stock').text(json.remaining)
                    $.each(simpleCart.find({product: product}), function(index, item) {
                        item.set('stock', json.remaining)
                    });
                    simpleCart.update()
                }
                // xxx unknown errors...
            })
        }
    }

    jQuery.extend(self, conf)
    if (self.baseurl[self.baseurl.length - 1] != '/') {
        self.baseurl += '/'
    }

    self.setup()
    simpleCart({
        checkout: self.checkout,
        cartStyle: 'div',
        storageNS: 'simplecart_' + self.org,
        cartColumns : [
	    { attr: "name", label: _("Item"), className: "cart-column pull-left" },
            { label: false, className: "cart-column pull-right item-remove",
              view: function(item, column) {
                  return '<button type="button" class="simpleCart_remove close">&times;</button>'
              }
            },
	    { attr: "total", label: _("Total"), view: 'currency', className: "cart-column pull-right" },
	    { attr: "quantity", label: _("Quantity"), className: "cart-column pull-right",
              view: function(item, column) {
                  return  "<input type='number' value='" + item.get(column.attr) +
                      "' class='simpleCart_input form-control input-sm'/>";
              }
            },
	    { attr: "price", label: _("Price"), view: 'currency', className: "cart-column pull-right" },
        ]
    })
    simpleCart.currency(self.currency)
    self.simpleCart = simpleCart

    simpleCart.bind('update' , function() {
	$('.simpleCart_shelfItem .item_add').each(function(index, button) {
            self.toggleAddButton.apply(button)
        })
    })

    simpleCart.bind('rowCreated', function(row, item, y, TR, TD, cart_container) {
        /* fix up row */
        var fixeditems = row.el.children().slice(1)
        row.el.append($('<div class="pull-right" />').append(fixeditems))

        if (!item.available(item.quantity())) {
            var quantity = $(row.el).find('.item-quantity')
            quantity.addClass('has-error')

	    quantity.popover({content: _('You have attempted to order too many items.'),
                              container: '.simpleCart_items',
                              placement: 'bottom'})
            quantity.popover('show')
        }


        var oddeven = row.el.hasClass('odd') ? 'odd' : 'even'

        var hasOptions = false
        var fieldcount = parseInt(item.get('fieldcount'))
        var optionsRow = simpleCart.$create(TR).addClass('itemOptions clearfix')
        var optionsCell = simpleCart.$create(TD)
        optionsRow.append(optionsCell)
        optionsRow.append(simpleCart.$create(TD))
        var table = simpleCart.$create('table')
        optionsCell.append(table)
        optionsRow.addClass(oddeven)
        for(var i=0; i<fieldcount; i++) {
            var field = item.get('field'+i)
            if (field) {
                var row = simpleCart.$create('tr')
                var cell = simpleCart.$create('td').html(item.get('label'+i)+':')
                row.append(cell)
                var cell = simpleCart.$create('td').addClass('itemOptionValue').html(field)
                row.append(cell)
                table.append(row)
                hasOptions = true
            }
        }

        if (hasOptions) {
            cart_container.append(optionsRow)
        }
    })

    simpleCart.init()
    return self
}

// taken from https://gist.github.com/ShirtlessKirk/2134376
function luhnChk(luhn) {
    luhn = luhn.replace(/[^\d]/, '')

    var len = luhn.length,
        mul = 0,
        prodArr = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]],
        sum = 0;

    while (len--) {
        sum += prodArr[mul][parseInt(luhn.charAt(len), 10)];
        mul ^= 1;
    }

    return sum % 10 === 0 && sum > 0;
};
