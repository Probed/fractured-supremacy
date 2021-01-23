var fs_ResourcePath = new Class({
    cont: null,
    activeTab: 0,
    initialize: function (builder, resTypeId, callback) {

	this.builder = builder;
	this.id = resTypeId;
	this.callback = callback;
	this.type = this.builder.options.types['resource'][resTypeId];

	this.cont = div({
	    class: 'resource-path'
	});

	this.contInt = div({
	    class: 'resource-path-int'
	});
	this.cont.adopt(this.contInt);
	this.refresh();
    },

    toElement: function () {
	return this.cont;
    },

    refresh: function () {
	this.contInt.empty();

	var tabs = new fs_Tabs();
	tabs.add({label: 'In Chain'}, this.buildInChain());
	tabs.add({label: 'Out Chain'}, this.buildOutChain());

	tabs.activate(this.activeTab);
	this.contInt.adopt(tabs);
    },

    buildProducedBy: function (table, id, lvlavg = {}, asTable = false) {
	var wrap = div({class: 'producedBy'});

	//var type = this.builder.options.types[table][id];
	var pBy = this.builder.getProducedBy(table, id);
	if (!Object.keys(pBy)[0]) {
	    return wrap;
	}

	var lvllists = {};
	each(pBy, function (pByTypes, pByTable) {
	    lvllists[pByTable] = {};
	    each(pByTypes, function (pByCalcedProduceValsList, pByTypeId) {
		lvllists[pByTable][JSON.encode(this.builder.getUpgradeList(pByTable, pByTypeId))] = true;
	    }.bind(this));
	}.bind(this));
	var tbl;
	if (asTable) {
	    tbl = new HtmlTable({
		properties: {
		    class: 'pByTable',
		    align: "center",
//		    width: '100%'
		}
	    });
	}
	var headers = ['Type'];
	var headersSet = false;
	var rows = [];

	var lvlavgcnt = {};
	each(lvllists, function (lists, listTable) {
	    each(lists, function (bool, list) {
		var row = [];
		list = JSON.decode(list);

		var first;
		if (asTable) {
		    first = this.builder.getType(list[0], listTable);
		    row.push({
			content: this.builder.buildTypesLink(listTable, first.subcat, list),
			properties: {
			    class: 'keyCol'
			}
		    });
		}

		each(list, function (typeid, level) {
		    if (pBy[listTable][typeid]) {
			if (!headersSet) {
			    headers.push(level + 1);
			}

			var vals = '';
			each(pBy[listTable][typeid], function (pByCalcedProduceVals) {
			    vals = vals + pByCalcedProduceVals.value.output['resource'][id].permin + '/';
			    !lvlavgcnt[level] && (lvlavgcnt[level] = 0);
			    !lvlavg[level] && (lvlavg[level] = 0)
			    lvlavgcnt[level] += 1;
			    lvlavg[level] += pByCalcedProduceVals.value.output['resource'][id].permin * 1;
			}.bind(this));
			if (asTable) {
			    if (vals)
				vals = vals.slice(0, vals.length - 1);
			    row.push({
				content: vals || ' ',
				properties: {
				    class: 'valCol'
				}
			    });
			}
		    }
		}.bind(this));

		headersSet = true;
		rows.push(row);
	    }.bind(this));
	}.bind(this));
	var foot = [
	    'Average'
	];
	each(lvlavg, function (total, level) {
	    lvlavg[level] = lvlavg[level] / lvlavgcnt[level];
	    foot.push(lvlavg[level].toFixed(1));
	});
	if (asTable) {
	    tbl.set('headers', headers);
	    tbl.pushMany(rows);
	    tbl.push(foot);
	    wrap.adopt(tbl.toElement());
	    return wrap;
    }
    },
    buildRequiredBy: function (table, id, lvlqtys = {}, parentId, asTable = false) {
	var wrap = div({class: 'producedBy'});

	//var type = this.builder.options.types[table][id];
	var pBy = this.builder.getRequiredBy(table, id);
	if (!Object.keys(pBy)[0]) {
	    return wrap;
	}

	var lvllists = {};
	each(pBy, function (pByTypes, pByTable) {
	    lvllists[pByTable] = {};
	    each(pByTypes, function (pByCalcedProduceValsList, pByTypeId) {
		lvllists[pByTable][JSON.encode(this.builder.getUpgradeList(pByTable, pByTypeId))] = true;
	    }.bind(this));
	}.bind(this));
	var tbl;
	if (asTable) {
	    tbl = new HtmlTable({
		properties: {
		    class: 'pByTable',
		    align: "center",
//		    width: '100%'
		}
	    });
	}
	var headers = ['Type'];
	var headersSet = false;
	var rows = [];
	var lvlavgcnt = {};
	each(lvllists, function (lists, listTable) {
	    each(lists, function (bool, list) {
		var row = [];
		list = JSON.decode(list);

		var first;
		if (asTable) {
		    first = this.builder.getType(list[0], listTable);
		    row.push({
			content: this.builder.buildTypesLink(listTable, first.subcat, list),
			properties: {
			    class: 'keyCol'
			}
		    });
		}
		var hasAsOutput = false;

		each(list, function (typeid, level) {
		    if (pBy[listTable][typeid]) {
			if (!headersSet) {
			    headers.push(level + 1);
			}
			var vals = '';
			var avg = 0;
			each(pBy[listTable][typeid], function (pByCalcedProduceVals) {
			    if (parentId && pByCalcedProduceVals.value.output && pByCalcedProduceVals.value.output[table] && pByCalcedProduceVals.value.output[table][parentId]) {
				vals = vals + (pByCalcedProduceVals.value.input[table][id].qty * (pByCalcedProduceVals.value.output[table][parentId]['%tot'] / 100)) + '/';
				avg += pByCalcedProduceVals.value.input[table][id].qty * (pByCalcedProduceVals.value.output[table][parentId]['%tot'] / 100);
				hasAsOutput = true;
			    }
			    if (!parentId) {
				vals = vals + pByCalcedProduceVals.value.input[table][id].qty + '/';
				//avg += pByCalcedProduceVals.value.input[table][id].qty;
				hasAsOutput = true;
			    }
			}.bind(this));
			//avg = avg / pBy[listTable][typeid].length;
			if (hasAsOutput) {
			    lvlqtys[level] = avg;
			}
			if (vals)
			    vals = vals.slice(0, vals.length - 1);
			row.push({
			    content: vals || ' ',
			    properties: {
				class: 'valCol'
			    }
			});
		    }
		}.bind(this));
		headersSet = true;
		if (hasAsOutput) {
		    rows.push(row);
		}
	    }.bind(this));
	}.bind(this));
	var foot = [
	    'Average'
	];
	each(lvlqtys, function (total, level) {
	    lvlqtys[level] = total;
	    foot.push(lvlqtys[level].toFixed(1));
	});
	if (asTable) {
	    tbl.set('headers', headers);
	    tbl.pushMany(rows);
	    tbl.push(foot);
	    wrap.adopt(tbl.toElement());
	    return wrap;
    }
    },
    buildOutChain: function () {
	var wrap = div({
	    class: 'chain-wrap'
	});

	var chainout = this.builder.getProduceChain('resource', this.id, {}, true);
	var outlist = [];
	var outused = {};

	var chainOut = this.outputChain(chainout, 1, outlist, outused, this.id);

	var out = ul({class: 'chain depth-0'})
		.adopt(new li({class: 'chain-item'})
			.adopt(new fs_Model(this.builder.getType(this.id, 'resource')))
			.adopt(this.buildRequiredBy('resource', this.id, {}))
			.adopt(chainOut));
	wrap.adopt(out);

	return wrap;

    },

    buildInChain: function () {
	var wrap = div({
	    class: 'chain-wrap'
	});

	var chainin = this.builder.getProducedByChain('resource', this.id);

	var inlist = [];
	var inused = {};
	var totals = {};

	var chainIn = this.inputChain(chainin, 1, inlist, inused, totals, this.id);

	var totalOut = '';
	each(totals, function (mins,lvl) {
	    if (isNaN(mins)) {
		return;
	    }
	    totalOut += (mins/((lvl*1)+1)).toFixed(0) + 'm / ';
	});
	var out = ul({class: 'chain depth-0'});
	out.adopt(new li({class: 'chain-item'})
		.adopt(new fs_Model(this.builder.getType(this.id, 'resource')))
		.adopt(div({html: '' + totalOut.slice(0, totalOut.length - 3)}))
		.adopt(this.buildProducedBy('resource', this.id, this.id, {}, true))
		.adopt(chainIn));
	wrap.adopt(out);

	return wrap;

    },
    outputChain: function (chain, depth = 0, list = null, used, parentId) {
	var wrap = ul({
	    class: 'chain depth-' + depth
	});

	if (typeOf(chain) == 'object') {

	    each(Object.keys(chain), function (key) {
		if (key == 'calc' || key == 'typeId' || key == 'table') {
		    return;
		}
		if (!used[key]) {
		    if (list) {
			list.push(key);
		    }
		    used[key] = [];
		}
		used[key].push({
		    table: chain.table,
		    typeId: chain.typeId
		});
		var item = li({
		    'class': 'chain-item'
		});

		var type = this.builder.getType(key.split(':')[1], key.split(':')[0]);
		var top = 0;
		var left = 0;
		var model = new fs_Model(type,{height: 30,width:30});
		item.adopt(model);
		var pby = div();
		item.adopt(pby);
		model.toElement().addEvent('click', function (e) {
		    if (item.hasClass('active')) {
			item.removeClass('active');
			pby.empty();
		    } else {
			var pqty = {};
			item.addClass('active');
			pby.adopt(div({html: 'Produced By:'}));
			pby.adopt(this.buildProducedBy(key.split(':')[0], key.split(':')[1], {}, true));

		    }
		}.bind(this));

		item.adopt(this.outputChain(chain[key], depth + 1, list, used, key.split(':')[1]));
		wrap.adopt(item);

	    }.bind(this));
	}
	return wrap;
    },

    inputChain: function (chain, depth = 0, list = null, used = {}, totals, parentId) {
	var wrap = ul({
	    class: 'chain depth-' + depth
	});
	if (typeOf(chain) == 'object') {

	    each(Object.keys(chain), function (key) {
		if (key == 'calc' || key == 'typeId' || key == 'table') {
		    return;
		}

		if (!used[key]) {
		    if (list) {
			list.push(key);
		    }
		    used[key] = [];
		}
		var item = li({
		    'class': 'chain-item'
		});

		var type = this.builder.getType(key.split(':')[1], key.split(':')[0]);
		var model = new fs_Model(type,{height: 30,width:30});
		item.adopt(model);
		var pby = div();
		item.adopt(pby);
		var pqty = {};
		this.buildProducedBy(key.split(':')[0], key.split(':')[1], pqty);
		var rqty = {};
		this.buildRequiredBy(key.split(':')[0], key.split(':')[1], rqty, parentId);

		model.toElement().addEvent('click', function (e) {
		    if (item.hasClass('active')) {
			item.removeClass('active');
			pby.empty();
		    } else {
			item.addClass('active');

			pby.adopt(div({html: 'Produced By:'}));
			pby.adopt(this.buildProducedBy(key.split(':')[0], key.split(':')[1], {}, true));
			pby.adopt(div({html: 'Required By:'}));
			pby.adopt(this.buildRequiredBy(key.split(':')[0], key.split(':')[1], {}, parentId, true));
		    }
		}.bind(this));
		each(pqty, function (permin, lvl) {
		    !totals[lvl] && (totals[lvl] = 0);
		    totals[lvl] += permin * rqty[lvl];
		    //item.adopt(div({
			//html: 'in[: ' + (permin * rqty[lvl]).toFixed(1) + '] run['+totals[lvl].toFixed(1)+']'
		    //}));
		});

		used[key].push({
		    table: chain.table,
		    typeId: chain.typeId
		});
		item.adopt(this.inputChain(chain[key], depth + 1, list, used, totals, key.split(':')[1]));
		wrap.adopt(item);

	    }.bind(this));
	}
	return wrap;
    },

    getChainConnections: function (chain, depth = 0, connections) {
	if (typeOf(chain) == 'object') {
	    each(Object.keys(chain), function (key) {
		if (Object.keys(chain[key])[0]) {
		    connections.push({
			from: key,
			to: Object.keys(chain[key])[0]
		    });
		}
		this.getChainConnections(chain[key], depth + 1, connections);
	    }.bind(this));
    }
    }

});