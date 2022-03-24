var fs_BuildReqBuilder = new Class({
    Implements: [Events, Options],
    win: null,
    builder: null,
    cont: null,
    contInt: null,
    activeTab: 0,
    options: {

    },
    initialize: function (builder, table, upList, callback) {
	this.builder = builder;
	this.upList = upList;
	this.callback = callback;
	this.options.table = table;

	this.cont = div({
	    class: 'buildReqEditor',
	    events: {
		click: function (e) {

		}.bind(this)
	    }
	});

	this.win = new fs_Window({
	    title: "Multi Build Req Editor",
	    body: this.cont,
	    buttons: [
		addButton({}, function () {
		    getOptSelect(this.builder.options.availableOptions[table].buildReq, function (optTreeType) {
			if (optTreeType) {
			    this.builder.openOptionEditor(optTreeType, {}, function (newOpt) {
				if (newOpt) {
				    each(this.upList, function (tId, lvl) {
					if (typeOf(this.builder.options.types[table][tId].options['buildReq']) != 'array') {
					    this.builder.options.types[table][tId].options['buildReq'] = [];
					}
					this.builder.options.types[table][tId].options['buildReq'].push(newOpt);
				    }.bind(this));
				    this.refresh();
				    return true;
				}
				return false;
			    }.bind(this));
			    return true;
			}
			return false;
		    }.bind(this));
		}.bind(this), "Add to All"),
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
	    class: 'buildReqEditor-int'
	});
	this.cont.adopt(this.contInt);

	//this.refresh();
    },
    open: function () {
	this.win.open()
	this.refresh();
    },

    toElement: function () {
	return this.cont;
    },

    refresh: function () {
	this.contInt.empty();
	var headers = [], rows = [];

	var nameRow = [];
	var reqRow = [];
	var reqRowTabs = [];
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

	    var buildReqTabs = [];
	    var buildReqTabsElements = [];
	    reqRowTabs.push(buildReqTabs);
	    var tabs = new fs_Tabs({
		tabChanged: function (tab, panel, tidx) {
		    this.activeTab = tidx;
		    buildReqTabs.each(function (t, i) {
			t.activate(tidx);
		    }.bind(this))
		    reqRowTabs.each(function (tabsList, tlidx) {
			tabsList.each(function (t, tltidx) {
			    t.activate(tidx);
			}.bind(this));
		    }.bind(this));
		}.bind(this)
	    });
	    tabs.add({label: 'buildReq'}, this.buildBuildReq(this.options.table, typeId));

	    buildReqTabsElements.push(tabs.toElement());
	    tabs.activate(this.activeTab || 0);
	    buildReqTabs.push(tabs);

	    reqRow.push({
		content: buildReqTabsElements
	    });
	}.bind(this));
	rows.push(nameRow);
	rows.push(reqRow);


	var tbl = new HtmlTable({
	    properties: {
		width: '100%',
		class: 'buildReqMulti-table'
	    },
	    headers: headers,
	    rows: rows
	});
	this.contInt.adopt(tbl.toElement());
    },

    buildBuildReq: function (table, typeId, fromBuilder = false) {
	var wrap = div({
	    class: 'buildReq-input-panel'
	});
	var times = div();
	wrap.adopt(times);
	var reses = div();
	wrap.adopt(reses);
	var totaltime = div();
	wrap.adopt(totaltime);
	var buildReqTotal = {};
	if (this.builder.options.types[table][typeId].options.buildReq) {
	    each(this.builder.options.types[table][typeId].options.buildReq, function (opt, index) {
		switch (true) {
		    case typeof opt.time != 'undefined':
			var butt;
			times.adopt(butt = editButton({class: 'produce-type'}, function () {
			    this.builder.openOptionEditor("time", opt, function (newOpt) {
				this.builder.options.types[table][typeId].options.buildReq[index] = newOpt;
				if (fromBuilder) {
				    this.builder.refresh();
				} else {
				    this.refresh();
				}
			    }.bind(this));
			}.bind(this), opt.time + ': ' + new fs_Time({ms: opt.duration, icon: true}).toString() ));
			var context = [];
			butt.toElement().addEvent('contextmenu', function (e) {
			    openContextMenu(e, context);
			    e.stop();
			}.bind(this));
			context[fs_Icon('no') + ' Remove'] = function () {
			    this.builder.options.types[table][typeId].options.buildReq.splice(index,1);
			    if (fromBuilder) {
				this.builder.refresh();
			    } else {
				this.refresh();
			    }
			}.bind(this);
			context[fs_Icon('no') + ' Remove All'] = function () {
			    each(this.upList, function (tId, index) {
				each(this.builder.options.types[table][tId].options.buildReq, function (o, idx) {
				    if (opt.time == o.time) {
					this.builder.options.types[table][tId].options.buildReq.splice(idx, 1);
				    }
				}.bind(this));
			    }.bind(this));
			    if (fromBuilder) {
				this.builder.refresh();
			    } else {
				this.refresh();
			    }
			}.bind(this);
			break;
		    case typeof opt.id != 'undefined':
			var item = div({class: 'produce-type'})
			each(Object.keys(opt), function (key, val) {
			    if (this.builder.options.types[key]) {
				var type = this.builder.getType(opt[key][0], key);
				item.adopt(new fs_Model(type,{height:100,width:100}));
				item.adopt(div({class: 'produce-type-name', html: type.name}));
				item.adopt(div({class: 'produce-type-qty', html: opt.qty}));
				//wrap.adopt(new fs_Chain(this.builder, key, opt[key][0]).buildInChain(true));
				buildReqTotal[key + ":" + opt[key][0]] = new fs_Chain(this.builder, key, opt[key][0]).buildInChain(false);
//				console.log(buildReqTotal[key + ":" + opt[key][0]]);
				var time = '';
				each(buildReqTotal[key + ":" + opt[key][0]], function (ms, lvl) {
				    var tt = (((ms * 1) / ((lvl * 1) + 1)) * opt.qty);
				    var tot = tt.toFixed(tt < 1 ? 1 : 0)
				    time += new fs_Time({ms:tt*60000}).toString() + '<br/>';
				    buildReqTotal[key + ":" + opt[key][0]][lvl] = tot * 1;
				});
				item.adopt(div({class: 'produce-type-time', html: time}));

				var context = [];
				item.addEvent('contextmenu', function (e) {
				    openContextMenu(e, context);
				    e.stop();
				}.bind(this));
				context[fs_Icon('edit') + ' Edit'] = function () {
				    this.builder.openOptionEditor(key, opt, function (newOpt) {
					this.builder.options.types[table][typeId].options.buildReq[index] = newOpt;
					if (fromBuilder) {
					    this.builder.refresh();
					} else {
					    this.refresh();
					}
				    }.bind(this));
				    this.refresh();
				}.bind(this);
				context[fs_Icon('no') + ' Remove'] = function () {
				    delete this.builder.options.types[table][typeId].options.buildReq[index];
				    if (fromBuilder) {
					this.builder.refresh();
				    } else {
					this.refresh();
				    }
				}.bind(this);
				context[fs_Icon('no') + ' Remove All'] = function () {
				    each(this.upList, function (tId, index) {
					each(this.builder.options.types[table][tId].options.buildReq, function (o, idx) {
					    if (opt.id == o.id) {
						this.builder.options.types[table][tId].options.buildReq[idx, 1];
					    }
					}.bind(this));
				    }.bind(this));
				    if (fromBuilder) {
					this.builder.refresh();
				    } else {
					this.refresh();
				    }
				}.bind(this);
			    }
			}.bind(this))
			reses.adopt(item);
			break;
		    default:

			break;
		}
	    }.bind(this));
	}
	var totals = {};
	each(buildReqTotal, function (lvls, table_typeId) {
	    each(lvls, function (total, lvl) {
		!totals[lvl] && (totals[lvl] = 0);
		totals[lvl] += total;
	    });
	});
	each(totals, function (total, lvl) {
	    totaltime.adopt(span({html: new fs_Time({ms:total*60000}).toString() + ''}));
	    if (lvl != 4) {
		totaltime.adopt(span({html: ' / '}));
	    }
	});

	wrap.adopt(div());
	wrap.adopt(addButton({}, function () {
	    getOptSelect(this.builder.options.availableOptions[table]['buildReq'], function (optTreeType) {
		if (optTreeType) {
		    this.builder.openOptionEditor(optTreeType, {}, function (newOpt) {
			if (newOpt) {

			    if (typeOf(this.builder.options.types[table][typeId].options['buildReq']) != 'array') {
				this.builder.options.types[table][typeId].options['buildReq'] = [];
			    }
			    this.builder.options.types[table][typeId].options['buildReq'].push(newOpt);
			    if (fromBuilder) {
				this.builder.refresh();
			    } else {
				this.refresh();
			    }
			    return true;
			}
			return false;
		    }.bind(this));
		    return true;
		}
		return false;
	    }.bind(this));
	}.bind(this)));
	return wrap;
    }
});