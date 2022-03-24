var fs_LayoutBuilder = new Class({
    Implements: [Events, Options],
    builder: null,
    cont: null,
    layout: null,
    vars: null,
    model: null,
    layoutIndex: -1,
    layoutWin: null,
    colsInput: null,
    rowsInput: null,
    rows: 0,
    cols: 0,
    editArr: [],
    platformTypes: ['e', 'p', 's', 'd', 'h'],

    initialize: function (builder, model, callback) {

	this.builder = builder;
	this.modelOriginal = Array.clone(model);
	this.model = Array.clone(model);

	this.callback = callback;

	if (typeOf(this.model) == 'array') {
	    each(this.model, function (obj, index) {
		if (Object.keys(obj)[0] == 'layout') {
		    this.layoutIndex = index;
		}
	    }.bind(this));
	}

	this.cont = div({
	    class: 'layout-editor'
	});

	this.editArr = [['e']]; //holds the values of the editor array
	this.rows = 1;
	this.cols = 1;

	this.rowsInput = new Element('input', {
	    type: 'number',
	    events: {
		keyup: function () {
		    if (this.rowsInput.value < 1) {
			return;
		    }
		    this.rows = this.rowsInput.value;
		    this.refresh();
		}.bind(this),
		click: function () {
		    if (this.rowsInput.value < 1) {
			return;
		    }
		    this.rows = this.rowsInput.value;
		    this.refresh();
		}.bind(this)
	    }
	});
	this.colsInput = new Element('input', {
	    'type': 'number',
	    events: {
		keyup: function () {
		    if (this.colsInput.value < 1) {
			return;
		    }
		    this.cols = this.colsInput.value;
		    this.refresh();
		}.bind(this),
		click: function () {
		    if (this.colsInput.value < 1) {
			return;
		    }
		    this.cols = this.colsInput.value;
		    this.refresh();
		}.bind(this)

	    }
	});
	this.nameInput = new Element('input', {
	    type: 'text',
	    events: {
		keyup: function () {
		    if (typeOf(this.model) == 'array') {
			this.model = [{
				layout: this.nameInput.value,
				value: [['e']]
			    }];
			this.layoutIndex = 0;
		    } else {
			this.model[this.layoutIndex].layout = this.nameInput.value;
		    }
		}.bind(this)
	    }
	});

	this.cont.adopt((new HtmlTable({
	    properties: {
		align: 'center'
	    },
	    rows: [
		[
		    {
			content: [new Element('span', {html: 'Name: '}), this.nameInput],
			properties: {
			    colspan: 2
			}
		    }
		],
		["Rows", "Cols"],
		[this.rowsInput, this.colsInput]
	    ]
	})).toElement());

	if (this.model && this.model[this.layoutIndex] && typeOf(this.model[this.layoutIndex]['value']) == 'array') {
	    this.nameInput.value = this.model[this.layoutIndex]['layout']
	    this.model[this.layoutIndex]['value'].each(function (row, idx) {
		this.editArr[idx] = [];
		row.each(function (cell, index) {
		    this.editArr[idx][index] = cell;
		    if (index > this.cols) {
			this.cols = index;
		    }
		}.bind(this));
		if (idx > this.rows) {
		    this.rows = idx;
		}
	    }.bind(this));
	}
	this.rowsInput.value = this.rows;
	this.colsInput.value = this.cols;

	this.layout = div({
	    class: 'edit-layout'
	});
	this.cont.adopt(this.layout);

	this.layoutWin = new fs_Window({
	    title: "Layout Editor",
	    body: this.cont,
	    buttons: [
		cancelButton({}, function () {
		    this.layoutWin.close();
		}.bind(this)),
		(new fs_Button({
		    html: 'Fill',
		    icon: 'layout',
		    click: function () {
			getUserSelect({
			    title: 'Platform Type',
			    label: 'Type',
			    values: this.builder.platformTypes
			}, function (value) {
			    for (var idx = 0; idx <= this.rows; idx++) {
				for (var idy = 0; idy <= this.cols; idy++) {
				    this.editArr[idx][idy] = value;
				}
			    }
			    this.refresh();
			}.bind(this));
		    }.bind(this)
		})).toElement(),
		okButton({html: 'Apply'}, function () {
		    var ret = [];
		    for (var idx = 0; idx <= this.rows; idx++) {
			ret[idx] = [];
			for (var idy = 0; idy <= this.cols; idy++) {
			    ret[idx][idy] = this.editArr[idx][idy];
			}
		    }
		    this.model[this.layoutIndex].value = this.editArr = ret;
		    this.callback && this.callback(this.model);
		}.bind(this)
			),
		okButton({html: 'Save'}, function () {
		    var ret = [];
		    for (var idx = 0; idx <= this.rows; idx++) {
			ret[idx] = [];
			for (var idy = 0; idy <= this.cols; idy++) {
			    ret[idx][idy] = this.editArr[idx][idy];
			}
		    }
		    this.model[this.layoutIndex].value = this.editArr = ret;
		    this.layoutWin.close(this.callback && this.callback(this.model));
		}.bind(this))
	    ]
	});
	this.layoutWin.open();
	this.refresh();

	this.vars = div({
	    class: 'edit-layout-vars'
	});
	this.cont.adopt(this.vars);
	this.refreshVarVals();

    },
    toElement: function () {
	return this.cont;
    },
    refresh: function () {

	this.layout.empty();

	var r = div({
	    class: 'layout-row layout-fill-row'
	});
	r.adopt(div({
	    class: 'layout-fill',
	    html: 'diag',
	    events: {
		click: function (e) {
		    var context = {};
		    this.builder.platformTypes.each(function (val, pidx) {
			context[fs_Icon('plus') + ' ' + val] = function () {
			    for (var idx = 0; idx <= this.rows; idx++) {
				this.editArr[idx][idx] = val;
			    }
			    this.refresh();
			}.bind(this);
		    }.bind(this));
		    openContextMenu(e, context);
		    e.stop();
		}.bind(this)
	    }
	}));
	for (var index = 0; index <= this.cols; index++) {
	    (function (index) {
		r.adopt(div({
		    class: 'layout-fill',
		    html: (index),
		    events: {
			click: function (e) {
			    var context = {};
			    this.builder.platformTypes.each(function (val, pidx) {
				context[fs_Icon('plus') + ' ' + val] = function () {
				    for (var idx = 0; idx <= this.rows; idx++) {
					this.editArr[idx][index] = val;
				    }
				    this.refresh();
				}.bind(this);
			    }.bind(this));
			    openContextMenu(e, context);
			    e.stop();
			}.bind(this)
		    }
		}));
	    }.bind(this))(index);
	}
	r.adopt(div({
	    class: 'layout-fill',
	    html: 'diag',
	    events: {
		click: function (e) {
		    var context = {};
		    this.builder.platformTypes.each(function (val, pidx) {
			context[fs_Icon('plus') + ' ' + val] = function () {
			    var cls = 0;
			    for (var idx = this.rows; idx >= 0; idx--) {
				this.editArr[idx][cls++] = val;
			    }
			    this.refresh();
			}.bind(this);
		    }.bind(this));
		    openContextMenu(e, context);
		    e.stop();
		}.bind(this)
	    }
	}));
	this.layout.adopt(r);

	for (var idx = 0; idx <= this.rows; idx++) {
	    (function (idx) {
		var idx = idx;
		var r = div({
		    class: 'layout-row'
		});
		this.layout.adopt(r);
		r.adopt(div({
		    class: 'layout-cell layout-fill',
		    html: (idx),
		    events: {
			click: function (e) {
			    var context = {};
			    this.builder.platformTypes.each(function (val, pidx) {
				context[fs_Icon('plus') + ' ' + val] = function () {
				    for (var index = 0; index <= this.cols; index++) {
					this.editArr[idx][index] = val;
				    }
				    this.refresh();
				}.bind(this);
			    }.bind(this));
			    openContextMenu(e, context);
			    e.stop();
			}.bind(this)
		    }
		}));
		for (var index = 0; index <= this.cols; index++) {
		    (function (index) {
			var cell = 'e';
			if (this.editArr[idx] && this.editArr[idx][index]) {
			    cell = this.editArr[idx][index];
			} else {
			    if (!this.editArr[idx]) {
				this.editArr[idx] = [];
				for (var i = 0; i <= this.cols; i++) {
				    this.editArr[idx][i] = 'e';
				}
			    }
			    if (!this.editArr[idx][index]) {
				this.editArr[idx][index] = 'e';
			    }
			}
			var c = div({
			    class: 'layout-cell layout-cell-' + cell,
			    html: cell,
			    'data-row': idx,
			    'data-col': index,
			    events: {
				click: function (e) {
				    var context = {};
				    this.builder.platformTypes.each(function (val, pidx) {
					context[fs_Icon('plus') + ' ' + val] = function () {
					    if (typeOf(this.editArr[idx]) != 'array') {
						this.editArr[idx] = [];
						for (var i = 0; i <= this.cols; i++) {
						    this.editArr[idx][i] = 'e';
						}
					    }
					    this.editArr[idx][index] = val;
					    this.refresh();
					}.bind(this);
				    }.bind(this));
				    openContextMenu(e, context);
				    e.stop();
				}.bind(this)
			    }
			});
			r.adopt(c);
		    }.bind(this))(index);
		}
		r.adopt(div({
		    class: 'layout-empty',
		    html: fs_Icon("no") + '',
		    events: {
			click: function (e) {
			    for (var index = 0; index <= this.cols; index++) {
				this.editArr[idx][index] = 'e';
			    }
			    this.refresh();
			}.bind(this)
		    }
		}));
	    }.bind(this))(idx);
	}
	var r = div({
	    class: 'layout-row layout-fill-row'
	});
	r.adopt(div({
	    class: 'layout-empty',
	    html: fs_Icon("no") + '',
	    events: {
		click: function (e) {
		    var cls = 0;
		    for (var idx = this.rows; idx >= 0; idx--) {
			this.editArr[idx][cls++] = 'e';
		    }
		    this.refresh();
		}.bind(this)
	    }
	}));
	for (var index = 0; index <= this.cols; index++) {
	    (function (index) {
		r.adopt(div({
		    class: 'layout-empty',
		    html: fs_Icon("no") + '',
		    events: {
			click: function (e) {
			    for (var idx = 0; idx <= this.rows; idx++) {
				this.editArr[idx][index] = 'e';
			    }
			    this.refresh();
			}.bind(this)
		    }
		}));
	    }.bind(this))(index);
	}
	r.adopt(div({
	    class: 'layout-empty',
	    html: fs_Icon("no") + '',
	    events: {
		click: function (e) {
		    for (var idx = 0; idx <= this.rows; idx++) {
			this.editArr[idx][idx] = 'e';
		    }
		    this.refresh();
		}.bind(this)
	    }
	}));
	this.layout.adopt(r);

    },

    refreshVarVals: function () {
	this.vars.empty();
	var tbl = new HtmlTable({
	    properties: {
		align: 'center'
	    }
	});
	this.vars.adopt(tbl);
	if (typeOf(this.model) == 'array') {
	    this.model.each(function (obj, index) {
		if (Object.keys(obj)[0] != 'layout') {
		    var row = [];
		    Object.each(obj, function (val, key) {
			row.push({
			    content: '<strong>' + key + '</strong>'
			});
			row.push({
			    content: val
			});
		    }.bind(this));
		    row.push({
			content: [editButton({}, function () {
			    this.builder.openOptionEditor(Object.keys(obj)[0], obj, function (newOpt) {
				if (newOpt) {
				    this.model[index] = newOpt;
				    this.refreshVarVals();
				}
			    }.bind(this));
			}.bind(this), "Edit")]
		    });
		    tbl.push(row);
		}
	    }.bind(this));
	}

	tbl.push([{
		content: [(addButton({}, function () {
			this.builder.openOptionEditor('var', {}, function (newOpt) {
			    if (newOpt) {
				this.model.push(newOpt);
				this.refreshVarVals();
			    }
			}.bind(this));
		    }.bind(this), "Add Var")),
		    (addButton({}, function () {
			this.builder.openOptionEditor('css', {}, function (newOpt) {
			    if (newOpt) {
				this.model.push(newOpt);
				this.refreshVarVals();
			    }
			}.bind(this));
		    }.bind(this), "Add CSS")),
		],
		properties: {
		    colspan: 5
		}
	    }]);
    }
});