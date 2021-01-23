var fs_Window = new Class({
    Implements: [Events, Options],
    cont: Class.empty,
    options: {
	parent: null,
	title: null,
	buttons: null, //array of elements to be placed in the bottom bar
	canClose: false,
	beforeClose: null, //function called before window is closed (return false to cancel window close)
	close: null, //function called when window is closed

    },
    initialize: function (options) {
	this.setOptions(options);

	this.mainTable = new HtmlTable({
	    zebra: false,
	    properties: {
		class: 'main-table'
	    },
	    headers: [
		{
		    properties: {
			class: 'top drag-handle'
		    },
		    content: this._buildTitle()
		}

	    ],
	    rows: this._buildBody(),
	    footers: [
		{
		    properties: {
			class: 'bot drag-handle',
		    },
		    content: this._buildFooter()
		}
	    ]

	});
	this.mainTable = $(this.mainTable);
	this.cont = new Element('div', {
	    'id': this.options.id,
	    class: 'fs_Window ' + (this.options.class || '') + (this.options.title ? ' has-title' : '')
	});
	this.cont.adopt(this.mainTable);

	var drag = new Drag.Move(this.cont, {
	    container: document.body,
	    handle: $$('.drag-handle', this.cont)
	});

	if (this.options.parent) {
	    this.options.parent.adopt(this.toElement());
	} else {
	    this.options.parent = $$('body');
	    this.options.parent.adopt(this.toElement());
	}
	return this;
    },
    toElement: function () {
	return this.cont;
    },

    _buildTitle: function () {
	this.titleTable = new HtmlTable({
	    zebra: false,
	    properties: {
		class: 'title-table'
	    },
	    headers: [
		{
		    content: this.options.title || "",
		    properties: {
			class: 'title'
		    }
		},
		{
		    content: new Element('div', {
			class: 'close',
			html: fs_Icon('no'),
			'events': {
			    'click': function () {
				this.close();
			    }.bind(this)
			}
		    })
		}
	    ]
	});
	return this.titleTable.toElement();
    },
    _buildBody: function () {
	var body = [
	    [
		{
		    properties: {
			class: 'mid'
		    },
		    content: this.options.body = (typeOf(this.options.body) == 'function' ? this.options.body() : this.options.body)

		}
	    ]
	];
	return body;
    },
    _buildFooter: function () {
	var buttons = [];
	if (this.options.buttons) {
	    each(this.options.buttons, function (butt) {
		buttons.push({
		    content: butt.toElement ? butt.toElement() : butt
		});
	    });
	}
	this.footerTable = new HtmlTable({
	    zebra: false,
	    properties: {
		class: 'footer-table'
	    },
	    rows: [buttons]
	});
	return this.footerTable.toElement();
    },

    setTitle: function (title) {
	$$('.top', this.cont).empty().adopt(title);
    },
    setBody: function (body) {
	$$('.mid', this.cont).empty().adopt(body);
    },
    setButtons: function (buttons) {
	$$('.bot', this.cont).empty().adopt(buttons);
    },
    open: function () {
	activate(this.cont);
	setTimeout(function () {
	    this.center();
	}.bind(this), 150);
	this.center();
	return this;
    },
    close: function () {
	var cancel = false;
	if (typeof this.options.beforeClose == 'function') {
	    cancel = !this.options.beforeClose();
	}
	if (!cancel) {
	    if (typeof this.options.close == 'function') {
		this.options.close();
	    }
	    deactivate(this.cont);
	}
	this.cont.dispose();
    },
    center: function () {
	var top, left;
	top = (window.getHeight() / 2) - (this.toElement().getHeight() / 2) + (window.getScrollTop());
	left = (window.getWidth() / 2) - (this.toElement().getWidth() / 2) + (window.getScrollLeft());
	if (top < 90) {
	    top = 90;
	}
	if (left < 140) {
	    left = 140;
	}
	this.toElement().style.top = top + 'px';
	this.toElement().style.left = left + 'px';
	return this;
    }
});