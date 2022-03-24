
var fs_TypeEditor = new Class({
    builder: null,
    table: null,
    typeId: null,
    type: null,
    cont: null,

    initialize: function (builder, table, typeId) {
	this.builder = builder;
	this.table = table;
	this.typeId = typeId;
	this.type = this.builder.getType(typeId, table);

	this.cont = div({
	    class: 'fs_Type'
	});
	this.cont.adopt(new fs_Model(this.type).toElement());

	return this;
    },

    toElement: function () {
	return cont;
    },

    producedBy: function () {
	var pBy = {};
	each(this.builder.options.types, function (types, table) {
	    each(types, function (type, id) {
		if (typeOf(type.options) != 'object') {
		    return;
		}
		if (typeOf(type.options.produce) != 'array' && typeOf(type.options.produce) != 'object') {
		    return;
		}

		type.options.produce.each(function (produce, pidx) {
		    if (typeOf(produce.value.output) != 'object') {
			return;
		    }
		    var calc = this.calcProduceVals(produce);

		    each(produce.value.output, function (pids, pTable) {
			each(pids, function (qty, pId) {
			    if (pTable == this.table && pId == this.typeId) {
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

    requiredBy: function () {
	var rBy = {};
	each(this.builder.options.types, function (types, table) {
	    each(types, function (type, id) {
		if (typeOf(type.options) != 'object') {
		    return;
		}
		if (typeOf(type.options.produce) != 'array' && typeOf(type.options.produce) != 'object') {
		    return;
		}

		type.options.produce.each(function (produce, pidx) {
		    if (typeOf(produce.value.output) != 'object') {
			return;
		    }
		    var calc = this.calcProduceVals(produce);

		    each(produce.value.input, function (pids, pTable) {
			each(pids, function (qty, pId) {
			    if (pTable == this.table && pId == this.typeId) {
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
});