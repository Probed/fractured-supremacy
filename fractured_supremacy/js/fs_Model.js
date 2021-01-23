var fs_Model = new Class({
    Implements: [Events, Options],
    modelItems: [],
    modelElms: [],
    model: Class.empty,
    options: {
	//overrides
    },
    initialize: function (type, options) {
	this.setOptions(options);
	this.modelWrap = new Element('div', {
	    class: 'model-wrap',
	    title: type.name + ' ' + type.category + ' ' + type.subcat
	});
	this.model = new Element('div', {
	    'class': 'model'
	});
	this.modelWrap.adopt(this.model);
	if (typeOf(type.options) != 'object') {
	    this.model.addClass('empty');
	    this.model.set('html', 'No Type Options');
	    return this;
	}
	if (typeOf(type.options.model) != 'array') {
	    this.model.addClass('empty');
	    this.model.set('html', 'No Model Found');
	    return this;
	}
	this.modelItems = type.options.model;
	var klass = getOption(type, "model", "css", "css");
	if (klass && klass["css"]) {
	    this.model.addClass(klass["css"]);
	}
//	var size = getOption(type, "model", "var", "modelSize");
//	if (size && size["val"]) {
//	    this.modelWrap.style.height = size["val"] + 'px';
//	    this.modelWrap.style.width = size["val"] + 'px';
//	}
	this.refresh();
    },
    toElement: function () {
	return this.modelWrap;
    },
    refresh: function () {
	this.model.empty();
	this.modelElms = [];
	this.modelItems.each(function (modelOpts, index) {
	    modelOpts = Object.clone(modelOpts);
	    var i = 0;
	    var modelType = null;
	    Object.each(modelOpts, function (val, key) {
		if (i > 0) {
		    return;
		}
		i++;
		modelType = key;
	    });

	    if (this.options.size < 1 && this.options.size > 0) {
		modelOpts["size"] = ((modelOpts["size"] * 1) * this.options.size);
		if (!isNaN(modelOpts["top-pos"])) {
		    modelOpts["top-pos"] = ((modelOpts["top-pos"]) * this.options.size);
		}
		if (!isNaN(modelOpts["left-pos"])) {
		    modelOpts["left-pos"] = ((modelOpts["left-pos"]) * this.options.size);
		}
		if (!isNaN(modelOpts["height"])) {
		    modelOpts["height"] = ((modelOpts["height"]) * this.options.size);
		}
		if (!isNaN(modelOpts["width"])) {
		    modelOpts["width"] = ((modelOpts["width"]) * this.options.size);
		}
	    } else if (this.options.size) {
		modelOpts["size"] = this.options.size;
	    }
	    if (this.options["top-pos"]) {
		modelOpts["top-pos"] = this.options["top-pos"];
	    }
	    if (this.options["left-pos"]) {
		modelOpts["left-pos"] = this.options["left-pos"];
	    }
	    if (this.options["segX"]) {
		modelOpts["segX"] = this.options["segX"];
	    }
	    if (this.options["segY"]) {
		modelOpts["segY"] = this.options["segY"];
	    }

	    var elm;
	    switch (modelType) {
		case "cube":
		    elm = new fs_Cube(modelOpts);
		    break;
		case "sphere":
		    var sphere = new fs_Sphere(modelOpts);
		    sphere.regenerateGlobe();
		    sphere.render();
		    sphere.render();
		    elm = sphere;
		    break;
		case "cylinder":
		    elm = new fs_Cylinder(modelOpts);
		    break;
		case "image" :
		    var model = {
			panel: 'list-model-image',
			height: (this.options.height || 60),
			width: (this.options.width || 60),
			image: modelOpts.value
		    };
		    elm = new fs_Panel(model);
		    elm.toElement().style.position = 'relative';
		    break;
		case "panel" :
		    elm = new fs_Panel(modelOpts);
		    break;


		case "layout" :
		    elm = new Element('div');
		    modelOpts["value"].each(function (cols, rowid) {
			var r = new Element('div', {
			    'class': 'layout-row'
			});
			elm.adopt(r);
			cols.each(function (cell, colid) {
			    var c = new Element('div', {
				'class': 'layout-cell layout-cell-' + cell,
				html: cell
			    });
			    r.adopt(c);
			}.bind(this));
		    }.bind(this));
		    break;

		default:
		    break;
	    }
	    if (!elm) {
		return;
	    }
	    this.model.adopt(elm.toElement && elm.toElement() || elm);
	    this.modelElms.push(elm);
	}.bind(this));
    }
});