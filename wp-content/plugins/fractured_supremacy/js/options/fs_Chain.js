var outChainCache = {};
var inTotalsCache = {};
var fs_Chain = new Class({
    builder: null,
    table: null,
    typeId: null,
    initialize: function (builder, table, typeId) {
	this.builder = builder;
	this.table = table;
	this.typeId = typeId;

	return this;
    },

    getTabs: function () {
	var tabs = new fs_Tabs();
	tabs.add({label: 'In Chain'}, this.buildInChain(true));
	tabs.add({label: 'Out Chain'}, this.buildOutChain(true));
	tabs.activate(0);
	return tabs.toElement();
    },

    buildOutChain: function (html = false) {
	if (!html && outChainCache[this.table + ":" + this.typeId]) {
	    return outChainCache[this.table + ":" + this.typeId];
	}
	var outlist = [];
	var outused = {};
	var chainOut = this._outputChainRecursive(this._getProduceChainRecursive(this.table, this.typeId, {}), 1, outlist, outused, this.typeId, html);
	if (html) {
	    var wrap = div({
		class: 'chain-wrap'
	    });
	    var out = ul({class: 'chain depth-0'})
		    .adopt(new li({class: 'chain-item'})
			    .adopt(new fs_Model(this.builder.getType(this.typeId, this.table)))
			    .adopt(this._buildRequiredBy(this.table, this.typeId, {}))
			    .adopt(chainOut));
	    wrap.adopt(out);
	    return wrap;
	} else {
	    outChainCache[this.table + ":" + this.typeId] = outused;
	    return outused;
    }
    },

    buildInChain: function (html = false) {
	if (!html && inTotalsCache[this.table + ":" + this.typeId]) {
	    //console.log(inTotalsCache[this.table + ":" + this.typeId]);
	    //return inTotalsCache[this.table + ":" + this.typeId];
	}
	if (html) {
	    var wrap = div({
		class: 'chain-wrap'
	    });
	}

	var inlist = [];
	var inused = {};
	var totals = {};

	var chainIn = this._inputChainRecursive(this._getProducedByChainRecursive(this.table, this.typeId), 1, inlist, inused, totals, this.typeId, html);
	if (Object.keys(totals).length === 0) {
	    this._buildProducedBy(this.table, this.typeId, totals, true);
	}

	var totalOut = div();
//	console.log(inused);
	each(totals, function (mins, lvl) {

	    if (isNaN(mins)) {
		return;
	    }
	    var total = (mins / ((lvl * 1) + 1));
	    var tot = total.toFixed(total < 1 ? 2 : 0)
	    var qtydiv;
	    totalOut.adopt(qtydiv = div({
		html: 'Level ' + ((lvl * 1) + 1) + '<br/>' + tot + 'm',
		class: 'level-time',
		events: {
		    click: function () {
			$$('.level').hide();
			$$('.level-time').removeClass('active');
			$$('.level-' + lvl).show();
			qtydiv.addClass('active');
		    }
		}
	    }));
	});
	var inUsedWrap = div({style: 'display:inline-block;'});
	each(inused, function (types, key) {
	    var type = this.builder.getType(key.split(':')[1], key.split(':')[0]);
	    var used = div({class: 'type-used'});
	    var lvls = {};
	    each(types, function (builder, index) {
		each(builder.qty, function (qty, lvl) {
		    if (!lvls[lvl]) {
			lvls[lvl] = 0;
		    }
		    lvls[lvl] += qty;
		}.bind(this));
	    }.bind(this));
	    var lvlqtys = '';
	    each(lvls, function (totalqty, lvl) {
		lvlqtys += '<span class="level level-' + lvl + '">' + totalqty.toFixed(0) + '</span>';
	    }.bind(this));
	    used.adopt(new fs_Model(type, {height: 32, width: 32}));
	    used.adopt(div({html: lvlqtys}));
	    inUsedWrap.adopt(used);
	}.bind(this));
	var out = ul({class: 'chain depth-0'});
	out.adopt(new li({class: 'chain-item'})
		.adopt(new fs_Model(this.builder.getType(this.typeId, this.table)))
		.adopt(totalOut)
		.adopt(inUsedWrap)
		.adopt(this._buildProducedBy(this.table, this.typeId, {}, true))
		.adopt(chainIn));
	if (html) {
	    wrap.adopt(out);
	    return wrap;
	} else {
	    inTotalsCache[this.table + ":" + this.typeId] = totals;
	    return totals;
    }

    },

    _getProduceChainRecursive: function (typeTable, typeId, chain = {}, depth = 0) {
	var outputs = {};
	each(this.builder.options.types, function (types, table) {
	    each(types, function (type, id) {
		if (typeOf(type.options) != 'object') {
		    return;
		}
		if (typeOf(type.options.produce) != 'array') {
		    return;
		}
		each(type.options.produce, function (produce, pidx) {
		    var isReqBy = false;
		    each(produce.value.input, function (pids, pTable) {
			each(pids, function (qty, pId) {
			    if (typeTable == pTable && pId == typeId) {
				isReqBy = true;
			    }
			}.bind(this));
		    }.bind(this));

		    if (isReqBy && !/Splitter/.test(type.name)) {
			//var calc = this.calcProduceVals(produce);
			each(produce.value.output, function (pids, pTable) {
			    each(pids, function (qty, pId) {
				//if (typeOf(outputs[pTable + ':' + pId]) != 'object') {
				outputs[pTable + ':' + pId] = {};
				//}
			    }.bind(this));
			}.bind(this));
		    }
		}.bind(this));
	    }.bind(this));
	}.bind(this));
	each(outputs, function (obj, key) {
	    chain[key] = {};
	    this._getProduceChainRecursive(key.split(':')[0], key.split(':')[1], chain[key], depth + 1);
	}.bind(this));
	return chain;
    },

    getProducedBy: function (typeTable, typeId) {
	var pBy = {};
	each(this.builder.options.types, function (types, table) {
	    each(types, function (type, id) {
		if (typeOf(type.options) != 'object') {
		    return;
		}
		if (typeOf(type.options.produce) != 'array' && typeOf(type.options.produce) != 'object') {
		    return;
		}

		each(type.options.produce, function (produce, pidx) {
		    if (typeOf(produce.value.output) != 'object') {
			return;
		    }
		    var calc = this._calcProduceVals(produce);

		    each(produce.value.output, function (pids, pTable) {
			each(pids, function (qty, pId) {
			    if ((pTable == typeTable) && pId == typeId) {
				if (!pBy[table]) {
				    pBy[table] = {};
				}
				if (!pBy[table][id]) {
				    pBy[table][id] = [];
				}

				pBy[table][id].push(calc);

			    }
			}.bind(this));
		    }.bind(this));
		}.bind(this));
	    }.bind(this));
	}.bind(this));
	return pBy;
    },

    getRequiredBy: function (typeTable, typeId) {
	var rBy = {};
	each(this.builder.options.types, function (types, table) {
	    each(types, function (type, id) {
		if (typeOf(type.options) != 'object') {
		    return;
		}
		if (typeOf(type.options.produce) != 'array' && typeOf(type.options.produce) != 'object') {
		    return;
		}

		each(type.options.produce, function (produce, pidx) {
		    if (typeOf(produce.value.output) != 'object') {
			return;
		    }
		    var calc = this._calcProduceVals(produce);

		    each(produce.value.input, function (pids, pTable) {
			each(pids, function (qty, pId) {
			    if ((pTable == typeTable) && pId == typeId) {
				if (!rBy[table]) {
				    rBy[table] = {};
				}
				if (!rBy[table][id]) {
				    rBy[table][id] = [];
				}
				rBy[table][id].push(calc);
			    }
			}.bind(this));
		    }.bind(this));
		}.bind(this));
	    }.bind(this));
	}.bind(this));
	return rBy;
    },

    _getProducedByChainRecursive: function (typeTable, typeId, chain = {}, depth = 0) {
	var inputs = {};
	each(this.builder.options.types, function (types, table) {
	    each(types, function (type, id) {
		if (typeOf(type.options) != 'object') {
		    return;
		}
		if ((typeOf(type.options.produce) != 'object' && typeOf(type.options.produce) != 'array') || /Splitter/.test(type.name)) {
		    return;
		}
		each(type.options.produce, function (produce, pidx) {
		    var isProdBy = false;
		    each(produce.value.output, function (pids, pTable) {
			each(pids, function (qty, pId) {
			    if (typeTable == pTable && pId == typeId) {
				isProdBy = true;
			    }
			}.bind(this));
		    }.bind(this));
		    if (isProdBy) {
			each(produce.value.input, function (pids, pTable) {
			    each(pids, function (qty, pId) {
				inputs[pTable + ':' + pId] = {
				    table: table,
				    typeId: id
				};
			    }.bind(this));
			}.bind(this));
		    }

		}.bind(this));
	    }.bind(this));
	}.bind(this));
	each(inputs, function (obj, key) {
	    chain[key] = obj;
	    this._getProducedByChainRecursive(key.split(':')[0], key.split(':')[1], chain[key], depth + 1);
	}.bind(this));
	return chain;
    },

    _outputChainRecursive: function (chain, depth = 0, list = null, used = {}, parentId = null, html = false) {
	if (html) {
	    var wrap = ul({
		class: 'chain depth-' + depth
	    });
	}

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
		if (html) {
		    var item = li({
			'class': 'chain-item'
		    });
		    var type = this.builder.getType(key.split(':')[1], key.split(':')[0]);
		    var model = new fs_Model(type, {height: 30, width: 30});
		    item.adopt(model);
		    var pby = div();
		    item.adopt(pby);
		    model.toElement().addEvent('click', function (e) {
			if (item.hasClass('active')) {
			    item.removeClass('active');
			    pby.empty();
			} else {
			    item.addClass('active');
			    pby.adopt(div({html: 'Produced By:'}));
			    pby.adopt(this._buildProducedBy(key.split(':')[0], key.split(':')[1], {}, html));

			}
		    }.bind(this));
		    item.adopt(this._outputChainRecursive(chain[key], depth + 1, list, used, key.split(':')[1]));
		    wrap.adopt(item);
		} else {
		    this._outputChainRecursive(chain[key], depth + 1, list, used, key.split(':')[1]);
		}
	    }.bind(this));
	}
	if (html) {
	    return wrap;
    }
    },

    _inputChainRecursive: function (chain, depth = 0, list = null, used = {}, totals = {}, parentId = null, html = false) {
	if (html) {
	    var wrap = ul({
		class: 'chain depth-' + depth
	    });
	}
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

		var pqty = {};
		var rqty = {};
		this._buildProducedBy(key.split(':')[0], key.split(':')[1], pqty);
		this._buildRequiredBy(key.split(':')[0], key.split(':')[1], rqty, parentId);

		if (html) {
		    var item = li({
			'class': 'chain-item'
		    });

		    var type = this.builder.getType(key.split(':')[1], key.split(':')[0]);
		    var model = new fs_Model(type, {height: 30, width: 30});
		    item.adopt(model);
		    var pby = div();
		    item.adopt(pby);

		    model.toElement().addEvent('click', function (e) {
			if (item.hasClass('active')) {
			    item.removeClass('active');
			    pby.empty();
			} else {
			    item.addClass('active');
			    pby.adopt(div({html: 'Required By:'}));
			    pby.adopt(this._buildRequiredBy(key.split(':')[0], key.split(':')[1], {}, parentId, html));
			    pby.adopt(div({html: 'Produced By:'}));
			    pby.adopt(this._buildProducedBy(key.split(':')[0], key.split(':')[1], {}, html));
			}
		    }.bind(this));
		}

		each(pqty, function (permin, lvl) {
		    !totals[lvl] && (totals[lvl] = 0);
		    totals[lvl] += permin * rqty[lvl];
		});
		used[key].push({
		    table: chain.table,
		    typeId: chain.typeId,
		    qty: rqty
		});
		if (html) {
		    item.adopt(this._inputChainRecursive(chain[key], depth + 1, list, used, totals, key.split(':')[1], html));
		    wrap.adopt(item);
		} else {
		    this._inputChainRecursive(chain[key], depth + 1, list, used, totals, key.split(':')[1], html)
		}

	    }.bind(this));
	}
	if (html) {
	    return wrap;
    }
    },

    _buildRequiredBy: function (table, id, lvlqtys = {}, parentId = null, html = false) {
	if (html) {
	    var wrap = div({class: 'producedBy'});
	}

	var pBy = this.getRequiredBy(table, id);
	if (!Object.keys(pBy)[0]) {
	    if (html) {
		return wrap;
	    } else {
		return;
	    }
	}

	var lvllists = {};
	each(pBy, function (pByTypes, pByTable) {
	    lvllists[pByTable] = {};
	    each(pByTypes, function (pByCalcedProduceValsList, pByTypeId) {
		lvllists[pByTable][JSON.encode(this.builder.getUpgradeList(pByTable, pByTypeId))] = true;
	    }.bind(this));
	}.bind(this));
	var tbl;
	if (html) {
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
	each(lvllists, function (lists, listTable) {
	    each(lists, function (bool, list) {
		var row = [];
		list = JSON.decode(list);
		var first;
		if (html) {
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
				avg += pByCalcedProduceVals.value.input[table][id].qty;
				hasAsOutput = true;
			    }
			}.bind(this));
			avg = avg / pBy[listTable][typeid].length;
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
	    foot.push({properties: {class: 'valCol'}, content: lvlqtys[level].toFixed(lvlqtys[level] < 1 ? 2 : 0)});
	});
	if (html) {
	    tbl.set('headers', headers);
	    tbl.pushMany(rows);
	    tbl.push(foot);
	    wrap.adopt(tbl.toElement());
	    return wrap;
	} else {
	    return;
    }
    },

    _buildProducedBy: function (table, id, lvlavg = {}, html = false) {
	if (html) {
	    var wrap = div({class: 'producedBy'});
	}

	var pBy = this.getProducedBy(table, id);
	if (!Object.keys(pBy)[0]) {
	    if (html) {
		return wrap;
	    } else {
		return;
	    }
	}

	var lvllists = {};
	each(pBy, function (pByTypes, pByTable) {
	    lvllists[pByTable] = {};
	    each(pByTypes, function (pByCalcedProduceValsList, pByTypeId) {
		lvllists[pByTable][JSON.encode(this.builder.getUpgradeList(pByTable, pByTypeId))] = true;
	    }.bind(this));
	}.bind(this));
	var tbl;
	if (html) {
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
	//var lvlavg = [];
	var lvlavgcnt = {};
	each(lvllists, function (lists, listTable) {
	    each(lists, function (bool, list) {
		var row = [];
		list = JSON.decode(list);

		var first;
		if (html) {
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
			    vals = vals + pByCalcedProduceVals.value.output[this.table][id].permin + '/';
			    !lvlavgcnt[level] && (lvlavgcnt[level] = 0);
			    !lvlavg[level] && (lvlavg[level] = 0)
			    lvlavgcnt[level] += 1;
			    lvlavg[level] += pByCalcedProduceVals.value.output[this.table][id].permin * 1;
			}.bind(this));
			if (html) {
			    if (vals)
				vals = vals.slice(0, vals.length - 1);
			    row.push({
				content: (vals * 1).toFixed(2) || ' ',
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
	    'Per Min Divisor'
	];

	each(lvlavg, function (total, level) {
	    lvlavg[level] = lvlavgcnt[level] / lvlavg[level];
	    foot.push({properties: {class: 'valCol'}, content: lvlavg[level].toFixed(lvlavg[level] < 1 ? 2 : 0)});
	});

	if (html) {
	    tbl.set('headers', headers);
	    tbl.pushMany(rows);
	    tbl.push(foot);
	    wrap.adopt(tbl.toElement());
	    return wrap;
	} else {
	    return;
    }
    },

    _calcProduceVals: function (produce) {
	var totalInput = 0;
	var totalOutput = 0;

	if (typeOf(produce.value.input) == 'object') {
	    each(produce.value.input, function (ids, pTable) {
		each(ids, function (qty, pId) {
		    totalInput += qty * 1;
		}.bind(this));
	    }.bind(this));
	}
	if (typeOf(produce.value.output) == 'object') {
	    each(produce.value.output, function (ids, pTable) {
		each(ids, function (qty, pId) {
		    totalOutput += qty * 1;
		}.bind(this));
	    }.bind(this));
	}

	var calcedProduceVals = {
	    value: {
		input: {},
		inputTotalQty: 0,
		output: {},
		outputTotalQty: 0
	    }
	};
	if (typeOf(produce.value.input) == 'object') {
	    each(produce.value.input, function (ids, pTable) {
		calcedProduceVals.value.input[pTable] = {};
		each(ids, function (qty, pId) {
		    calcedProduceVals.value.input[pTable][pId] = {
			qty: qty * 1,
			time: produce.value.time * 1,
			permin: (60000 / produce.value.time) * qty,
			'%tot': ((qty / totalInput) * 100).toFixed(0),
			'%out': ((qty / totalOutput) * 100).toFixed(0)
		    };
		    calcedProduceVals.value.inputTotalQty += qty * 1;
		}.bind(this));
	    }.bind(this));
	}
	if (typeOf(produce.value.output) == 'object') {
	    each(produce.value.output, function (ids, pTable) {
		calcedProduceVals.value.output[pTable] = {};
		each(ids, function (qty, pId) {
		    calcedProduceVals.value.output[pTable][pId] = {
			qty: qty * 1,
			time: produce.value.time * 1,
			permin: (60000 / produce.value.time) * qty,
			'%tot': ((qty / totalOutput) * 100).toFixed(0),
			'%in': ((qty / totalInput) * 100).toFixed(0)
		    };
		    calcedProduceVals.value.outputTotalQty += qty * 1;
		}.bind(this));
	    }.bind(this));
	}

	return calcedProduceVals;
    },

    buildTechTree: function () {
	var wrap = div({
	    class: 'chain-wrap'
	});
	var tree;
	wrap.adopt(this._getTechTreeRecursive(null, 0, tree = {}, true));
	return wrap;
    },
    _getTechTreeRecursive: function (typeId = 0, depth = 0, tree = {}, html = false) {
	if (html) {
	    var wrap = ul({
		class: 'chain depth-' + depth
	    });
	}
	if (!typeId) {
	    //find tech with no build requirements
	    each(this.builder.options.types.tech_tree, function (type, tId) {
		if (tId === 0) {
		    return;
		}
		if (type.options && type.options.buildReq && typeId != tId) {

		} else {
		    if (!html) {
			this._getTechTreeRecursive(tId, depth + 1, tree, html);
		    } else {
			var item = li({class: 'chain-item'});
			var w = div({
			    class: 'produce-type',
			    title: this.builder.options.types["tech_tree"][tId]["name"]
			});
			w.adopt(new fs_Model(type, {height: 60, width: 60}));
			w.adopt(div({
			    class: 'produce-type-name',
			    html: this.builder.options.types["tech_tree"][tId]["name"]
			}));
			item.adopt(w);
			item.adopt(this._getTechTreeRecursive(tId, depth + 1, tree, html));
			wrap.adopt(item);
		    }
		}
	    }.bind(this));
	} else {
	    each(this.builder.options.types.tech_tree, function (type, tId) {
		if (tId === 0) {
		    return;
		}
		each(type.options.buildReq, function (req, index) {
		    each(req, function (ids, buildReqTable) {
			if (buildReqTable == 'tech_tree' && this.builder.options.types[buildReqTable] && ids[0] == typeId) {
			    if (html) {
				var type = this.builder.getType(tId, "tech_tree");
				var item = li({class: 'chain-item'});
				var w = div({
				    class: 'produce-type',
				    title: this.builder.options.types["tech_tree"][tId]["name"]
				});
				w.adopt(new fs_Model(type, {height: 60, width: 60}));
				w.adopt(div({
				    class: 'produce-type-name',
				    html: this.builder.options.types["tech_tree"][tId]["name"]
				}));
				item.adopt(w);
				item.adopt(this._getTechTreeRecursive(tId, depth + 1, tree, html));
				wrap.adopt(item);
			    }
			}
		    }.bind(this));
		}.bind(this));
	    }.bind(this));
	}
	if (html) {
	    return wrap;
    }
    }
});
