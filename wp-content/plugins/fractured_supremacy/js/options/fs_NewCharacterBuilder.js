var newCharacterBuilder = new Class({
    Implements: [Events, Options],
    editing: {}, //holds the var for reopening the platform editor
    cont: Class.empty,
    options: {
	action: 'update_newuser'
    },
    initialize: function (options) {
	this.setOptions(options);
	this.cont = $('newCharacterBuilder');

	this.addResButton = addButton({html: 'Add Resource'}, function (e) {
	    this.getTypeSelect('resource', function (resid) {
		if (resid) {
		    this.getUserString({
			title: 'Item Quantity',
			label: 'qty'
		    }, function (qty) {
			this.options.newchar.resource[resid] = qty;
			this.refresh();
		    }.bind(this));
		}
	    }.bind(this));
	}.bind(this));

	this.cont.adopt(this.addResButton);

	this.addItemButton = addButton({html: 'Add Item'}, function (e) {
	    this.getTypeSelect('item', function (itemid) {
		if (itemid) {
		    this.getUserString({
			title: 'Item Quantity',
			label: 'qty'
		    }, function (qty) {
			this.options.newchar.item[itemid] = qty;
			this.refresh();
		    }.bind(this));
		}
	    }.bind(this));
	}.bind(this));
	this.cont.adopt(this.addItemButton);

	this.addCOButton = addButton({html: 'Add Celestial Object'}, function () {
	    this.getTypeSelect('celestial_object', function (coid) {
		if (coid) {
		    this.options.newchar.celestial_object.push({
			"id": coid * 1,
			satellite: []
		    });
		    this.refresh();
		}
	    }.bind(this));
	}.bind(this));
	this.cont.adopt(this.addCOButton);

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

	this.int = new Element('div', {
	    class: 'interior'
	});

	this.cont.adopt(this.int);
	this.refresh();

    },
    save: function () {
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
	    action: this.options.action,
	    newchar: JSON.stringify(this.options.newchar)
	});

    },
    toElement: function () {
	return this.cont;
    },
    refresh: function () {
	this.int.empty();

	var resources = new Element('div', {
	    class: 'nub_resource',
	    html: '<span>Resources</span>'
	});
	this.int.adopt(resources);
	if (typeOf(this.options.newchar.resource) != 'object') {
	    this.options.newchar.resource = {};
	}
	Object.each(this.options.newchar.resource, function (qty, id) {
	    var res = new Element('div', {
	    });
	    res.adopt(new fs_Model(this.options.types.resource[id], {"size": 20}));
	    res.adopt(new Element('div', {
		html: this.options.types.resource[id].name + ': ' + qty
	    }));
	    res.adopt(new Element('div', {
		class: 'button delete-button',
		html: fs_Icon('no') + ' ',
		events: {
		    click: function () {
			delete this.options.newchar.resource[id];
			this.refresh();
		    }.bind(this)
		}
	    }));
	    resources.adopt(res);
	}.bind(this));

	var items = new Element('div', {
	    class: 'nub_item',
	    html: '<span>Items</span>'
	});
	this.int.adopt(items);

	if (typeOf(this.options.newchar.item) != 'object') {
	    this.options.newchar.item = {};
	}
	Object.each(this.options.newchar.item, function (qty, id) {
	    var item = new Element('div', {

	    });
	    item.adopt(new fs_Model(this.options.types.item[id], {"size": 20}));
	    item.adopt(new Element('div', {
		html: this.options.types.item[id].name + ': ' + qty
	    }));
	    item.adopt(new Element('div', {
		class: 'button delete-button',
		html: fs_Icon('no') + '',
		events: {
		    click: function () {
			delete this.options.newchar.item[id];
			this.refresh();
		    }.bind(this)
		}
	    }));
	    items.adopt(item);
	}.bind(this));


	var COs = new Element('div', {
	    class: 'nub_celestial_objects',
	    html: '<span>Celestial Objects</span>'
	});
	this.int.adopt(COs);

	if (typeOf(this.options.newchar.celestial_object) != 'array') {
	    this.options.newchar.celestial_object = [];
	}
	this.options.newchar.celestial_object.each(function (c, coindex) {
	    if (!c) {
		delete this.options.newchar["celestial_object"][coindex];
		return;
	    }
	    var co = this.getCelestialObject(c, coindex);
	    COs.adopt(co);

	    if (!c.satellite) {
		return;
	    }
	    c.satellite.each(function (s, satindex) {
		if (!s) {
		    delete this.options.newchar["celestial_object"][coindex]["satellite"][satindex];
		    return;
		}
		var sat = this.getSatellite(c, coindex, s, satindex);
		co.adopt(sat);
	    }.bind(this));
	}.bind(this));

    },
    getTypeSelect: function (type, callback) {
	var values = [];
	this.options.types[type].each(function (t, id) {
	    if (id === 0) {
		return;
	    }
	    values.push({
		name: t.name,
		value: id
	    });
	}.bind(this));
	values.sort((a, b) => (a.name > b.name) ? 1 : -1);
	this.getUserSelect({
	    title: 'Choose ' + type,
	    label: type,
	    values: values
	}, function (id) {
	    if (id) {
		callback(id);
	    }
	}.bind(this));
    },

    getUserSelect: function (options, callback) {
	if (this.win && this.win.close) {
	    this.win.close();
	}
	var select = new Element('select', {
	    id: 'userselect',
	});
	options.values.each(function (v) {
	    select.adopt(new Element('option', {
		html: v.name,
		value: v.value
	    }));
	});
	this.win = new fs_Window({
	    parent: $$('body'),
	    title: options.title,
	    body: new HtmlTable({
		width: '100%',
		properties: {
		    class: 'window-table'
		},
		rows: [[options.label, select]]
	    }).toElement(),
	    buttons: [
		cancelButton({}, function () {
		    this.win.close();
		}.bind(this)),
		okButton({}, function () {
		    this.win.close(callback(select.value));
		}.bind(this))
	    ]
	});
	this.win.open();
	select.focus();
    },
    getUserString: function (options, callback) {
	if (this.win && this.win.close) {
	    this.win.close();
	}
	var input = new Element('input', {
	    id: 'userstring',
	    type: 'text',
	    value: options.value || ''
	});
	this.win = new fs_Window({
	    parent: $$('body'),
	    title: options.title,
	    body: new HtmlTable({
		width: '100%',
		properties: {
		    class: 'window-table'
		},
		rows: [[options.label, input]]
	    }).toElement(),
	    buttons: [
		cancelButton({}, function () {
		    this.win.close();
		}.bind(this)),
		okButton({}, function () {
		    this.win.close(callback(input.value));
		}.bind(this))
	    ]
	});
	this.win.open();
	input.focus();
    },

    getCelestialObject: function (c, coindex) {
	var co = new Element('div', {
	    class: 'nub_celestial_object',
	    //html: '<span>Celestial Object</span>'
	});
	co.adopt(new fs_Model(this.options.types.celestial_object[c.id], {"size": 20}));
	co.adopt(new Element('div', {
	    html: this.options.types.celestial_object[c.id].name + ' (celestial_object:' + c.id + ')'
	}));

	var buttWrap = new Element('div', {
	    class: 'button-wrapper'
	});

	buttWrap.adopt(deleteButton({}, function () {
	    delete this.options.newchar.celestial_object[coindex];
	    this.refresh();
	}.bind(this), ''));
	buttWrap.adopt(addButton({}, function () {
	    this.getTypeSelect('satellite', function (id) {
		this.options.newchar.celestial_object[coindex].satellite.push({
		    id: id,
		    platform: []
		});
		this.refresh();
	    }.bind(this));
	}.bind(this), 'Satellite'));
	co.adopt(buttWrap);
	return co;
    },
    getSatellite: function (c, coindex, s, satindex) {
	var sat = new Element('div', {
	    class: 'nub_satellite',
	    //html: 'Satellites'
	});

	sat.adopt(new Element('div', {
	    html: this.options.types.satellite[s.id].name + ' (satellite:' + s.id + ')'
	}));

	//sat.adopt(new fs_Model(this.options.types.satellite[s.id], {"size": 20}));
	var l = null;
	sat.adopt(l = new Element('div', {
	    class: 'edit-layout'
	}));
	var layout = getOption(this.options.types["satellite"][s.id], "model", "layout", "primary");
	layout["value"].each(function (cols, y) {
	    var r = new Element('div', {
		class: 'layout-row'
	    });
	    l.adopt(r);
	    cols.each(function (cell, x) {
		var c = new Element('div', {
		    class: 'layout-cell layout-cell-' + cell,
		    html: cell
		});
		r.adopt(c);
		var pobj = this.getPlatformByXY(s, y, x);
		var image = getOption(this.options.types.platform[pobj && pobj.plat && pobj.plat.id], 'model', 'image', 'bg');
//		debugger;
		if (image && image["value"]) {
		    c.style.backgroundImage = 'url(' + CONFIG["root_url"] + image["value"] + ')';
		    c.style.backgroundSize = 'cover';
		    c.style.color = '#ffffff';
		    c.addEvent('click', function () {
			this.editing = {
			    coindex: coindex,
			    satindex: satindex,
			    x: x,
			    y: y
			};
			this.platwin && this.platwin.close();
			this.platwin = new fs_Window({
			    parent: $$('body'),
			    title: 'Edit Platform',
			    body: this.getPlatform(c, coindex, s, satindex, pobj.plat, pobj.index),
			    close: function () {

			    }.bind(this),
			    buttons: [
				deleteButton({}, {html: 'Delete Platform'}, function () {
				    delete this.options.newchar.celestial_object[coindex].satellite[satindex].platform[pobj.id];
				    this.platwin && this.platwin.close();
				    this.editing = {};
				    this.refresh();
				}.bind(this)),

				cancelButton({}, {html: 'Close'}, function () {
				    this.platwin.close();
				    this.editing = {};
				}.bind(this)),

				addButton({html: 'Building'}, function (e) {
				    this.getTypeSelect('building', function (id) {
					this.options.newchar.celestial_object[coindex].satellite[satindex].platform[pobj.index].building.push({
					    id: id,
					    inhabitant: []
					});
					debugger;
					this.refresh();
				    }.bind(this));
				}.bind(this))
			    ]
			});
			this.platwin.open();
		    }.bind(this));
		    if (coindex === this.editing.coindex && satindex === this.editing.satindex && x === this.editing.y && y === this.editing.x) {
			c.fireEvent('click', new Event('click'));
		    }
		} else {
		    if (cell != 'e') {
			c.addEvent('click', function () {
			    this.editing = {
				coindex: coindex,
				satindex: satindex,
				x: x,
				y: y
			    };
			    this.getTypeSelect('platform', function (id) {
				this.options.newchar.celestial_object[coindex].satellite[satindex].platform.push({
				    id: id,
				    x: x,
				    y: y,
				    building: []
				});
				this.refresh();
			    }.bind(this));
			}.bind(this));
		    }
		}
		//c.adopt()
	    }.bind(this));
	}.bind(this));

	var buttWrap = new Element('div', {
	    class: 'button-wrapper'
	});

	buttWrap.adopt(deleteButton({html: 'Delete'}, function () {
	    delete this.options.newchar.celestial_object[coindex].satellite[satindex];
	    this.platwin && this.platwin.close();
	    this.editing = {};
	    this.refresh();
	}.bind(this)));

	sat.adopt(new Element('div'));
	sat.adopt(buttWrap);
	return sat;
    },
    getPlatformByXY: function (s, y, x) {
	if (typeOf(s["platform"]) !== "array") {
	    return;
	}
	var ret = null;
	s["platform"].each(function (p, index) {
	    if (!p || ret) {
		return;
	    }
	    if (p.x * 1 === x && p.y * 1 === y) {
		ret = {
		    plat: p,
		    index: index
		};
	    }
	});
	return ret;
    },
    getPlatform: function (c, coindex, s, satindex, p, platindex) {
	var plat = new Element('div', {
	    class: 'nub_platform',
	});
	plat.adopt(new fs_Model(this.options.types.platform[p.id], {"size": 20}));
	plat.adopt(new Element('div'));
	plat.adopt(editButton({html: ''}, function () {
	    this.getTypeSelect('platform', function (id) {
		this.options.newchar.celestial_object[coindex].satellite[satindex].platform[platindex].id = id;
		this.refresh();
	    }.bind(this));
	}.bind(this), this.options.types.platform[p.id].name + ' (platform:' + p.id + ')'));

	var layout = getOption(this.options.types["satellite"][s.id], "model", "layout", "primary");

	if (this.options.newchar.celestial_object[coindex].satellite[satindex].platform[platindex]) {
	    plat.adopt(new Element('div', {
		'style': 'font-size:17px;padding:5px;',
		html: "[" + layout["value"][this.options.newchar.celestial_object[coindex].satellite[satindex].platform[platindex].y][this.options.newchar.celestial_object[coindex].satellite[satindex].platform[platindex].x] + "] X: <strong>" + this.options.newchar.celestial_object[coindex].satellite[satindex].platform[platindex].x + "</strong> - Y: <strong>" + this.options.newchar.celestial_object[coindex].satellite[satindex].platform[platindex].y + '</strong>'
	    }));
	}



	if (!p.building) {
	    return;
	}

	p.building.each(function (b, bindex) {
	    if (!b) {
		delete this.options.newchar["celestial_object"][coindex]["satellite"][satindex]["platform"][platindex]["building"][bindex];
		return;
	    }
	    var build = this.getBuilding(c, coindex, s, satindex, p, platindex, b, bindex);
	    plat.adopt(build);
	    if (!b.inhabitant) {
		return;
	    }
	}.bind(this));

	return plat;
    },
    getBuilding: function (c, coindex, s, satindex, p, platindex, b, bindex) {
	var build = new Element('div', {
	    class: 'nub_building',
	    //html: '<span>Buildings</span>'
	});
	build.adopt(new fs_Model(this.options.types.building[b.id], {"size": 0.75}));
	build.adopt(new Element('div', {
	    html: this.options.types.building[b.id].name + ' (building:' + b.id + ')'
	}));

	if (this.options.types["platform"][p.id].options.mounts) {
	    var selectwrap = new Element('div', {
		html: '<span>Platform Pos: </span>'
	    })
	    var select = new Element('select', {
		events: {
		    change: function () {
			this.options.newchar.celestial_object[coindex].satellite[satindex].platform[platindex].building[bindex].mount = select.getSelected()[0].value;
			this.refresh();
		    }.bind(this)
		}
	    });
	    select.adopt(new Element('option'));
	    this.options.types["platform"][p.id].options.mounts.each(function (mount, index) {
		var opt = new Element('option', {
		    html: mount["mount"] + ' (' + mount["position"] + ')',
		    value: mount["mount"]
		});
		if (this.options.newchar.celestial_object[coindex].satellite[satindex].platform[platindex].building[bindex].mount == mount["mount"]) {
		    opt.setAttribute('selected', 'true');
		}
		select.adopt(opt);
	    }.bind(this));
	    selectwrap.adopt(select);
	    build.adopt(selectwrap);
	}

	var buttWrap = new Element('div', {
	    class: 'button-wrapper'
	});

	buttWrap.adopt(deleteButton({html: ''}, function () {
	    delete this.options.newchar.celestial_object[coindex].satellite[satindex].platform[platindex].building[bindex];
	    this.refresh();
	}.bind(this)));
	buttWrap.adopt(addButton({html: 'Inhabitant'}, function () {

	}.bind(this)));
	build.adopt(buttWrap);

	return build;
    }

});