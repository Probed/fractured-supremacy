var fs_MultiProduceEditor = new Class({
    Implements: [Events, Options],
    win: null,
    builder: null,
    cont: null,
    contInt: null,
    activeTab: 0,
    options: {
	typeIds: [] //list of ID's to edit the produce values of
    },

    initialize: function (builder, table, upList, callback) {
	this.builder = builder;
	this.upList = upList;
	this.callback = callback;
	this.options.table = table;

	this.cont = div({
	    class: 'multiProduceEditor',
	    events: {
		click: function (e) {

		}.bind(this)
	    }
	});

	this.win = new fs_Window({
	    title: "Multi Production Editor",
	    body: this.cont,
	    buttons: [
		addButton({}, function () {
		    getUserString({
			title: 'Produce Name',
			label: 'Name'
		    }, function (name) {
			getIDSelect(this.builder.options.types, table, 0, 0, function (tbl, idx, qty) {
			    if (qty) {
				each(this.upList, function (id, index) {
				    var io = 'input';
				    var pidx = this.builder.options.types[table][id].options.produce.length;
				    if (!this.builder.options.types[table][id].options.produce[pidx]) {
					this.builder.options.types[table][id].options.produce[pidx] = {};
				    }
				    if (!this.builder.options.types[table][id].options.produce[pidx].value) {
					this.builder.options.types[table][id].options.produce[pidx].value = {time: 60000};
				    }
				    if (!this.builder.options.types[table][id].options.produce[pidx].value[io]) {
					this.builder.options.types[table][id].options.produce[pidx].value[io] = {};
				    }
				    if (!this.builder.options.types[table][id].options.produce[pidx].value[io][tbl]) {
					this.builder.options.types[table][id].options.produce[pidx].value[io][tbl] = {};
				    }
				    this.builder.options.types[table][id].options.produce[pidx].value[io][tbl][idx] = qty * (index + 1);
				    this.builder.options.types[table][id].options.produce[pidx].produce = name;
				}.bind(this));
				this.refresh();
			    }
			}.bind(this));
		    }.bind(this));
		}.bind(this), "Add Row"),
		new fs_Button({
		    html: 'Close',
		    icon: 'no',
		    events: {
			click: function () {
			    this.callback();
			    this.win.close();
			}.bind(this)
		    }
		})
	    ]
	});

	this.contInt = div({
	    class: 'multiProduceEditor-int'
	});
	this.cont.adopt(this.contInt);

	this.refresh();
    },
    open: function () {
	this.win.open();
    },

    toElement: function () {
	return this.cont;
    },

    refresh: function () {
	this.contInt.empty();
	var headers = [], rows = [];

	var nameRow = [];
	var produceRow = [];
	var produceRowTabs = [];
	this.upList.each(function (typeId, level) {
	    var type = this.builder.getType(typeId, this.options.table);
	    headers.push({
		content: new fs_Model(type).toElement(),
		properties: {
		    class: 'model-th'
		}
	    });
	    nameRow.push({
		content: type.name,
		properties: {
		    class: 'model-name-td'
		}
	    });

	    var produceTabs = [];
	    var produceTabsElements = [];
	    produceRowTabs.push(produceTabs);
	    each(type.options.produce, function (produce, pidx) {
		var tabs = new fs_Tabs({
		    tabChanged: function (tab, panel, tidx) {
			this.activeTab = tidx;
			produceTabs.each(function (t, i) {
			    t.activate(tidx);
			}.bind(this))
			produceRowTabs.each(function (tabsList, tlidx) {
			    tabsList.each(function (t, tltidx) {
				t.activate(tidx);
			    }.bind(this));
			}.bind(this));
		    }.bind(this)
		});
		tabs.add({label: 'Input'}, this.buildProduceInput(this.options.table, typeId, pidx, produce));
		tabs.add({label: new fs_Time({ms: produce.value.time, icon: true})}, this.buildProduceTime(this.options.table, typeId, pidx, produce));
		tabs.add({label: 'Output'}, this.buildProduceOutput(this.options.table, typeId, pidx, produce));

		produceTabsElements.push(tabs.toElement())
		tabs.activate(this.activeTab || 0);
		produceTabs.push(tabs);
	    }.bind(this));

	    produceRow.push({
		content: produceTabsElements
	    });
	}.bind(this));
	rows.push(nameRow);
	rows.push(produceRow);


	var tbl = new HtmlTable({
	    properties: {
		width: '100%',
		class: 'produceMulti-table'
	    },
	    headers: headers,
	    rows: rows
	});
	this.contInt.adopt(tbl.toElement());
    },

    buildProduceInput: function (table, typeId, pidx, produce) {
	var wrap = div({
	    class: 'produce-input-panel'
	});
	if (produce.value.input) {
	    each(produce.value.input, function (ids, pTable) {
		each(ids, function (qty, pId) {
		    wrap.adopt(this.buildProduceType(table, typeId, pidx, 'input', pTable, pId, qty));
		}.bind(this));
	    }.bind(this));
	}
	wrap.adopt(this.addProduceType(table, typeId, pidx, 'input'));
	var calcedProduceVals = this.builder.calcProduceVals(produce);
	wrap.adopt(div({
	    class: 'produce-input-totals',
	    html: 'Total: ' + calcedProduceVals.value.inputTotalQty
	}));

	return wrap;
    },
    buildProduceTime: function (table, typeId, pidx, produce) {
	var wrap = editButton({
	    class: 'produce-time-panel',
	    html: produce.value.time
	}, function () {
	    getUserString({
		title: 'Time',
		label: 'Time'
	    }, function (time) {
		if (time) {
		    if (!this.builder.options.types[table][typeId].options.produce[pidx]) {
			this.builder.options.types[table][typeId].options.produce[pidx] = {};
		    }
		    if (!this.builder.options.types[table][typeId].options.produce[pidx].value) {
			this.builder.options.types[table][typeId].options.produce[pidx].value = {};
		    }
		    this.builder.options.types[table][typeId].options.produce[pidx].value['time'] = time;
		    this.refresh();
		}
	    }.bind(this));
	}.bind(this));
	return wrap;
    },

    buildProduceOutput: function (table, typeId, pidx, produce) {
	var wrap = div({
	    class: 'produce-output-panel'
	});
	each(produce.value.output, function (ids, pTable) {
	    each(ids, function (qty, pId) {
		wrap.adopt(this.buildProduceType(table, typeId, pidx, 'output', pTable, pId, qty));
	    }.bind(this));
	}.bind(this));
	wrap.adopt(this.addProduceType(table, typeId, pidx, 'output'));
	var calcedProduceVals = this.builder.calcProduceVals(produce);
	wrap.adopt(div({
	    class: 'produce-output-totals',
	    html: 'Total: ' + calcedProduceVals.value.outputTotalQty
	}));

	return wrap;
    },

    addProduceType: function (table, typeId, pidx, io) {
	var wrap = div({
	    class: 'produce-type type-add',
	});
	wrap.adopt(editButton({}, function () {
	    getUserString({
		title: 'Produce Name',
		label: 'Name',
		value: this.builder.options.types[table][typeId].options.produce[pidx].produce
	    }, function (name) {
		if (name) {
		    if (!this.builder.options.types[table][typeId].options.produce[pidx]) {
			this.builder.options.types[table][typeId].options.produce[pidx] = {};
		    }
		    this.builder.options.types[table][typeId].options.produce[pidx].produce = name;
		    this.refresh();
		}
	    }.bind(this));
	}.bind(this), this.builder.options.types[table][typeId].options.produce[pidx].produce));
	wrap.adopt(addButton({}, function () {
	    getIDSelect(this.builder.options.types, table, typeId, 0, function (tbl, idx, qty) {
		if (qty) {
		    each(this.upList, function (id, index) {
			if (!this.builder.options.types[table][id].options.produce[pidx]) {
			    this.builder.options.types[table][id].options.produce[pidx] = {};
			}
			if (!this.builder.options.types[table][id].options.produce[pidx].value) {
			    this.builder.options.types[table][id].options.produce[pidx].value = {};
			}
			if (!this.builder.options.types[table][id].options.produce[pidx].value[io]) {
			    this.builder.options.types[table][id].options.produce[pidx].value[io] = {};
			}
			if (!this.builder.options.types[table][id].options.produce[pidx].value[io][tbl]) {
			    this.builder.options.types[table][id].options.produce[pidx].value[io][tbl] = {};
			}
			this.builder.options.types[table][id].options.produce[pidx].value[io][tbl][idx] = qty * (index + 1);
		    }.bind(this));
		    this.refresh();
		}
	    }.bind(this));
	}.bind(this)));
	wrap.adopt(deleteButton({}, function () {
	    delete this.builder.options.types[table][typeId].options.produce[pidx];
	    this.refresh();
	}.bind(this), ""));

	return wrap;
    },
    buildProduceType: function (table, typeId, pidx, io, pTable, pId, qty) {
	var wrap = div({
	    class: 'produce-type type-' + table,
	});
	wrap.adopt(new fs_Model(this.builder.getType(pId, pTable)),{height:75,width:75});
	wrap.adopt(div({
	    class: 'produce-type-name',
	    html: this.builder.getType(pId, pTable).name
	}));

	wrap.adopt(div({
	    class: 'produce-type-qty',
	    html: qty
	}));

	var context = [];
	wrap.addEvent('contextmenu', function (e) {
	    openContextMenu(e, context);
	    e.stop();
	}.bind(this));
	wrap.addEvent('click', function (e) {
	    getUserString({
		title: this.builder.getType(pId, pTable).name,
		label: 'Quantity'
	    }, function (newqty) {
		if (newqty) {
		    this.builder.options.types[table][typeId].options.produce[pidx].value[io][pTable][pId] = newqty;
		    this.refresh();
		}
	    }.bind(this));
	    e.stop();
	}.bind(this));
	context[fs_Icon('no') + ' Remove'] = function () {
	    delete this.builder.options.types[table][typeId].options.produce[pidx].value[io][pTable][pId]
	    this.refresh();
	}.bind(this);
	context[fs_Icon('no') + ' Remove All'] = function () {
	    each(this.upList, function (typeId, index) {
		delete this.builder.options.types[table][typeId].options.produce[pidx].value[io][pTable][pId]
	    }.bind(this));
	    this.refresh();
	}.bind(this);

	return wrap;
    },

});