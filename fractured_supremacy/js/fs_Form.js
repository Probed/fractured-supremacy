var fs_Form = new Class({
    Implements: [Events, Options],
    cont: Class.empty,
    options: {

    },
    initialize: function (options) {
	this.setOptions(options);

	this.cont = new Element('form', {
	    'class': 'fs_Form',
	    'events': {
		submit: function (e) {
		    this._send();
		    e.preventDefault();
		}.bind(this)
	    }
	});
	this.addElement(new Element('input', {
	    type: 'hidden',
	    name: 'action',
	    value: this.options.action
	}));

    },
    toElement: function () {
	return this.cont;
    },
    addElement: function (elm) {
	this.cont.adopt(elm);
	return elm;
    },
    addCol: function (col) {
	var c = new Element('div', {
	    'class': 'col ' + col.class
	});
	this.cont.adopt(c);
	return c;
    },
    input: function (opts) {
	var i = new Element('input', opts);
	return i;
    },
    submit: function () {
	this._send();
    },
    _send: function () {
	new Request.JSON({
	    url: CONFIG["ajax_url"],
	    onSuccess: function (resp) {
		debug.update(resp);
		if (!resp) {
		    error({
			title: "Submission Failed",
			body: "Empty Response"
		    });
		} else if (resp.success) {
		    this.options.onSuccess && this.options.onSuccess(resp);
		} else if (resp.success == false) {
		    debug.open();
		    error({
			title: "Submission Error",
			body: (function () {
			    var ret = new Element('div', {
				'class': 'error'
			    });
			    resp.validate.errors.each(function (err) {
				ret.adopt(new Element('div', {
				    html: err.title + ': ' + err.value
				}));
			    });
			    return ret;
			})()
		    });
		}
	    }.bind(this),
	    onFailure: function (xhr) {

	    }
	}).post(this.toElement());
    }

});