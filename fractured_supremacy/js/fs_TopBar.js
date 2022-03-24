var fs_TopBar = new Class({
    Implements: [Events, Options],
    cont: Class.empty,
    _logoutButton: null,
    _topLeft: null,
    _topRight: null,
    _topMid: null,
    options: {
	celestial_objects: null
    },
    initialize: function (options) {
	this.setOptions(options);

	this.cont = new Element('div', {
	    'class': 'top'
	});

	this.cont.adopt(this._topLeft = new Element('div', {
	    "class": "top-left"
	}));
	this.cont.adopt(this._topMid = new Element('div', {
	    "class": "top-mid"
	}));
	this.cont.adopt(this._topRight = new Element('div', {
	    "class": "top-right"
	}));
	this._topRight.adopt(this.getLogoutButton())
    },
    toElement: function () {
	return this.cont;
    },
    _buildLogoutButton: function () {
	this._logoutButton = new Element('a', {
	    "class": "logout",
	    "html": "Logout",
	    "href": CONFIG["root_url"] + "?logout=true"
	});
	return this._logoutButton;
    },
    getLogoutButton: function () {
	if (!this._logoutButton) {
	    return this._buildLogoutButton();
	}
	return this._logoutButton;
    },
    addToTopMid: function (elm) {
	this._topMid.adopt(elm);
    },
    refreshTopMid: function () {
	this._topMid.empty();
	var heir = getTypeHeirarchy(TYPES['celestial_object']);

	var wrap = div({class: "type-list-wrap"});
	var listing = div({class: 'type-list-listing'});

	var typesUl = ul({class: 'type-list'});
	wrap.adopt(div({class: 'subcat-title2', html: this.options.table}));
	each(heir, function (cats, type) {
	    var typeLi = li({
		class: 'type-list-type '+sanitize(type),
		//html: '<span>' + type + '</spaa>'
	    });
	    typesUl.adopt(typeLi);

	    var catUl = ul({class: 'types-type'});
	    typeLi.adopt(catUl);
	    each(cats, function (subcats, cat) {
		var catLi = li({
		    class: 'type-list-cat '+sanitize(cat),
		    //html: '<span>' + cat + '</spaa>'
		});
		catUl.adopt(catLi);

		var subcatUl = ul({class: 'types-subcats'});
		catLi.adopt(subcatUl);

		each(subcats, function (types, subcat) {
		    var subcatLi = li({
			class: 'type-list-subcat '+sanitize(subcat),
		    });

		    each(types, function (type) {

		    var typeitem = div({
			class: 'type-item-'+sanitize(type.type)
		    });

//		    var model = new fs_Model(type, {
//			size: 15,
//			segX: 5,
//			segY: 5
//		    });
			var model = new fs_Panel({
			    panel: 'co_panel',
			    width: 40,
			    height: 40,
			    image: type.options.model[0].globe
			});
			model.toElement().addEvent('click', function () {
			    Object.each(UNIVERSE.universe.celestial_objects, function (co, id) {
				if (type.id == co.celestial_object_type_id) {
				    co.object.activate();
				} else {
				    co.object.deactivate();
				}
			    }.bind(this));
			});
			typeitem.adopt(model);
			subcatLi.adopt(typeitem);
		    });
		    subcatUl.adopt(subcatLi);

		}.bind(this));
	    }.bind(this));
	}.bind(this));
	wrap.adopt(typesUl);
	wrap.adopt(listing);
	this._topMid.adopt(wrap);
    }
});