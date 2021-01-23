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

    initialize: function (builder, upList, callback) {
	this.builder = builder;
	this.upList = upList;
	this.callback = callback;

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
	    var type = this.builder.getType(typeId);
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
		tabs.add({label: 'Input'}, this.buildProduceInput(this.builder.options.table, typeId, pidx, produce));
		tabs.add({label: new fs_Time({ms: produce.value.time, icon: true})}, this.buildProduceTime(this.builder.options.table, typeId, pidx, produce));
		tabs.add({label: 'Output'}, this.buildProduceOutput(this.builder.options.table, typeId, pidx, produce));

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
	var calcedProduceVals = this.builder.calcProduceVals(produce);
	wrap.adopt(div({
	    class: 'produce-input-totals',
	    html: 'Total: ' + calcedProduceVals.value.inputTotalQty
	}));

	return wrap;
    },
    buildProduceTime: function (table, typeId, pidx, produce) {
	var wrap = div({
	    class: 'produce-time-panel',
	    html: produce.value.time
	});
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
	var calcedProduceVals = this.builder.calcProduceVals(produce);
	wrap.adopt(div({
	    class: 'produce-output-totals',
	    html: 'Total: ' + calcedProduceVals.value.outputTotalQty
	}));

	return wrap;
    },

    buildProduceType: function (table, typeId, pidx, io, pTable, pId, qty) {
	var wrap = div({
	    class: 'produce-type type-' + table,
	});
	wrap.adopt(new fs_Model(this.builder.getType(pId, pTable)));
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

	return wrap;
    },

});