var fs_TypeOptionsBuilder = new Class({
    Implements: [Options],
    cont: null,
    windows: [],
    copyObj: {},
    saving: false,
    activatedOptTab: {},
    activatedSubcat: {},
    activatedLvlTab: {},
    upHeir: {},
    upTypes: {},
    allUpTypes: {},
    mountPositions: [
	"topLeft",
	"bottomLeft",
	"centerLeft",
	"topRight",
	"bottomRight",
	"centerRight",
	"centerTop",
	"centerBottom",
	"center"
    ],
    platformTypes: ['e', 'p', 's', 'd', 'h'],
    options: {
	action: 'update_options',
	table: null,
	id: null,
	saved: {}
    },
    initialize: function (options) {
	this.setOptions(options);

	this.cont = div({
	    class: 'builder type-options-wrap'
	});
	$('optionbuilder').adopt(this.cont);

	this.cont.adopt(new fs_Button({
	    class: "type-options-save",
	    icon: "migrate",
	    html: "Save",
	    events: {
		click: this.save.bind(this)
	    }
	}));

	this.cont.adopt(new fs_Button({
	    class: "type-options-refresh",
	    icon: "image-rotate",
	    html: "Refresh",
	    events: {
		click: this.refresh.bind(this)
	    }
	}));

	this.contInt = div({
	    class: 'type-options-int'
	});
	this.cont.adopt(this.contInt);

	this.refresh();

    },

    toElement: function () {
	return this.cont;
    },

    refresh: function (e = null) {
	inTotalsCache = {};
	outChainCache = {};
	e && e.stop();
	this.contInt.empty();

	this.parseHash();

	this.allUpTypes = {};
	var origtable = this.options.table;
	each(this.options.types, function (types, table) {
	    if (!this.allUpTypes[table]) {
		this.allUpTypes[table] = {};
	    }
	    this.options.table = table;
	    this.buildUpTypesArr();
	    this.allUpTypes[table] = Object.clone(this.upTypes);

	}.bind(this));
	this.options.table = origtable;
	this.upTypes = Object.clone(this.allUpTypes[this.options.table]);


	this.contInt.adopt(this.buildTopBar());
	this.contInt.adopt(this.buildTypeLevelList());

    },

    parseHash: function () {
	var hash = tokenizeHash();
	if (hash.table) {
	    this.options.table = hash.table;
	}
	if (hash.tableOpts) {
	    this.options.tableOpts = hash.table;
	}
	if (hash.id) {
	    this.options.id = hash.id;
	}
    },

    save: function (e = null) {
	e && e.stop();
	if (this.saving) {
	    return;
	}
	this.saving = true;
	new Request.JSON({
	    url: this.options.ajaxurl,
	    onSuccess: function (resp) {
		this.saving = false;
		if (!resp) {
		    alert('Empty Response');
		} else if (resp.success) {
		    this.options.onSuccess && this.options.onSuccess(resp);
		} else if (resp.success == false) {
		    alert((function () {
			var ret = '';
			resp.validate.errors.each(function (err) {
			    ret += err.title + ': ' + err.value + "\n";
			});
			return ret;
		    })());
		}
	    }.bind(this),
	    onError: function (xhr) {
		this.saving = false;
	    }.bind(this),
	    onFailure: function (xhr) {
		this.saving = false;
	    }.bind(this)
	}).post({
	    action: 'update_options',
	    options: JSON.stringify(this.options)
	});

    },

    getType: function (typeId, table = null) {
	!table && (table = this.options.table);
	var type = this.options.types[table][typeId];
	if (typeOf(type.options) != 'object') {
	    type.options = {};
	}
	return type
    },

    getLevelHeir: function (upFrom, levelHeir = {}, depth = 0) {
	var upTo;
	this.options.types[this.options.table].each(function (type, index) {
	    if (index === 0 || typeOf(type.options) != 'object' || typeOf(type.options.upTo) != 'array' || typeOf(type.options.upTo[0]) != 'object') {
		return;
	    }
	    var checkUpTo = type.options.upTo[0][Object.keys(type.options.upTo[0])[0]] * 1;
	    if (upFrom == checkUpTo) {
		upTo = index;
	    }
	}.bind(this));
	if (upTo) {
	    levelHeir[upTo] = {};
	    depth++;
	    this.getLevelHeir(upTo, levelHeir[upTo], depth);
    }
    },

    flattenHeir: function (arr, levelHeir) {
	if (levelHeir && levelHeir[Object.keys(levelHeir)[0]]) {
	    arr.push(Object.keys(levelHeir)[0]);
	    this.flattenHeir(arr, levelHeir[Object.keys(levelHeir)[0]]);
	}
	return arr;
    },

    buildUpTypesArr: function () {
	//load all types that don't have an upto value set
	//these are considered the max level for the type
	var upHeir;

	upHeir = {};
	this.options.types[this.options.table].each(function (type, index) {
	    if (index != 0 && (typeOf(type.options) != 'object' || typeOf(type.options.upTo) != 'array' || typeOf(type.options.upTo[0]) != 'object')) {
		upHeir[index] = {};
		this.getLevelHeir(index, upHeir[index]);
	    }
	}.bind(this));

	this.upTypes = {};
	each(upHeir, function (typeIdHeir, fromIdx) {
	    var types = [];
	    types = this.flattenHeir(types, typeIdHeir);
	    types.reverse();
	    types.push(fromIdx);
	    var t = this.options.types[this.options.table][fromIdx];
	    var sc = t.type + t.category + t.subcat;
	    if (typeOf(this.upTypes[sc]) != 'array') {
		this.upTypes[sc] = [];
	    }
	    this.upTypes[sc].push(types);
	}.bind(this));
    },

    getUpgradeList: function (table, id) {
	var list;
	each(this.allUpTypes[table], function (uplists, sc) {
	    uplists.each(function (uplist) {
		if (uplist.indexOf(id) > -1) {
		    list = uplist;
		}
	    }.bind(this));
	}.bind(this));
	return list;
    },

    getTableList: function () {
	return Object.keys(this.options.availableOptions);
    },

    getProducedBy: function (typeTable, typeId) {
	var pBy = {};
	each(this.options.types, function (types, table) {
	    each(types, function (type, id) {
		if (typeOf(type.options) != 'object') {
		    return;
		}
		if (typeOf(type.options.produce) != 'object' && typeOf(type.options.produce) != 'array') {
		    return;
		}

		each(type.options.produce,function (produce, pidx) {
		    if (typeOf(produce.value.output) != 'object') {
			return;
		    }
		    var calc = this.calcProduceVals(produce);
		    each(produce.value.output, function (pids, pTable) {
			each(pids, function (qty, pId) {
			    if (pTable == typeTable && pId == typeId) {
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
	each(this.options.types, function (types, table) {
	    each(types, function (type, id) {
		if (typeOf(type.options) != 'object') {
		    return;
		}
		if (typeOf(type.options.produce) != 'object' && (typeOf(type.options.produce) != 'array')) {
		    return;
		}

		each(type.options.produce,function (produce, pidx) {
		    if (typeOf(produce.value.output) != 'object') {
			return;
		    }
		    var calc = this.calcProduceVals(produce);
		    each(produce.value.input, function (pids, pTable) {
			each(pids, function (qty, pId) {
			    if (pTable == typeTable && pId == typeId) {
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

    getProduceChain: function (typeTable, typeId, chain = {}, depth = 0) {
	var outputs = {};
	each(this.options.types, function (types, table) {
	    each(types, function (type, id) {
		if (typeOf(type.options) != 'object') {
		    return;
		}
		if (typeOf(type.options.produce) != 'array') {
		    return;
		}

		type.options.produce.each(function (produce, pidx) {

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
	    this.getProduceChain(key.split(':')[0], key.split(':')[1], chain[key], depth + 1);
	}.bind(this));
	return chain;
    },

    getProducedByChain: function (typeTable, typeId, chain = {}, depth = 0) {
	var inputs = {};
	each(this.options.types, function (types, table) {
	    each(types, function (type, id) {
		if (typeOf(type.options) != 'object') {
		    return;
		}
		if (typeOf(type.options.produce) != 'object' && (typeOf(type.options.produce) != 'array') || /Splitter/.test(type.name)) {
		    return;
		}

		type.options.produce.each(function (produce, pidx) {

		    var isProdBy = false;
		    each(produce.value.output, function (pids, pTable) {
			each(pids, function (qty, pId) {
			    if (typeTable == pTable && pId == typeId) {
				isProdBy = true;
			    }
			}.bind(this));
		    }.bind(this));

		    if (isProdBy) {
			var calc = this.calcProduceVals(produce);
			each(produce.value.input, function (pids, pTable) {
			    each(pids, function (qty, pId) {
				//if (typeOf(outputs[pTable + ':' + pId]) != 'object') {
				inputs[pTable + ':' + pId] = {
				    table: table,
				    typeId: id
				};
				//}
			    }.bind(this));
			}.bind(this));
		    }

		}.bind(this));
	    }.bind(this));
	}.bind(this));
	each(inputs, function (obj, key) {
	    chain[key] = obj;
	    this.getProducedByChain(key.split(':')[0], key.split(':')[1], chain[key], depth + 1);
	}.bind(this));
	return chain;
    },

    calcProduceVals: function (produce) {
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

    addAvailableOptionsSet: function (table, newOptionsSetName) {
	if (typeOf(this.options.availableOptions[table]) == 'array' && typeOf(this.options.availableOptions[table][newOptionsSetName]) == 'array') {
	    alert('already exists');
	    return false;
	} else {
	    if (typeOf(this.options.availableOptions) == 'array') {
		this.options.availableOptions = {};
	    }
	    if (typeOf(this.options.availableOptions[table]) != 'object') {
		this.options.availableOptions[table] = {};
	    }
	    this.options.availableOptions[table][newOptionsSetName] = [];
	    this.refresh();
	    return true;
	}
    },

    setAvailableOptions: function (table, name, optTypes = []) {
	this.options.availableOptions[table][name] = optTypes;
	this.refresh();
    },

    buildTopBar: function () {
	var wrap = div({class: 'topbar-wrap'});
	var ulElm = ul({class: 'tables'});
	each(this.options.availableOptions, function (tableOpts, table) {
	    var liElm = li({class: 'table'});
	    ulElm.adopt(liElm);
	    var name = new fs_Button({
		html: table + ' ' + (this.options.types[table].length - 1),
		icon: 'edit',
		events: {
		    click: function () {
			location.hash = '#table=' + table;
			this.refresh();
		    }.bind(this),
		    contextmenu: function (e) {
			var context = {};
			var hasUpTo;
			if (this.options.availableOptions[table]) {
			    each(this.options.availableOptions[table], function (curOpt, idx) {
				if (idx == 'upTo') {
				    hasUpTo = true;
				}
				context[fs_Icon('edit') + ' ' + idx + ': ' + curOpt] = function (e) {
				    getOptMultipleSelect(this.options.optionsTree, curOpt, function (optlist) {
					var opts = [];
					each(optlist, function (elm) {
					    opts.push(elm.value);
					}.bind(this));
					this.setAvailableOptions(table, idx, opts);
					return true;
				    }.bind(this));
				}.bind(this);
			    }.bind(this));
			}
			context[fs_Icon('plus') + 'Add Option Set'] = function () {
			    getUserString({
				title: 'Add New Option Set',
				label: 'Name'
			    }, function (value) {
				getOptMultipleSelect(this.options.optionsTree, [], function (optlist) {
				    var opts = [];
				    each(optlist, function (elm) {
					opts.push(elm.value);
				    }.bind(this));
				    this.addAvailableOptionsSet(table, value);
				    this.setAvailableOptions(table, value, opts);
				    return true;
				}.bind(this));
				return true;
			    }.bind(this));
			}.bind(this);

			context[fs_Icon('plus') + ' Add New ' + table] = function () {
			    getRenameType(this.options.types, table, {}, function (vals) {
				this.options.types[table].push({
				    name: vals.name,
				    type: vals.type,
				    category: vals.category,
				    subcat: vals.subcat,
				});
				this.refresh();
			    }.bind(this));
			}.bind(this);

			openContextMenu(e, context);
			e.stop();
		    }.bind(this)
		}
	    });
	    liElm.adopt(name);
	    if (this.options.table == table) {
		name.toElement().addClass('active');
	    }
	}.bind(this));
	wrap.adopt(ulElm);
	return wrap;

    },

    buildTypeLevelList: function () {
	if (!this.options.table)
	    return;
	var wrap = div({class: "type-list-wrap"});
	var listing = div({class: 'type-list-listing'});
	var heir = getTypeHeirarchy(this.options.types[this.options.table]);

	var typesUl = ul({class: 'type-list'});
	wrap.adopt(div({class: 'subcat-title', html: this.options.table}));
	each(heir, function (cats, type) {
	    var typeLi = li({
		class: 'type-list-type',
		html: '<span>' + type + '</spaa>'
	    });
	    typesUl.adopt(typeLi);

	    var catUl = ul({class: 'types-type'});
	    typeLi.adopt(catUl);
	    each(cats, function (subcats, cat) {
		var catLi = li({
		    class: 'type-list-cat',
		    html: '<span>' + cat + '</spaa>'
		});
		catUl.adopt(catLi);

		var subcatUl = ul({class: 'types-subcats'});
		catLi.adopt(subcatUl);
		each(subcats, function (types, subcat) {
		    var subcatLi = li({
			class: 'type-list-subcat',
		    });
		    var title;
		    subcatLi.adopt(title = span({
			html: subcat + ' (' + Object.keys(types).length + ')'
		    }));
		    subcatUl.adopt(subcatLi);

		    title.addEvent('contextmenu', function (e) {
			openContextMenu(e, this.getTypeCatSubcatContext(type, cat, subcat));
			e.stop();
		    }.bind(this));

		    title.addEvent('click', function () {
			each(typesUl.getElements('.active'), function (elm) {
			    elm.removeClass('active');
			});
			listing.empty();

			this.activatedSubcat[this.options.table] = [];

			this.activatedSubcat[this.options.table].push(type + cat + subcat);
			title.addClass('active');
			var levelList = this.allUpTypes[this.options.table][type + cat + subcat];
			listing.adopt(div({class: 'subcat-title', html: subcat}));
			each(levelList, function (levels, sc) {
			    each(levels, function (typeId, level) {
				var item = div({class: 'types-item-wrap'});
				listing.adopt(item);
				item.adopt(this.buildTypeItem(this.options.table, typeId));
			    }.bind(this));
			}.bind(this));

		    }.bind(this));
		    if (this.activatedSubcat[this.options.table] && this.activatedSubcat[this.options.table].indexOf(type + cat + subcat) > -1) {
			title.fireEvent('click');
		    }
		}.bind(this));
	    }.bind(this));
	}.bind(this));
	wrap.adopt(typesUl);
	wrap.adopt(listing);
	if (this.options.table == "tech_tree") {
	    wrap.adopt(new fs_Chain(this).buildTechTree());
	}
	return wrap;
    },

    buildTypesLink: function (table, linkText, upgradeList) {
	var link = div({
	    class: 'subcat-context-link',
	    html: fs_Icon('edit') + ' ' + linkText,
	    events: {
		click: function (e) {
		    new fs_MultiProduceEditor(this, table, upgradeList, function () {
			this.refresh();
		    }.bind(this)).open();
		    e.stop();
		}.bind(this)
	    }
	});
	return link;
    },

    getTypeCatSubcatContext: function (typeStr, cat, subcat) {
	var context = [];

	context[fs_Icon('edit') + ' type: ' + typeStr] = function () {
	    getUserString({
		title: 'Type ' + typeStr,
		value: typeStr,
		label: 'New Type Name'
	    }, function (newtype) {
		if (newtype) {
		    each(this.getTypesBySubcat(this.options.table, typeStr, cat, subcat), function (type, typeId) {
			type.type = newtype;
		    }.bind(this));
		    this.refresh();
		    return true;
		}
		return false;
	    }.bind(this));
	}.bind(this);

	context[fs_Icon('edit') + ' cat: ' + cat] = function () {
	    getUserString({
		title: 'Category ' + cat,
		value: cat,
		label: 'New Categoy'
	    }, function (newcategory) {
		if (newcategory) {
		    each(this.getTypesBySubcat(this.options.table, typeStr, cat, subcat), function (type, typeId) {
			type.category = newcategory;
		    }.bind(this));
		    this.refresh();
		}
	    }.bind(this));
	}.bind(this);

	context[fs_Icon('edit') + ' subcat: ' + subcat] = function () {
	    getUserString({
		title: 'SubCat ' + subcat,
		value: subcat,
		label: 'New Sub Categoy'
	    }, function (newsubcat) {
		if (newsubcat) {
		    each(this.getTypesBySubcat(this.options.table, typeStr, cat, subcat), function (type, typeId) {
			type.subcat = newsubcat;
		    }.bind(this));
		    this.refresh();
		}
	    }.bind(this));
	}.bind(this);

	context[fs_Icon('format-gallery') + ' Clone All'] = function (e) {
	    getUserString({
		title: 'Clone Subcat Types',
		value: subcat,
		label: 'New Subcat Name'
	    }, function (newsubcat) {
		if (newsubcat) {
		    var lvls = this.getTypesBySubcat(this.options.table, typeStr, cat, subcat);
		    var list = this.getUpgradeList(this.options.table, Object.keys(lvls)[0]);
		    each(list, function (typeId, level) {
			var clone = Object.clone(this.options.types[this.options.table][typeId]);
			var newTypeId = this.options.types[this.options.table].length;
			clone.subcat = newsubcat;
			if (clone.options && clone.options.upTo && clone.options.upTo[0]) {
			    clone.options.upTo[0][Object.keys(clone.options.upTo[0])[0]] = newTypeId + 1;
			}
			this.options.types[this.options.table].push(clone);
		    }.bind(this));
		    this.refresh();
		}
	    }.bind(this));
	}.bind(this)

	each(this.options.availableOptions[this.options.table], function (optList, optType) {
	    if (optType == 'model' || optType == 'upTo') {
		return;
	    }
	    context[fs_Icon('edit') + ' ' + optType] = function () {
		if (optType == 'produce') {
		    var lvls = this.getTypesBySubcat(this.options.table, typeStr, cat, subcat);
		    var list = this.getUpgradeList(this.options.table, Object.keys(lvls)[0]);
		    new fs_MultiProduceEditor(this, this.options.table, list, function () {
			this.refresh();
		    }.bind(this)).open();
		}
		if (optType == 'buildCost') {
		    var lvls = this.getTypesBySubcat(this.options.table, typeStr, cat, subcat);
		    var list = this.getUpgradeList(this.options.table, Object.keys(lvls)[0]);
		    new fs_BuildCostBuilder(this, this.options.table, list, function () {
			this.refresh();
		    }.bind(this)).open();
		}
		if (optType == 'buildReq') {
		    var lvls = this.getTypesBySubcat(this.options.table, typeStr, cat, subcat);
		    var list = this.getUpgradeList(this.options.table, Object.keys(lvls)[0]);
		    new fs_BuildReqBuilder(this, this.options.table, list, function () {
			this.refresh();
		    }.bind(this)).open();
		}
	    }.bind(this);
	}.bind(this));



	return context
    },

    getTypesByType: function (table, typeStr) {
	var list = {};
	each(this.options.types[table], function (type, typeId) {
	    if (type.type == typeStr) {
		list[typeId] = type;
	    }
	});
	return list;
    },

    getTypesByCategory: function (table, typeStr, category) {
	var list = {};
	each(this.options.types[table], function (type, typeId) {
	    if (type.type == typeStr && type.category == category) {
		list[typeId] = type;
	    }
	});
	return list;
    },

    getTypesBySubcat: function (table, typeStr, category, subcat) {
	var list = {};
	each(this.options.types[table], function (type, typeId) {
	    if (type.type == typeStr && type.category == category && type.subcat == subcat) {
		list[typeId] = type;
	    }
	});
	return list;
    },

    buildTypeItem: function (table, typeId) {
	var wrap = new HtmlTable({
	    properties: {
		class: "type-item"
	    }
	});

	var type = this.options.types[table][typeId];
	!type.options && (this.options.types[table][typeId].options = {});

	var titlebar = div({
	    class: 'item-title-bar'
	});
	var title;
	titlebar.adopt(title = div({
	    html: type['name'] + ' ' + fs_Icon('edit'),
	    events: {
		click: function () {
		    getRenameType(this.options.types, table, type, function (vals) {
			this.options.types[table][typeId]["name"] = vals.name;
			this.options.types[table][typeId]["type"] = vals.type;
			this.options.types[table][typeId]["category"] = vals.category;
			this.options.types[table][typeId]["subcat"] = vals.subcat;
			this.refresh();
		    }.bind(this));
		}.bind(this)
	    }
	}));
	titlebar.adopt(new fs_Button({
	    class: 'clone-type',
	    icon: 'format-gallery',
	    events: {
		click: function () {
		    getUserString({
			title: 'New ' + table + ' Name',
			value: this.options.types[this.options.table][typeId]['name'],
			label: 'Name'
		    }, function (value) {
			this.options.types[this.options.table].push(Object.clone(this.options.types[this.options.table][typeId]));
			this.options.types[this.options.table][this.options.types[this.options.table].length - 1]["name"] = value;
			this.refresh();
		    }.bind(this));
		}.bind(this)
	    }
	}));

	var row = [];

	var editModelFunc = function (e) {
	    if (table == 'satellite') {
		new fs_LayoutBuilder(this, type.options.model, function (value) {
		    if (value) {
			this.options.types[table][typeId].options.model = value;
			this.refresh();
		    }
		}.bind(this));
	    } else {
		new fs_ModelBuilder(this, type.options.model, function (value) {
		    if (value) {
			this.options.types[table][typeId].options.model = value;
			this.refresh();
		    }
		}.bind(this));
	    }
	}.bind(this);

	var model = new fs_Model(type);
	if (model && model.toElement) {
	    model.toElement().addEvent('click', editModelFunc);
	    model.toElement().addEvent('contextmenu', function (e) {
		var context = {};
		context[fs_Icon('admin-page') + ' Copy Model'] = function () {
		    this.copyObj['model'] = type.options.model;
		}.bind(this);
		if (this.copyObj['model']) {
		    context[fs_Icon('excerpt-view') + ' Paste Model'] = function () {
			this.options.types[table][typeId].options.model = Array.clone(this.copyObj['model']);
			this.refresh();
		    }.bind(this);
		}
		openContextMenu(e, context);
		e.stop();
	    }.bind(this));
	    row.push({
		content: model.toElement(),
		properties: {
		    class: "item-model"
		}
	    });
	}

	row.push({
	    content: this.buildTypeItemOptions(table, typeId, type),
	    properties: {
		class: "item-opts"
	    }
	});
	if (table == 'resource') {
	    row.push(new fs_Chain(this, table, typeId).getTabs());
	}

	wrap.setHeaders([
	    {
		content: titlebar,
		colspan: row.length,
		properties: {
		    colspan: row.length,
		    class: 'item-head'
		}
	    }
	]);
	wrap.push(row);
	wrap.setFooters([
	    {
		content: div({
		    html: '<span>' + type["type"] + ' / ' + type["category"] + ' / ' + type["subcat"] + '</span>'
		}),
		properties: {
		    colspan: row.length,
		    class: 'item-foot'
		}
	    }
	]);

	return wrap.toElement();
    },

    buildTypeItemOptions: function (table, typeId) {
	var type = this.options.types[table][typeId];
	var wrap = div({
	    class: 'item-options',
	    events: {
		click: function (e) {
		    e.stop();
		}
	    }
	});
	if (typeOf(type.options) != 'object') {
	    type.options = {};
	}

	var tabs = new fs_Tabs({
	    tabChanged: function (tab, panel, tabIndex) {
		if (!this.activatedOptTab[table]) {
		    this.activatedOptTab[table] = {};
		}
		this.activatedOptTab[table][typeId] = tabIndex;
	    }.bind(this)
	});
	var tabCount = 0;
	each(this.options.availableOptions[table], function (opts, typeOpt) {
	    var panel;
	    switch (true) {
		case typeOpt == "produce":
		    panel = this.buildProduceOption(table, typeId, type.options[typeOpt]);
		    break;
		case typeOpt == "buildCost":
		    panel = this.buildBuildCostOption(table, typeId, type.options[typeOpt]);
		    break;
		case typeOpt == "buildReq":
		    panel = this.buildBuildReqOption(table, typeId, type.options[typeOpt]);
		    break;
		case typeOpt == "upTo":
		    panel = this.buildUpToOption(table, typeId, type.options[typeOpt]);
		    break;
		case typeOpt == "mounts":
		    panel = this.buildMountsOption(table, typeId, type.options[typeOpt]);
		    break;
		case typeOpt == "model":
		    break;
		default:
		    panel = this.buildOptTypeList(table, typeId, typeOpt, type.options[typeOpt]);
		    break;
	    }
	    if (panel) {
		var tabIndex = tabCount;
		var tab = tabs.add({label: typeOpt}, panel);
		tab.addEvent('dblclick', function () {
		    each(this.options.types[table], function (thetype, theindex) {
			if (thetype.type == type.type && thetype.category == type.category) { //&& thetype.subcat == type.subcat
			    if (!this.activatedOptTab[table]) {
				this.activatedOptTab[table] = {};
			    }
			    this.activatedOptTab[table][theindex] = this.activatedOptTab[table][typeId];
			}
		    }.bind(this));
		    this.refresh();
		}.bind(this));
		tab.addEvent('contextmenu', function (e) {
		    var context = {};
		    context[fs_Icon('admin-page') + ' Copy'] = function (e) {
			this.copyObj[typeOpt] = Array.clone(this.options.types[table][typeId].options[typeOpt]);
		    }.bind(this);
		    if (this.copyObj[typeOpt]) {
			context[fs_Icon('excerpt-view') + ' Paste'] = function (e) {
			    if (typeOf(this.options.types[table][typeId].options) != 'object') {
				this.options.types[table][typeId].options = {};
			    }
			    this.options.types[table][typeId].options[typeOpt] = Array.clone(this.copyObj[typeOpt]);
			    this.refresh();
			}.bind(this);
			context[fs_Icon('excerpt-view') + ' Paste All ' + typeOpt] = function (e) {
			    each(this.options.types[table], function (thetype, theindex) {
				if (thetype.type == type.type && thetype.category == type.category && thetype.subcat == type.subcat) {
				    if (typeOf(this.options.types[table][theindex].options) != 'object') {
					this.options.types[table][theindex].options = {};
				    }
				    this.options.types[table][theindex].options[typeOpt] = Array.clone(this.copyObj[typeOpt]);
				    if (!this.activatedOptTab[table]) {
					this.activatedOptTab[table] = {};
				    }
				    this.activatedOptTab[table][theindex] = tabIndex;
				}
			    }.bind(this));

			    this.refresh();
			}.bind(this);
		    }
		    context[fs_Icon('no') + ' Clear'] = function (e) {
			if (confirm('Clear ' + typeOpt)) {
			    delete this.options.types[table][typeId].options[typeOpt];
			    this.refresh();
			}
		    }.bind(this);
		    openContextMenu(e, context);
		    e.preventDefault();
		    e.stop();
		}.bind(this));
		tabCount++;
	    }
	}.bind(this));
	if (this.activatedOptTab[table] && this.activatedOptTab[table][typeId]) {
	    tabs.activate(this.activatedOptTab[table][typeId] * 1);
	} else {
	    tabs.activate(0);
	}

	wrap.adopt(tabs);
	return wrap;
    },

    buildMountsOption: function (table, index, mounts) {
	var wrap = div({
	    class: 'mounts-wrap'
	});
	var mountPoints = {};

	this.mountPositions.each(function (mp) {
	    mountPoints[mp] = div({
		class: 'mount-point',
	    });
	    setMountPosition(mountPoints[mp], mp);
	    each(mounts, function (mount, idx) {
		if (mount.position == mp) {
		    mountPoints[mp].addClass('used');
		}
	    }.bind(this));

	    mountPoints[mp].addEvent('click', function (e) {
		var name;
		var mountIdx = -1;
		each(mounts, function (mount, idx) {
		    if (mount.position == mp) {
			name = mount.mount;
			mountIdx = idx;
		    }
		}.bind(this));
		getUserString({
		    title: 'Mount Name',
		    label: 'Name',
		    value: name
		}, function (newname) {
		    if (newname) {
			if (mountIdx > -1) {
			    this.options.types[table][index].options.mounts[mountIdx].mount = newname;
			    this.refresh();
			    return true;
			} else {
			    if (typeOf(this.options.types[table][index].options.mounts) != 'array') {
				this.options.types[table][index].options.mounts = [];
			    }
			    this.options.types[table][index].options.mounts.push({
				mount: newname,
				position: mp
			    });
			    this.refresh();
			    return true;
			}
		    } else if (mountIdx > -1) {
			this.options.types[table][index].options.mounts.splice(mountIdx, 1);
			this.refresh();
			return true;
		    }
		    return false;
		}.bind(this));
	    }.bind(this));
	    wrap.adopt(mountPoints[mp]);
	}.bind(this));
	return wrap;
    },

    buildUpToOption: function (table, typeId, upTo) {
	var changeup = function (e) {
	    getIDSelect(this.options.types, table, typeId, 0, function (tbl, id) {
		if (id && tbl) {
		    if (!this.options.types[table].options) {
			this.options.types[table].options = {};
		    }
		    var up = {};
		    up[tbl] = id;
		    this.options.types[table][typeId].options.upTo = [up];
		    this.refresh();
		    return true;
		}
		return false;
	    }.bind(this));
	}.bind(this);

	var wrap = div({class: 'upTo-wrap'});
	if (upTo) {
	    var type = Object.keys(upTo[0])[0];
	    var typeid = upTo[0][type];

	    wrap.adopt(new fs_Button({
		html: 'Upgrades to:<br/>' + this.options.types[type][typeid]["name"],
		icon: 'edit',
		events: {
		    click: changeup
		}
	    }));
	    wrap.adopt(new fs_Button({
		icon: 'no',
		events: {
		    click: function (e) {
			if (confirm('Remove Upgrade?')) {
			    delete this.options.types[table][typeId].options["upTo"];
			    this.refresh();
			}
		    }.bind(this)
		}
	    }));
	} else {
	    wrap.adopt(new fs_Button({
		html: 'Upgrades to?',
		icon: 'edit',
		events: {
		    click: changeup
		}
	    }));
	}
	return wrap;
    },

    buildProduceOption: function (table, typeId, produce) {
	var pin, time, pout;
	var prodTbl = new HtmlTable({
	    properties: {
		class: 'produce',
		width: '100%'
	    },
	    headers: ['IN', 'TIME', 'OUT']
	});

	if (produce) {
	    each(produce,function (prod, idx) {
		if (!prod["produce"]) {
		    return;
		}
		pin = new Element('div');
		time = new Element('div')
		pout = new Element('div');
		var p = prod["value"];
		if (p.input) {
		    each(p.input, function (tables, tbl) {
			each(tables, function (qty, id) {
			    var w = div({
				class: 'produce-type',
				title: this.options.types[tbl][id]["name"]
			    });
			    var m = new fs_Model(this.options.types[tbl][id],{height:75,width:75})
			    w.adopt(m);
			    w.addEvent('click', function (e) {
				getUserString({
				    title: this.options.types[tbl][id]["name"],
				    label: 'Quantity'
				}, function (newqty) {
				    if (newqty) {
					this.options.types[table][typeId].options.produce[idx].value.input[tbl][id] = newqty;
					this.refresh();
				    }
				}.bind(this));
			    }.bind(this));
			    w.adopt(div({
				class: 'produce-type-qty',
				html: '<span>' + qty + '</span>'
			    }));
			    w.adopt(div({
				class: 'produce-type-name',
				html: this.options.types[tbl][id]["name"]
			    }));
			    pin.adopt(w);
			}.bind(this));
		    }.bind(this));
		}
		if (p.output) {
		    each(p.output, function (tables, tbl) {
			each(tables, function (qty, id) {
			    var w = div({
				class: 'produce-type',
				title: this.options.types[tbl][id]["name"]
			    });
			    var m = new fs_Model(this.options.types[tbl][id],{height:75,width:75})
			    w.adopt(m);
			    w.addEvent('click', function (e) {
				getUserString({
				    title: this.options.types[tbl][id]["name"],
				    label: 'Quantity'
				}, function (newqty) {
				    if (newqty) {
					this.options.types[table][typeId].options.produce[idx].value.output[tbl][id] = newqty;
					this.refresh();
				    }
				}.bind(this));
			    }.bind(this));
			    w.adopt(div({
				class: 'produce-type-name',
				html: '<span>' + this.options.types[tbl][id].name + '</span>'
			    }));
			    w.adopt(div({
				class: 'produce-type-qty',
				html: '<span>' + qty + '</span>'
			    }));
			    pout.adopt(w);
			}.bind(this));
		    }.bind(this));
		}
		prodTbl.push([pin, {
			content: (new fs_Button({
			    html: new fs_Time({ms: p.time, icon: true}),
			    icon: 'edit',
			    events: {
				click: function (e) {
				    this.openProduceEditor(table, typeId, idx, prod, function (value) {
					if (value) {
					    this.options.types[table][typeId].options.produce[idx] = value;
					    this.refresh();
					}
				    }.bind(this));
				    e.stopPropagation();
				}.bind(this)
			    }
			})).toElement()
		    }, pout]);
	    }.bind(this));
	}

	prodTbl.push([' ', {
		content: editButton({}, function () {
		    new fs_MultiProduceEditor(this, table, this.getUpgradeList(table, typeId), function () {
			this.refresh();
		    }.bind(this)).open();
		}.bind(this)).toElement()
	    }, ' ']);

	return div({class: 'produce-wrap'}).adopt([div({
		class: 'produce-title',
	    }), prodTbl]);
    },

    openProduceEditor: function (table, typeId, idx, produce, callback) {
	var clone = Object.clone(produce);
	if (!clone || !produce) {
	    clone = {
		produce: 'New',
		value: {}
	    };
	}
	if (this.win && this.win.close) {
	    this.win.close();
	}
	if (this.produceWin && this.produceWin.close) {
	    this.produceWin.close();
	}
	var wrap = div({
	    class: 'produce-editor'
	});


	var ep = div({
	    class: 'edit-produce'
	});
	var nameInput;
	var refresh = function () {
	    ep.empty();
	    var input, output, time;

	    var pTable = new HtmlTable({
		properties: {
		    class: 'produce-table',
		    width: '100%'
		},
		rows: [[{
			    content: [new Element('span', {html: 'Name: '}), nameInput = new Element('input', {
				    value: clone.produce,
				    events: {
					keyup: function () {
					    clone.produce = nameInput.value
					}
				    }
				})],
			    properties: {
				colspan: 3
			    }
			}],
		    [
			{
			    content: (new fs_Button({
				class: '',
				html: 'Add Input',
				icon: 'plus',
				iconPos: 'after',
				events: {
				    click: function () {
					getIDSelect(this.options.types, table, typeId, 0, function (tbl, idx, qty) {
					    if (qty) {
						if (!clone['value'].input) {
						    clone['value'].input = {};
						}
						if (!clone['value'].input[tbl]) {
						    clone['value'].input[tbl] = {};
						}
						clone['value'].input[tbl][idx] = qty;
						refresh();
					    }
					}.bind(this));
				    }.bind(this)
				}
			    })).toElement()
			},
			fs_Icon('clock') + ' Time ' + fs_Icon('arrow-right'),
			{
			    content: (new fs_Button({
				class: '',
				html: 'Add Output',
				icon: 'plus',
				iconPos: 'after',
				events: {
				    click: function () {
					getIDSelect(this.options.types, table, typeId, 0, function (tbl, idx, qty) {
					    if (qty) {
						if (!clone['value'].output) {
						    clone['value'].output = {};
						}
						if (!clone['value'].output[tbl]) {
						    clone['value'].output[tbl] = {};
						}
						clone['value'].output[tbl][idx] = qty;
						refresh();
					    }
					}.bind(this));
				    }.bind(this)
				}
			    })).toElement()
			}
		    ],
		    [
			{
			    content: input = div({
				class: 'container-input'
			    })
			},
			{
			    content: time = div({
				class: 'container-time'
			    })
			},
			{
			    content: output = div({
				class: 'container-output'
			    })
			}
		    ]]
	    });
	    ep.adopt(pTable);
	    time.adopt(editButton({}, function () {
		getUserString({
		    title: 'Time',
		    label: 'Time'
		}, function (qty) {
		    if (qty) {
			clone['value']["time"] = qty;
			refresh();
		    }
		}.bind(this));
	    }.bind(this), '<br/>' + (clone['value'].time || '0') + '<br/>' + fs_Icon('arrow-right')));

	    if (clone['value'].input) {
		each(clone['value'].input, function (types, table) {
		    if (table == 'time') {
			return;
		    }
		    each(types, function (qty, typeid) {
			var itemwrap = div({
			    class: 'produce-type'
			});
			itemwrap.adopt(new fs_Model(this.options.types[table][typeid]).toElement());
			itemwrap.adopt(div({
			    class: 'produce-type-name',
			    html: this.options.types[table][typeid]["name"]
			}));
			itemwrap.adopt(div({
			    class: 'produce-type-qty',
			    html: qty
			}));
			itemwrap.addEvent('click', function () {
			    getUserString({
				title: 'Quantity',
				label: 'Quantity'
			    }, function (newqty) {
				if (newqty) {
				    if (!clone['value'].input) {
					clone['value'].input = {};
				    }
				    if (!clone['value'].input[table]) {
					clone['value'].input[table] = {};
				    }
				    clone['value'].input[table][typeid] = newqty;
				    refresh();
				}
			    }.bind(this));
			}.bind(this));
			var context = [];
			itemwrap.addEvent('contextmenu', function (e) {
			    openContextMenu(e, context);
			    e.stop();
			}.bind(this));
			context[fs_Icon('no') + ' Remove'] = function () {
			    delete clone['value'].input[table][typeid];
			    refresh();
			}.bind(this);
			input.adopt(itemwrap);
		    }.bind(this));
		}.bind(this));
	    }

	    if (clone['value'].output) {
		each(clone['value'].output, function (types, table) {
		    each(types, function (qty, typeid) {
			var itemwrap = div({
			    class: 'produce-type'
			});
			itemwrap.adopt(new fs_Model(this.options.types[table][typeid]).toElement());
			itemwrap.adopt(div({
			    class: 'produce-type-name',
			    html: this.options.types[table][typeid]["name"]
			}));
			itemwrap.adopt(div({
			    class: 'produce-type-qty',
			    html: qty
			}));
			itemwrap.adopt(new fs_Button({
			    html: qty,
			    icon: 'edit',
			    events: {
				click: function () {
				    getUserString({
					title: this.options.types[table][typeid]["name"],
					label: 'Quantity'
				    }, function (newqty) {
					if (newqty) {
					    if (!clone['value'].output) {
						clone['value'].output = {};
					    }
					    if (!clone['value'].output[table]) {
						clone['value'].output[table] = {};
					    }
					    clone['value'].output[table][typeid] = newqty;
					    refresh();
					}
				    }.bind(this));
				}.bind(this)
			    }
			}));
			itemwrap.addEvent('click', function () {
			    getUserString({
				title: 'Quantity',
				label: 'Quantity'
			    }, function (newqty) {
				if (newqty) {
				    if (!clone['value'].output) {
					clone['value'].output = {};
				    }
				    if (!clone['value'].output[table]) {
					clone['value'].output[table] = {};
				    }
				    clone['value'].output[table][typeid] = newqty;
				    refresh();
				}
			    }.bind(this));
			}.bind(this));
			var context = [];
			itemwrap.addEvent('contextmenu', function (e) {
			    openContextMenu(e, context);
			    e.stop();
			}.bind(this));
			context[fs_Icon('no') + ' Remove'] = function () {
			    delete clone['value'].input[table][typeid];
			    refresh();
			}.bind(this);
			input.adopt(itemwrap);

			output.adopt(itemwrap);
		    }.bind(this));
		}.bind(this));
	    }

	}.bind(this);
	refresh();
	wrap.adopt(ep);

	this.produceWin = new fs_Window({
	    title: "Production Editor",
	    body: wrap,
	    buttons: [
		(new fs_Button({
		    html: 'Cancel',
		    icon: 'no',
		    events: {
			click: function () {
			    this.produceWin.close();
			}.bind(this)
		    }
		})).toElement(),
		(new fs_Button({
		    html: 'Delete',
		    icon: 'no',
		    events: {
			click: function () {
			    if (confirm('Delete?')) {
				this.options.types[table][typeId].options.produce.splice(idx, 1);
				this.produceWin.close();
				this.refresh();
			    }
			}.bind(this)
		    }
		})).toElement(),
		(new fs_Button({
		    html: 'Reset',
		    icon: 'image-rotate',
		    events: {
			click: function () {
			    clone = Object.clone(ep);
			    refresh();
			}.bind(this)
		    }
		})).toElement(),
		(new fs_Button({
		    html: 'Clear',
		    icon: 'layout',
		    events: {
			click: function () {
			    clone['value'] = {};
			    refresh();
			}.bind(this)
		    }
		})).toElement(),
		(new fs_Button({
		    html: 'Save',
		    icon: 'yes',
		    events: {
			click: function () {
			    if (clone.produce) {
				this.produceWin.close(callback(clone));
			    } else {
				nameInput.focus();
			    }
			}.bind(this)
		    }
		})).toElement()
	    ]
	});
	this.produceWin.open();
    },

    buildBuildCostOption: function (table, typeId, typeOpt, optsList) {
	var wrap = div({class: 'optTypeList'});
	wrap.adopt(new fs_BuildCostBuilder(this, table, this.getUpgradeList(table, typeId), function () {
	    this.refresh();
	}.bind(this)).buildBuildCost(table, typeId, true));
	return wrap;
    },

    buildBuildReqOption: function (table, typeId, typeOpt, optsList) {
	var wrap = div({class: 'optTypeList'});
	wrap.adopt(new fs_BuildReqBuilder(this, table, this.getUpgradeList(table, typeId), function () {
	    this.refresh();
	}.bind(this)).buildBuildReq(table, typeId));
	return wrap;
    },

    buildOptTypeList: function (table, typeId, typeOpt, optsList) {
	var wrap = div({class: 'optTypeList'});
	if (typeOf(optsList) == 'array') {
	    each(optsList, function (optObj, optListIndex) {
		wrap.adopt(this.buildOptListItem({
		    type: Object.keys(optObj)[0],
		    opts: optObj,
		    save: function (newOptValue) {
			if (newOptValue) {
			    this.options.types[table][typeId].options[typeOpt][optListIndex] = newOptValue;
			    this.refresh();
			}
		    }.bind(this),
		    remove: function () {
			this.options.types[table][typeId].options[typeOpt].splice(optListIndex, 1);
			this.refresh();
		    }.bind(this)
		}));
	    }.bind(this));
	}
	wrap.adopt(div({}));
	wrap.adopt(addButton({}, function () {
	    getOptSelect(this.options.availableOptions[table][typeOpt], function (optTreeType) {
		if (optTreeType) {
		    this.openOptionEditor(optTreeType, {}, function (newOpt) {
			if (newOpt) {
			    if (typeOf(this.options.types[table][typeId].options[typeOpt]) != 'array') {
				this.options.types[table][typeId].options[typeOpt] = [];
			    }
			    this.options.types[table][typeId].options[typeOpt].push(newOpt);
			    this.refresh();
			    return true;
			}
			return false;
		    }.bind(this));
		    return true;
		}
		return false;
	    }.bind(this));
	}.bind(this), 'New ' + typeOpt));
	return wrap;
    },

    /**
     *
     * @param {typeStr} o Options Object
     *	type : what type to load from this.options.optionTree
     *	opts : the current values for the object being loaded
     *	save : callback when save is clicked
     *	remove: callback when delete is clicked
     * @returns {Node|Element}
     */
    buildOptListItem: function (o) {
	var wrap = div({
	    class: 'optionListItem'
	});
	var tbl;
	var modelHolder;
	each(this.options.optionsTree[o.type], function (optValue, optKey) {
	    if (optKey == "name") {
		tbl = new HtmlTable({
		    properties: {
			width: '100%'
		    },
		    headers: [{
			    content: modelHolder = div({
				//html: '<span>' + optValue + ': ' + o.opts[o.type] + '</span>'
			    }),
			    properties: {
				colspan: 2
			    }
			}]
		});
		return;
	    }
	    var valWrap, keyWrap;

	    tbl.push([
		{
		    content: keyWrap = div({

		    })
		},
		{
		    content: valWrap = div({

		    })
		}
	    ]);

	    switch (true) {
		case optKey == 'id':
		    modelHolder.adopt(div({html: this.options.types[optValue][o.opts[optValue]].name}));
		    modelHolder.adopt(new fs_Model(this.options.types[optValue][o.opts[optValue]]));
		    break;

		default:
		    keyWrap.set('html', optKey);
		    valWrap.set('html', o.opts[optKey]);
		    break;
	    }
	}.bind(this));
	wrap.adopt(tbl);
	wrap.addEvent('click', function () {
	    this.openOptionEditor(o.type, o.opts, function (newOpt) {
		if (newOpt) {
		    o.save(newOpt);
		}
	    }.bind(this));
	}.bind(this))
	return wrap;
    },

    openOptionEditor: function (optTreeType, currentVals, callback) {
	var clone = currentVals && Object.clone(currentVals) || {};
	var wrap = div({class: 'window-option-editor'});
	var refresh = function () {
	    wrap.empty();
	    each(this.options.optionsTree[optTreeType], function (val, key) {
		var optElm;
		var cb = function (newval, name = '') {
		    if (key == 'id') {
			clone['id'] = name,
				clone[val] = newval;
		    } else {
			clone[key] = newval;
		}
		}.bind(this);
		switch (true) {
		    case key == "name":
//			optElm = div({
//			    class: 'option-name',
//			    html: val
//			});
			break;
		    case val == "number":
			optElm = this.buildNumberEditor(key, clone[key], cb);
			break;
		    case val == "src":
			optElm = this.buildSrcEditor(key, clone[key], cb);
			break;
		    case val == "boolean":
			optElm = this.buildBooleanEditor(key, clone[key], cb);
			break;
		    case key == "id":
			optElm = this.buildIdEditor(val, clone, cb);
			break;
		    default:
			optElm = this.buildDefaultEditor(key, clone[key], cb);
			break;
		}
		if (optElm) {
		    wrap.adopt(optElm);
		}
	    }.bind(this));
	}.bind(this);
	refresh();
	var win = new fs_Window({
	    title: optTreeType + ' editor',
	    body: new HtmlTable({
		properties: {
		    class: 'window-table'
		},
		rows: [[wrap]]
	    }).toElement(),
	    buttons: [
		cancelButton({}, function () {
		    win.close();
		}),
		okButton({html: "Save"}, function () {
		    win.close(callback(clone));
		})
	    ]
	});
	win.open();
    },

    buildNumberEditor: function (optLabel, currentVal, callback) {
	var wrap = div({
	    class: 'option-input-wrap type-number'
	});
	wrap.adopt(div({
	    class: 'type-number-label',
	    html: optLabel
	}));
	var input = null;
	wrap.adopt(div({
	    class: 'type-number-value'
	}));
	wrap.adopt(input = new Element('input', {
	    type: 'number',
	    value: currentVal,
	    events: {
		keyup: function (e) {
		    callback(input.value);
		}.bind(this)
	    }
	}));
	return wrap;
    },

    buildIdEditor: function (optLabel, currentVal, callback) {
	var wrap = div({
	    class: 'option-input-wrap type-id'
	});
	wrap.adopt(div({
	    class: 'option-group-item-label',
	    html: "ID",
	    events: {
		click: function () {

		}.bind(this)
	    }
	}));
	var input;

	wrap.adopt((div({
	    class: 'type-def-value'
	})).adopt(input = new Element('input', {
	    type: 'text',
	    placeholder: 'Name for Identification',
	    value: currentVal && currentVal["id"],
	    events: {
		change: function (e) {
		    callback(ids, input.value);
		}.bind(this)
	    }
	})));
	wrap.adopt(new Element('br'));

	wrap.adopt(div({
	    class: 'option-group-item-label',
	    html: optLabel,
	    events: {
		click: function () {

		}.bind(this)
	    }
	}));
	var ids = [];
	var select = new Element('select', {
	    events: {
		change: function (e) {
		    var sel = select.getSelected();
		    if (sel[0]) {
			val.empty();
			sel.each(function (opt, index) {
			    ids.push(opt.value * 1);
			});

			val.adopt(select);
			if (ids[0]) {
			    wrap.adopt(new fs_Model(this.options.types[optLabel][sel[0].value]));
			}
		    } else {
			ids = null;
		    }
		    callback(ids, input.value);
		}.bind(this)
	    }
	});
	select.adopt(new Element('option'));
	this.options.types[optLabel].each(function (type, index) {
	    if (index === 0) {
		return;
	    }
	    var option = new Element('option', {
		html: type["name"],
		value: index
	    });
	    if (currentVal && typeOf(currentVal[optLabel]) == 'array' && currentVal[optLabel].indexOf(index) > -1) {
		option.setProperty("selected", "true");
	    }
	    select.adopt(option);
	}.bind(this));
	var val = div({
	    class: 'option-group-item-value',
	});
	val.adopt(select);
	if (currentVal && typeOf(currentVal) == 'array') {
	    wrap.adopt(new fs_Model(this.options.types[optLabel][currentVal]));
	}

	wrap.adopt(val);
	return wrap;
    },

    buildSrcEditor: function (optLabel, currentVal, callback) {
	var wrap = div({
	    class: 'option-input-wrap type-src'
	});
	wrap.adopt(div({
	    class: 'type-src-label',
	    html: optLabel
	}));

	var select = new Element('select', {
	    events: {
		change: function (e) {
		    img.src = CONFIG.root_url + '/' + select.getSelected()[0].value;
		    callback(select.getSelected()[0].value);
		}.bind(this)
	    }
	});
	select.adopt(new Element('option'));
	each(this.options.images[this.options.table], function (image, imgname) {
	    var option = new Element('option', {
		html: imgname,
		value: image.src
	    });
	    if (currentVal && currentVal == image.src) {
		option.setProperty("selected", "true");
	    }
	    select.adopt(option);
	}.bind(this));
	var img = null;
	if (currentVal) {
	    img = new Element('img', {
		src: CONFIG.root_url + '/' + currentVal
	    });
	}
	var val = div({
	    class: 'type-src-value'
	});
	var imgLink;
	val.adopt(imgLink = span({
	    class: 'open-image-link',
	    html: fs_Icon('edit') + ' Choose Image ',
	    events: {
		click: function () {
		    this.openImagePicker(currentVal, function (newimg) {
			//imgLink.setHtml(fs_Icon('edit') + ' ' + newimg);
			img.src = CONFIG.root_url + '/' + newimg;
			callback(newimg);
		    }.bind(this));
		}.bind(this)
	    }
	}).adopt(img));
	wrap.adopt(val);

	return wrap;
    },

    buildDefaultEditor: function (optLabel, currentVal, callback) {
	var wrap = div({
	    class: 'option-input-wrap type-def'
	});
	wrap.adopt(div({
	    class: 'type-def-label',
	    html: optLabel
	}));
	var input = '';
	wrap.adopt((div({
	    class: 'type-def-value'
	})).adopt(input = new Element('input', {
	    type: 'text',
	    value: currentVal,
	    events: {
		keyup: function (e) {
		    callback(input.value);
		}.bind(this)
	    }
	})));
	return wrap;
    },

    buildBooleanEditor: function (optLabel, currentVal, callback) {
	var wrap = div({
	    class: 'option-input-wrap type-def'
	});
	wrap.adopt(div({
	    class: 'option-group-item-label',
	    html: optLabel
	}));
	var input = '';
	wrap.adopt((div({
	    class: 'option-group-item-value'
	})).adopt(input = new Element('input', {
	    type: 'checkbox',
	    value: 1,
	    events: {
		change: function (e) {
		    callback(input.checked);
		}.bind(this)
	    }
	})));
	if (currentVal) {
	    input.checked = true;
	}
	return wrap;

    },

    buildDefaultEditor: function (optLabel, currentVal, callback) {
	var wrap = div({
	    class: 'option-input-wrap type-def'
	});
	wrap.adopt(div({
	    class: 'type-def-label',
	    html: optLabel
	}));
	var input = '';
	wrap.adopt((div({
	    class: 'type-def-value'
	})).adopt(input = new Element('input', {
	    type: 'text',
	    value: currentVal,
	    events: {
		keyup: function (e) {
		    callback(input.value);
		}.bind(this)
	    }
	})));
	return wrap;
    },

    openImagePicker: function (currentVal, callback) {
	var table, imageName;
	if (currentVal) {
	    table = currentVal.split('/')[1];
	    imageName = currentVal.split('/')[2];
	} else {
	    table = this.options.table;
	}
	var wrap = div({class: 'image-picker-wrap'});
	var tables = div({class: 'image-picker-tables'});
	var imagesElm = div({class: 'image-picker-images'});

	var tblList = ul();
	tables.adopt(tblList);
	each(this.options.images, function (images, tbl) {
	    var tblItem = li({
		class: (table == tbl ? 'active' : ''),
		html: '<span>' + tbl + '</span> (' + Object.keys(images).length + ')',
		events: {
		    click: function (e) {
			each(tblList.getElements('.active'), function (elm) {
			    elm.removeClass('active');
			});
			tblItem.addClass('active');
			imagesElm.empty();
			var imgList = ul();
			imagesElm.adopt(imgList);
			each(images, function (image, name) {
			    var imgItem = li({
				class: (image.src == currentVal ? 'active' : ''),
				events: {
				    click: function (e) {
					each(imagesElm.getElements('.active'), function (elm) {
					    elm.removeClass('active');
					});
					imgItem.addClass('active');
					currentVal = image.src;
				    }.bind(this)
				}
			    });
			    imgList.adopt(imgItem);
			    imgItem.adopt(new Element('img', {
				src: CONFIG.root_url + '/' + image.src
			    }))
			}.bind(this));
		    }.bind(this)
		}
	    });
	    if (tbl == table) {
		tblItem.fireEvent('click');
	    }
	    tblList.adopt(tblItem);
	}.bind(this));

	var htmTable = new HtmlTable({
	    rows: [
		[
		    {
			content: tables,
			properties: {
			    class: 'tables-td'
			}
		    },
		    {
			content: imagesElm,
			properties: {
			    class: 'images-td'
			}
		    }
		]
	    ]
	});
	wrap.adopt(htmTable.toElement());


	var win = new fs_Window({
	    title: 'Image Select',
	    body: wrap,
	    buttons: [
		cancelButton({}, function () {
		    win.close();
		}.bind(this)),
		okButton({}, function () {
		    callback(currentVal);
		    win.close();
		}.bind(this))
	    ]
	});
	win.open();
    }
});