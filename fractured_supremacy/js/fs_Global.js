if (window.location.hash && window.location.hash == '#_=_') {
    window.location.hash = '';
}

var activate = function (elms) {
    elms = Array.convert(elms);
    elms.each(function (elm) {
	$(elm).addClass('active');
    });
};

var deactivate = function (elms) {
    elms = Array.convert(elms);
    elms.each(function (elm) {
	$(elm).removeClass('active');
    });
};
var errWin = null;
var error = function (options) {
    if (!errWin) {
	errWin = new fs_Window({
	    canClose: true,
	    "class": "error"
	});
	$(document.body).adopt(errWin);
    }
    errWin.setTitle(options.title);
    errWin.setBody(options.body);
    errWin.open();
};

var getOption = function (type, optionGroup, optionItem, key) {
    var ret = null;
    if (type && type.options && type.options[optionGroup]) {
	type.options[optionGroup].each(function (item, index) {
	    Object.each(item, function (v, k) {
		if ((k == optionItem && v == key) || k == key) {
		    ret = item;
		}
	    });
	});
    }
    return ret;
};

var fs_Icon = function (name) {
    var i = '<i class="dashicons-before dashicons-' + name + '"></i>'
    return i;
}

var addRule = (function (style) {
    var sheet = document.head.appendChild(style).sheet;
    return function (selector, css) {
	var propText = typeof css === "string" ? css : Object.keys(css).map(function (p) {
	    return p + ":" + (p === "content" ? "'" + css[p] + "'" : css[p]);
	}).join(";");
	sheet.insertRule(selector + "{" + propText + "}", sheet.cssRules.length);
    };
})(document.createElement("style"));

var okButton = function (options = {}, callback, text = "Ok") {
    return new fs_Button(Object.merge({
	html: 'Ok',
	icon: 'yes',
	events: {
	    click: function (e) {
		callback && callback();
		e.stopPropagation();
	    }
	}
    }, options));
};

var addButton = function (options = {}, callback, text = "Ok") {
    return new fs_Button(Object.merge({
	html: 'Add',
	icon: 'plus',
	events: {
	    click: function (e) {
		callback && callback();
		e.stopPropagation();
	    }
	}
    }, options));
};

var cancelButton = function (options = {}, callback, text = "Ok") {
    return new fs_Button(Object.merge({
	html: 'Cancel',
	icon: 'no',
	events: {
	    click: function (e) {
		callback && callback();
		e.stopPropagation();
	    }
	}
    }, options));
};

var deleteButton = function (options = {}, callback, text = "Ok") {
    return new fs_Button(Object.merge({
	html: 'Delete',
	icon: 'no',
	events: {
	    click: function (e) {
		callback && callback();
		e.stopPropagation();
	    }
	}
    }, options));
};

var editButton = function (options = {}, callback, text = "Ok") {
    return new fs_Button(Object.merge({
	html: 'Edit',
	icon: 'edit',
	events: {
	    click: function (e) {
		callback && callback();
		e.stopPropagation();
	    }
	}
    }, options));
};


var sortObj = function (obj, key) {
    var sorted = {};
    var keys = {};
    Object.each(obj, function (v, k) {
	keys[v[key]] = k;
    });
    var sortedkeys = Object.keys(keys).sort();
    sortedkeys.each(function (k, index) {
	sorted[keys[k]] = Object.clone(obj[keys[k]]);
    });
    return sorted;
}

var getUserString = function (options, callback) {
    var input = new Element('input', {
	type: 'text',
	value: options.value || ''
    });
    var ok;
    var win = new fs_Window({
	title: options.title,
	body: new HtmlTable({
	    properties: {
		width: '100%'
	    },
	    rows: [[options.label, input]]
	}).toElement(),
	buttons: [
	    (cancelButton({}, function () {
		win.close();
	    })),
	    (okButton({}, function () {
		win.close(callback(input.value));
	    }))
	]
    });
    win.toElement().addEvents({
	"keyup:keys(enter)": function (e) {
	    win.close(callback(input.value));
	},
	"keyup:keys(esc)": function (e) {
	    win.close();
	}
    });
    win.open();
    input.focus();
};


var getTypeHeirarchy = function (tableList) {
    var heir = {};
    Object.each(tableList, function (type, index) {
	if (index == 0) {
	    return;
	}
	if (typeOf(heir[type["type"]]) != 'object') {
	    heir[type["type"]] = {};
	}
	if (typeOf(heir[type["type"]][type["category"]]) != 'object') {
	    heir[type["type"]][type["category"]] = {};
	}
	if (typeOf(heir[type["type"]][type["category"]][type["subcat"]]) != 'object') {
	    heir[type["type"]][type["category"]][type["subcat"]] = {};
	}
	heir[type["type"]][type["category"]][type["subcat"]][index] = type;
    });
    return heir;
};

var getIDSelect = function (types, table, index, qty, callback) {
    var seltable = table;
    var selindex = index;
    var body = new HtmlTable({
	properties: {
	    width: '100%'
	}
    });
    var tableSelect;
    var idSelect;
    var qtyInput;
    var refresh = function () {
	body.empty();
	tableSelect = new Element('select', {
	    events: {
		change: function () {
		    seltable = tableSelect.getSelected()[0].value;
		    refresh();
		}
	    }
	});
	body.push(['Table', tableSelect]);
	Object.each(types, function (typelist, tbl) {
	    var opt;
	    tableSelect.adopt(opt = new Element('option', {
		value: tbl,
		html: tbl
	    }));
	    if (tbl == seltable) {
		opt.setProperty('selected', true);
	    }
	});
	if (seltable) {
	    idSelect = new Element('select', {
		events: {
		    change: function () {
			selindex = idSelect.getSelected()[0].value;
			//refresh();
		    }
		}
	    });
	    body.push([seltable, idSelect]);
	    Object.each(types[seltable], function (type, idx) {
		if (idx == 0) {
		    return;
		}
		var opt;
		idSelect.adopt(opt = new Element('option', {
		    value: idx,
		    html: type['name']
		}));
		if (idx == index) {
		    opt.setProperty('selected', true);
		}
	    });
	    qtyInput = new Element('input', {
		type: 'text',
		value: qty,
		events: {
		    'keyup': function () {
			qty = qtyInput.value;
		    }
		}
	    });
	    body.push(["Quantity", qtyInput]);
	}
    };
    refresh();

    var ok;
    var win = new fs_Window({
	title: "Select Type",
	body: body.toElement(),
	buttons: [
	    cancelButton({}, function () {
		win.close();
	    }),
	    (ok = okButton({}, function () {
		win.close(callback(seltable, selindex, qty));
	    }))
	]
    });
    win.toElement().addEvents({
	"keyup:keys(enter)": function (e) {
	    win.close(callback(seltable, selindex, qty));
	},
	"keyup:keys(esc)": function (e) {
	    win.close();
	}
    });
    win.open();
    if (idSelect) {
	idSelect.focus();
    }
};


var getOptSelect = function (availOpts, callback) {
    var selOpt;
    var body = new HtmlTable({
	properties: {
	    class: 'window-table',
	    width: '100%'
	}
    });
    var availOptsSelect;
    var optSelect;

    body.empty();
    availOptsSelect = new Element('select', {
	events: {
	    change: function () {
		selOpt = availOptsSelect.getSelected()[0].value;
	    }
	}
    });
    body.push(['Option', availOptsSelect]);
    availOptsSelect.adopt(new Element('option'));
    availOpts.each(function (opt, index) {
	var opt;
	availOptsSelect.adopt(opt = new Element('option', {
	    value: opt,
	    html: opt
	}));
    });


    var ok;
    var win = new fs_Window({
	title: "Select Option",
	body: body.toElement(),
	buttons: [
	    cancelButton({}, function () {
		win.close();
	    }),
	    ok = okButton({}, function () {
		win.close(callback(selOpt));
	    })
	]
    });
    win.toElement().addEvents({
	"keyup:keys(enter)": function (e) {
	    win.close(callback(selOpt));
	},
	"keyup:keys(esc)": function (e) {
	    win.close();
	}
    });
    win.open();
    if (optSelect) {
	optSelect.focus();
    }
};

var getOptMultipleSelect = function (availOpts, selected, callback) {
    var selOpts;
    var body = new HtmlTable({
	properties: {
	    class: 'window-table',
	    width: '100%'
	}
    });
    var availOptsSelect;
    var optSelect;

    body.empty();
    availOptsSelect = new Element('select', {
	multiple: true,
	size: Object.keys(availOpts).length,
	events: {
	    change: function () {
		selOpts = availOptsSelect.getSelected();
	    }
	}
    });
    body.push(['Options', availOptsSelect]);
    availOptsSelect.adopt(new Element('option'));
    each(availOpts, function (opts, table) {
	var opt;
	availOptsSelect.adopt(opt = new Element('option', {
	    value: table,
	    html: table
	}));
	if (selected && selected.indexOf(table) > -1) {
	    opt.setProperty('selected', true);
	}
    });

    var ok;
    var win = new fs_Window({
	title: "Select Option",
	body: body.toElement(),
	buttons: [
	    (cancelButton({}, function () {
		win.close();
	    })).toElement(),
	    (ok = okButton({}, function () {
		win.close(callback(selOpts));
	    })).toElement()
	]
    });
    win.toElement().addEvents({
	"keyup:keys(enter)": function (e) {
	    win.close(callback(selOpts));
	},
	"keyup:keys(esc)": function (e) {
	    win.close();
	}
    });
    win.open();
    if (optSelect) {
	optSelect.focus();
    }
};

var getOptTypeSelect = function (availOpts, table, callback) {
    var selOptType;
    var selOpt;
    var body = new HtmlTable({
	properties: {
	    class: 'window-table',
	    width: '100%'
	}
    });
    var availOptsSelect;
    var optSelect;
    var refresh = function () {
	body.empty();
	availOptsSelect = new Element('select', {
	    events: {
		change: function () {
		    selOptType = availOptsSelect.getSelected()[0].value;
		    refresh();
		}
	    }
	});
	body.push(['Option Type', availOptsSelect]);
	availOptsSelect.adopt(new Element('option'));
	Object.each(availOpts[table], function (typelist, opttype) {
	    var opt;
	    availOptsSelect.adopt(opt = new Element('option', {
		value: opttype,
		html: opttype
	    }));
	    if (opttype == selOptType) {
		opt.setProperty('selected', true);
	    }
	});
	if (selOptType) {
	    optSelect = new Element('select', {
		events: {
		    change: function () {
			selOpt = optSelect.getSelected()[0].value;
			//refresh();
		    }
		}
	    });
	    body.push([selOptType, optSelect]);
	    availOpts[table][selOptType].each(function (o, idx) {
		var opt;
		optSelect.adopt(opt = new Element('option', {
		    value: o,
		    html: o
		}));
		if (selOpt == o) {
		    opt.setProperty('selected', true);
		}
	    });
	}
    };
    refresh();

    var ok;
    var win = new fs_Window({
	title: "Select Option Type",
	body: body.toElement(),
	buttons: [
	    (
		    cancelButton({}, function () {
			win.close();
		    })).toElement(),
	    (ok = okButton({}, function () {
		win.close(callback(selOptType, selOpt));
	    })).toElement()
	]
    });
    win.toElement().addEvents({
	"keyup:keys(enter)": function (e) {
	    win.close(callback(selOptType, selOpt));
	},
	"keyup:keys(esc)": function (e) {
	    win.close();
	}
    });
    win.open();
    if (optSelect) {
	optSelect.focus();
    }
};


var getTypesTableSelect = function (types, table, index, callback) {
    var values = [];
    each(types[table], function (t, id) {
	if (id === 0) {
	    return;
	}
	values.push({
	    name: t.name,
	    value: id
	});
    });
    getUserSelect({
	title: 'Choose ' + table,
	label: table,
	values: values,
	selected: index
    }, function (id) {
	if (id) {
	    callback(id);
	}
    });
};
var getTableSelect = function (types, table, callback) {
    var values = [];
    each(types, function (vals, name) {
	values.push({
	    name: name,
	    value: name
	});
    });
    getUserSelect({
	title: 'Choose Table Type',
	label: "Table Type",
	values: values,
	selected: table
    }, function (id) {
	if (id) {
	    callback(id);
	}
    });
};
var getUserSelect = function (options, callback) {
    var select = new Element('select', {
    });
    options.values.each(function (v) {
	var opt;
	select.adopt(opt = new Element('option', {
	    value: v.value || v,
	    html: v.name || v
	}));
	if (v.value == options.selected || v == options.selected) {
	    opt.setProperty('selected', true);
	}
    });
    var win = new fs_Window({
	title: options.title || 'Select:',
	body: new HtmlTable({
	    rows: [[options.label, select]]
	}).toElement(),
	buttons: [
	    (cancelButton({}, function () {
		win.close();
	    })).toElement(),
	    (okButton({}, function () {
		win.close(callback(select.value));
	    })).toElement()
	]
    });
    win.toElement().addEvents({
	"keyup:keys(enter)": function (e) {
	    win.close(callback(selOpts));
	},
	"keyup:keys(esc)": function (e) {
	    win.close();
	}
    });
    win.open();
    select.focus();
};

var getRenameType = function (types, table, curType, callback) {
    var clone = Object.clone(curType);
    var typeselect = new Element('select', {
	events: {
	    change: function () {
		clone.type = typeselect.getSelected()[0].value
	    }
	}
    });
    typeselect.adopt(new Element('option'));
    var catselect = new Element('select', {
	events: {
	    change: function () {
		clone.category = catselect.getSelected()[0].value
	    }
	}
    });
    catselect.adopt(new Element('option'));
    var subcatselect = new Element('select', {
	events: {
	    change: function () {
		clone.subcat = subcatselect.getSelected()[0].value
	    }
	}
    });
    subcatselect.adopt(new Element('option'));
    var used = {};
    types[table].each(function (type, index) {
	if (index === 0) {
	    return;
	}
	if (!used[type.type]) {
	    used[type.type] = index;
	    typeselect.adopt(new Element('option', {
		html: type.type,
		value: type.type
	    }));
	}
	if (!used[type.category]) {
	    used[type.category] = index;
	    catselect.adopt(new Element('option', {
		html: type.category,
		value: type.category
	    }));
	}
	if (!used[type.subcat]) {
	    used[type.subcat] = index;
	    subcatselect.adopt(new Element('option', {
		html: type.subcat,
		value: type.subcat
	    }));
	}
    });
    typeselect.set('value', clone.type);
    catselect.set('value', clone.category);
    subcatselect.set('value', clone.subcat);
    var nameinput = new Element('input', {
	type: 'text',
	value: curType.name,
	events: {
	    keyup: function () {
		clone.name = nameinput.value;
	    }
	}
    });
    var typeinput = new Element('input', {
	type: 'text',
	value: clone.type,
	events: {
	    keyup: function () {
		clone.type = typeinput.value;
	    }
	}
    });
    var catinput = new Element('input', {
	type: 'text',
	value: clone.category,
	events: {
	    keyup: function () {
		clone.category = catinput.value;
	    }
	}
    });
    var subcatinput = new Element('input', {
	type: 'text',
	value: clone.subcat,
	events: {
	    keyup: function () {
		clone.subcat = subcatinput.value;
	    }
	}
    });

    var win = new fs_Window({
	title: 'Edit ' + table,
	body: new HtmlTable({
	    width: '100%',
	    properties: {
		class: 'window-table'
	    },
	    rows: [
		["Name", {
			content: nameinput,
			properties: {
			    colspan: 2
			}
		    }],
		["Type", typeselect, typeinput],
		["Category", catselect, catinput],
		["Sub Cat", subcatselect, subcatinput]
	    ]
	}).toElement(),
	buttons: [
	    cancelButton({},function () {
		win.close();
	    }.bind(this)),
	    okButton({},function () {
		win.close(callback(clone));
	    }.bind(this))
	]
    });
    win.toElement().addEvents({
	"keyup:keys(enter)": function (e) {
	    win.close(callback(clone));
	},
	"keyup:keys(esc)": function (e) {
	    win.close();
	}
    });
    win.open();
    nameinput.focus();
};

var openContextMenu = function (e, options) {
    var wrap = new Element('div', {
	class: 'context-menu',
	events: {
	    mouseenter: function () {

	    },
	    mouseleave: function () {
		close();
	    }
	}
    });
    //debugger;
    wrap.style.top = (e.event.pageY - 15) + 'px';
    wrap.style.left = (e.event.pageX - 15) + 'px';
    Object.each(options, function (callback, name) {
	var item = new Element('div', {
	    class: 'context-menu-item',
	    html: name,
	    events: {
		click: function (e) {
		    callback && callback(e);
		    close();
		    e.stop();
		}
	    }
	});
	wrap.adopt(item);
    });
    var close = function () {
	wrap.remove();
    };
    $$('body').adopt(wrap);

};

var setMountPosition = function (mountelm, position) {
    switch (position) {
	case "center":
	    mountelm.addClass('xy_center');
	    break;
	case "centerTop":
	    mountelm.addClass('x_center');
	    mountelm.style.top = 0;
	    break;
	case "centerBottom":
	    mountelm.addClass('x_center');
	    mountelm.style.bottom = 0;
	    break;
	case "centerLeft":
	    mountelm.addClass('y_center');
	    mountelm.style.left = 0;
	    break;
	case "centerRight":
	    mountelm.addClass('y_center');
	    mountelm.style.right = 0;
	    break;

	case "topRight":
	    mountelm.style.right = 0;
	    mountelm.style.top = 0;
	    break;
	case "topLeft":
	    mountelm.style.left = 0;
	    mountelm.style.top = 0;
	    break;
	case "bottomRight":
	    mountelm.style.right = 0;
	    mountelm.style.bottom = 0;
	    break;
	case "bottomLeft":
	    mountelm.style.left = 0;
	    mountelm.style.bottom = 0;
	    break;


	default:

	    break;
    }
}

/*-------------------*/
var div = function (o) {
    return new Element('div', o);
};
var span = function (o) {
    return new Element('span', o);
};
var ul = function (o) {
    return new Element('ul', o);
};
var li = function (o) {
    return new Element('li', o);
};
var each = function (objOrArr, callback) {
    if (typeOf(objOrArr) == 'array' || typeOf(objOrArr) == 'elements') {
	objOrArr.each(function (v, i) {
	    callback(v, i);
	});
	return
    }
    if (typeOf(objOrArr) == 'object') {
	Object.each(objOrArr, function (v, k) {
	    callback(v, k);
	});
	return
    }
};

var tokenizeHash = function () {
    var tokenized = {};
    var hash = window.location.hash;
    if (hash) {
	var vars = hash.split('&');
	vars.each(function (kv, idx) {
	    if (kv) {
		var k = kv.split('=')[0];
		var v = kv.split('=')[1];

		k = k.replace('#', '');
		tokenized[k] = v;
	    }
	}.bind(this));
    }
    return tokenized;
};