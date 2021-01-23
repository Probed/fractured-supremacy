var fs_UserLogin = new Class({
    Implements: [Events, Options],
    cont: Class.empty,
    options: {

    },
    initialize: function (options) {
	this.setOptions(options);

	this.cont = new Element('div', {
	    'class': 'fs_User-login'
	});
	this.cont.append(new Element('h1', {
	    html: CONFIG.title
	}));

	this.tabs = new fs_Tabs();
	this.tabs.add({label: "Login"}, this._loginForm());
	this.tabs.add({label: "Create"}, this._createForm());
	this.tabs.add({label: "Reset"}, this._resetForm());
	this.tabs.add({label: "Verify"}, this._verifyForm());
	this.tabs.add({label: "Help"}, this._helpPanel());
	this.tabs.activate(0);

	this.win = new fs_Window({
	    canClose: false,
	    title: "",
	    body: this.tabs.toElement()
	});
	this.cont.adopt(this.win.toElement());

    },
    toElement: function () {
	return this.cont;
    },
    open: function () {
	this.win.open();
    },
    _loginForm: function () {
	var form = new fs_Form({
	    action: 'login',
	    onSuccess: function (responseJSON) {
		location.href = CONFIG["root_url"];
	    }
	});
	form.addElement(new Element('h1', {
	    'class': 'title-wrapper'
	})).adopt(new Element('span', {
	    html: 'Login'
	}));

	form.addCol({
	    "class": "half first input-wrapper"
	}).adopt(form.input({
	    type: 'email',
	    name: 'email',
	    placeholder: 'Email Address',
	    events: {

	    }
	}));

	form.addCol({
	    "class": "half last input-wrapper"
	}).adopt(form.input({
	    type: 'password',
	    name: 'password',
	    placeholder: 'Password',
	    events: {

	    }
	}));

	form.addCol({
	    "class": "first last input-submit"
	}).adopt(new Element('a', {
	    'class': 'button-login submit',
	    'href': 'javascript:;',
	    'html': 'Login',
	    events: {
		'click': function (e) {
		    form.submit();
		}.bind(this)
	    }
	}));

	form.addCol({
	    "class": "half first"
	}).adopt(new Element('a', {
	    'class': 'button-create',
	    'href': 'javascript:;',
	    'html': 'Create',
	    events: {
		'click': function (e) {
		    this.tabs.activate(1)
		}.bind(this)
	    }
	}));

	form.addCol({
	    "class": "half last"
	}).adopt(new Element('a', {
	    'class': 'button-reset',
	    'href': 'javascript:;',
	    'html': 'Reset',
	    events: {
		'click': function (e) {
		    this.tabs.activate(2)
		}.bind(this)
	    }
	}));

	form.addElement(new Element('div', {
	    'class': 'sep-wrapper'
	})).adopt(new Element('span', {
	    html: 'OR'
	}));

	form.addCol({
	    "class": "input-facebook first last"
	}).adopt(new Element('a', {
	    'class': 'facebook-login',
	    'href': this.options.fb,
	    'html': 'Login with Facebook',
	    events: {
		'click': function (e) {

		}
	    }
	}));

//	form.addElement((new Element('div', {
//	    'class': 'error'
//	})).adopt(new Element('p',{
//	    html : this.options.fb_error
//	})));

	return form;
    },
    _createForm: function () {
	var form = new fs_Form({
	    action: 'create',
	    onSuccess: function (responseJSON) {

	    }
	});

	form.addElement(new Element('h1', {
	    'class': 'title-wrapper'
	})).adopt(new Element('span', {
	    html: 'Create'
	}));

	form.addCol({
	    "class": "last first input-wrapper"
	}).adopt(form.input({
	    type: 'email',
	    name: 'email',
	    placeholder: 'Email Address',
	    events: {

	    }
	}));

	form.addCol({
	    "class": "last first input-wrapper"
	}).adopt(form.input({
	    type: 'password',
	    name: 'password',
	    placeholder: 'Password',
	    events: {

	    }
	}));

	form.addCol({
	    "class": "last first input-wrapper"
	}).adopt(form.input({
	    type: 'password',
	    name: 'password-again',
	    placeholder: 'Re-type Password',
	    events: {

	    }
	}));
	form.addCol({
	    "class": "first last input-submit"
	}).adopt(new Element('a', {
	    'class': 'button-create submit',
	    'href': 'javascript:;',
	    'html': 'Create',
	    events: {
		'click': function (e) {
		    form.submit();
		}
	    }
	}));

	return form;
    },
    _resetForm: function () {
	var form = new fs_Form({
	    action: 'req_reset',
	    onSuccess: function (responseJSON) {

	    }
	});

	form.addElement(new Element('h1', {
	    'class': 'title-wrapper'
	})).adopt(new Element('span', {
	    html: 'Reset your Password'
	}));

	form.addCol({
	    "class": "last first input-wrapper"
	}).adopt(form.input({
	    type: 'email',
	    name: 'email',
	    placeholder: 'Email Address',
	    events: {

	    }
	}));

	form.addCol({
	    "class": "first last input-submit"
	}).adopt(new Element('a', {
	    'class': 'button-reset submit',
	    'href': 'javascript:;',
	    'html': 'Send Reset Link',
	    events: {
		'click': function (e) {
		    form.submit();
		}
	    }
	}));

	return form;
    },
    _verifyForm: function () {
	var form = new fs_Form({
	    action: 'verify',
	    onSuccess: function (responseJSON) {
		location.href = CONFIG["root_url"];
	    }
	});

	form.addElement(new Element('h1', {
	    'class': 'title-wrapper'
	})).adopt(new Element('span', {
	    html: 'Verify your Account'
	}));

	form.addCol({
	    "class": "last first input-wrapper"
	}).adopt(form.input({
	    type: 'text',
	    name: 'verify_key',
	    placeholder: 'Verification Key',
	    events: {

	    }
	}));

	form.addCol({
	    "class": "first last input-submit"
	}).adopt(new Element('a', {
	    'class': 'button-reset submit',
	    'href': 'javascript:;',
	    'html': 'Process Verification',
	    events: {
		'click': function (e) {
		    form.submit();
		}
	    }
	}));

	return form;
    },
    _helpPanel: function () {
	var form = new fs_Form({
	    action: 'install',
	    onSuccess: function (responseJSON) {
		location.href = CONFIG["root_url"];
	    }
	});

	form.addElement(new Element('h1', {
	    'class': 'title-wrapper'
	})).adopt(new Element('span', {
	    html: 'Help'
	}));

	form.addCol({
	    "class": "first last input-submit"
	}).adopt(new Element('a', {
	    'class': 'button-install submit',
	    'href': 'javascript:;',
	    'html': 'Re-Install Game',
	    events: {
		'click': function (e) {
		    form.submit();
		}
	    }
	}));

	return form;
    }
});