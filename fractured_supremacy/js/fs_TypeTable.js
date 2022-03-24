/*
 * fs_TypeTable
 *
 * This is the parent class for all database tabels that have a Type table
 * It extends the fs_ListItem class for easy listing with the fs_List class
 *
 * @type Class
 */
/* global TYPES */

var fs_TypeTable = new Class({
    Implements: [Events, Options],
    propertyWindowBody: null,
    table: null, /* must set in child class. should be set to the name of the table ie: building */
    table_type: null, /* must set in child class. should be set to the name of the type table ie: building_type */
    type: null, /* Holds the contents of the table_type as loaded from the DB */
    properties_win: null,
    options: {

    },
    initialize: function (options) {
	this.setOptions(options);
	/*
	 * Set type to the global var types for this table_type. ie: building_type (name,cat,desc,options,etc)
	 */
	if (typeof TYPES != 'undefined') {
	    this.type = TYPES[this.table][options[this.table_type + '_id']];
	}
	/*
	 * take this objects options and merge them with the default type options
	 */
	this.applyOptions(options);
	/*
	 * Create the DOM object that will hold the games play area container
	 */
	this.cont = new Element('div', {
	    "class": this.getClass(),
	    "events": {
		"click": function (e) {
		    e && e.preventDefault && e.preventDefault();
		    e && e.stopPropagation && e.stopPropagation();
		    return false;
		}.bind(this)
	    }
	});

	this.cont.addEvent('click', function (e) {
	    this.getPropertiesWindow();
	}.bind(this));
    },
    /*
     * Return the Game container element
     * @returns {Element}
     */
    toElement: function () {
	return this.cont;
    },
    /*
     * merge the type options and apply level overrides
     */
    applyOptions: function (obj) {
	if (!this.type) {
	    return
	}
	obj["type"] = this.type.type;
	if (!obj["name"]) {
	    obj["name"] = this.type.name;
	}
	obj["category"] = this.type.category;
	obj["subcat"] = this.type.subcat;
	obj["options"] = Object.merge({}, this.type.options, obj.options);
	this.setOptions(obj);
	this.cont && this.cont.setProperty("class", this.getClass());
    },
    getClass: function () {
	var c = this.table;
	var css = getOption(this.options, 'styles', 'css', 'css');
	if (css) {
	    c += " type-" + css["css"];
	}
	return c;
    },
    getModel: function (modelOpts = {}) {
	return new fs_Model(this.options, modelOpts);
    },
    getPropertiesWindow: function () {
	var wrap = div({class: 'wrap'});
	var tbl = new HtmlTable({
	    zebra: false,
	    properties: {

	    }
	});
	tbl.push([
	    {
		content: this.getPropertiesDetails(),
		properties: {
		    class: 'v-top properties-model'
		}
	    },
	    {
		content: this.propertyWindowBody = div().adopt(this.getPropertiesBody()),
		properties: {
		    class: 'v-top'
		}
	    }
	])
	wrap.adopt(tbl.toElement());
	this.properties_win = new fs_Window({
	    class: 'properties ' + this.table_type + '-properties',
	    canClose: true,
	    title: this.type.name,
	    body: wrap,
	    buttons: [
		(cancelButton({}, function () {
		    this.properties_win.close();
		}.bind(this)))
	    ]
	}).open();
    },
    getPropertiesDetails: function () {
	var tbl = new HtmlTable({
	    zebra: false,
	    properties: {

	    }
	});
	tbl.push([
	    {
		content: this.getModel().toElement(),
		properties: {
		    colspan: 2,
		    class: ''
		}
	    }
	]);
	tbl.push([
	    {
		content: this.table.replace('_', ' '),
		properties: {
		    class: ''
		}
	    }
	]);
	tbl.push([
	    {
		content: this.type.type,
		properties: {
		    class: ''
		}
	    }
	]);
	tbl.push([
	    {
		content: this.type.category,
		properties: {
		    class: ''
		}
	    }
	]);
	tbl.push([
	    {
		content: this.type.subcat,
		properties: {
		    class: ''
		}
	    }
	]);
	return tbl.toElement();
    },
    getPropertiesBody: function () {
	var tbl = new HtmlTable({
	    zebra: false,
	    properties: {

	    }
	});
	tbl.push([
	    {
		content: '<h1>' + this.type.name + '</h1>',
		properties: {
		    class: 'properties-name text-center'
		}
	    }
	]);

	var tabs = new fs_Tabs({});

	var produce = this.type.options.produce;
	if (produce) {
	    tabs.add({label: "Produce"}, this.getPropertiesProduce());
	}

	var upTo = this.type.options.upTo && this.type.options.upTo[0][this.table];
	if (upTo) {
	    tabs.add({label: "Upgrade"}, this.getPropertiesUpTo());
	}

	tbl.push([
	    {
		content: tabs.toElement(),
		properties: {
		    class: ''
		}
	    }
	]);
	tabs.activate(0);
	return tbl.toElement();
    },

    getPropertiesUpTo: function () {
	var tbl = new HtmlTable({
	    zebra: false,
	    properties: {
		class: "buildCost",
		align: "center"
	    }
	});
	var duration = {};
	var rows = [];

	var upTo = this.type.options.upTo[0][this.table];
	//debugger;
	if (upTo) {
	    var upToType = TYPES[this.table][upTo];
	    if (typeOf(upToType) == 'array') {
		upToType = upToType[0];
	    }
	    each(upToType.options.buildCost, function (opt, table) {
		var row = [];
		switch (true) {
		    case typeof opt.duration != 'undefined':
			duration = new fs_Time({ms: opt.duration}).toString();
			break;
		    case typeof opt.id != 'undefined':
			var optclone = Object.clone(opt);
			var id = opt.id;
			var qty = opt.qty;
			delete optclone.id;
			delete optclone.qTY;
			row.push({
			    content: (qty * 1).toLocaleString(),
			    properties: {
				class: 'text-right qty'
			    }
			});
			row.push({
			    content: new fs_Model(TYPES[Object.keys(optclone)[0]][optclone[Object.keys(optclone)[0]]], {height: 25, width: 25}).toElement(),
			    properties: {
				class: 'costType'
			    }
			});
			rows.push(row);
			break;
		}
	    });
	    7
	}
	tbl.push([
	    {
		content: div({'class': 'upTo-model'}).adopt(new fs_Model(upToType).toElement()),
		properties: {
		    class: 'v-top',
		    rowspan: upToType.options.buildCost ? upToType.options.buildCost.length : 1
		}
	    },
	    {
		content: 'Cost',
		properties: {
		    class: 'text-center v-top',
		    colspan: 2
		}
	    }
	]);
	tbl.pushMany(rows);
	tbl.push([
	    {
		content: (okButton({html: "Upgrade " + duration}, function () {
		    app.submit({
			action: 'upgrade_' + this.table,
			data: {
			    id: this.options.id,
			    table: this.table
			},
			onSuccess: function (response) {
			    this.upgrade(response);
			}.bind(this)
		    });
		}.bind(this))).toElement(),
		properties: {
		    colspan: 3,
		    class: "button-cont text-right"
		}
	    }
	]);
	return tbl.toElement()
    },

    getPropertiesProduce: function () {
	var tbl = new HtmlTable({
	    zebra: false,
	    properties: {
		class: "produce-table"
	    }
	});
	var rows = [[
		{
		    content: 'Input',
		    properties: {
			class: "v-middle text-center"
		    }
		},
		{
		    content: 'Time',
		    properties: {
			class: "v-middle text-center"
		    }
		},
		{
		    content: 'Output',
		    properties: {
			class: "v-middle text-center"
		    }
		},
		{
		    content: ' ',
		    properties: {
			class: "v-middle text-center"
		    }
		}
	    ]];
	each(this.options.options.produce, function (pitem, idx) {
	    var i = pitem.value.input;
	    var o = pitem.value.output;
	    var button;

	    if (this.options.options.produce[idx].active) {
		button = (cancelButton({html: "Stop"}, function () {
		    each(this.options.options.produce, function (pitem, pidx) {
			delete this.options.options.produce[pidx].active;
		    }.bind(this));
		    this.propertyWindowBody.empty().adopt(this.getPropertiesBody())
//		app.submit({
//		    action: 'produce_' + this.table,
//		    data: {
//			id: this.options.id,
//			produce_index: idx,
//			table: this.table
//		    },
//		    onSuccess: function (response) {
//			this.produce(response);
//		    }.bind(this)
//		});
		}.bind(this))).toElement();
	    } else {
		button = (okButton({html: "Start"}, function () {
		    each(this.options.options.produce, function (pitem, pidx) {
			delete this.options.options.produce[pidx].active;
		    }.bind(this));
		    this.options.options.produce[idx].active = true;
		    this.propertyWindowBody.empty().adopt(this.getPropertiesBody())
//		app.submit({
//		    action: 'produce_' + this.table,
//		    data: {
//			id: this.options.id,
//			produce_index: idx,
//			table: this.table
//		    },
//		    onSuccess: function (response) {
//			this.produce(response);
//		    }.bind(this)
//		});
		}.bind(this))).toElement();
	    }

	    var row = [
		{
		    content: (function () {
			var out = div({'class': 'produce-input-model'});
			each(i, function (type_ids, table) {
			    each(type_ids, function (qty, type_id) {
				var item = div({class: 'produce-item'});
				item.adopt(div({html: qty, class: 'produce-item-qty'}));
				item.adopt(div({html: TYPES[table][type_id].name, class: 'produce-item-name'}));
				item.adopt(new fs_Model(TYPES[table][type_id], {height: 50, width: 50}).toElement())
				out.adopt(item);
			    }.bind(this));
			}.bind(this));
			return out;
		    }.bind(this))(),
		    properties: {
			class: "v-middle"
		    }
		},
		{
		    content: new fs_Time({ms: pitem.value.time}).toString(),
		    properties: {
			class: 'v-middle'
		    }
		},
		{
		    content: (function () {
			var out = div({'class': 'produce-output-model'});
			each(o, function (type_ids, table) {
			    each(type_ids, function (qty, type_id) {
				var item = div({class: 'produce-item'});
				item.adopt(div({html: qty, class: 'produce-item-qty'}));
				item.adopt(div({html: TYPES[table][type_id].name, class: 'produce-item-name'}));
				item.adopt(new fs_Model(TYPES[table][type_id], {height: 50, width: 50}).toElement())
				out.adopt(item);
			    }.bind(this));
			}.bind(this));
			return out;
		    }.bind(this))(),
		    properties: {
			class: "v-middle"
		    }
		},
		{
		    content: button
		}
	    ];
	    rows.push(row)
	}.bind(this));
	tbl.pushMany(rows);
	return tbl.toElement()
    },
    upgrade: function (response) {
	this.properties_win.close();
    }
});