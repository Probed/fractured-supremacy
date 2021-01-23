var fs_ModelBuilder = new Class({
    builder: null,
    cont: null,
    win: null,
    posElms: null,
    keyEvent: null,
    center: null,
    list: [],
    topElm: null,
    leftElm: null,
    scale: 4,
    allsize: 0,
    center: null,
    options: {

    },
    initialize: function (builder, model, callback) {

	this.builder = builder;
	this.modelOriginal = Array.clone(model);
	this.model = Array.clone(model);

	this.callback = callback;

	this.cont = div({
	    class: 'objectArranger',
	    events: {
		click: function (e) {
		    this.cont.getElements('.active').each(function (elm) {
			elm.removeClass('active');
		    });
		    this.posElms.hide();
		}.bind(this)
	    }
	});

	$$('body')[0].addEvent('keydown', this.keyEvent = function (e) {
	    if (this.center.getElements('.active')[0] && e.key) {
		this.center.getElements('.active').each(function (elm, index) {
		    if (!elm) {
			return;
		    }
		    var idx = elm.getAttribute('index') * 1;
		    switch (e.key) {
			case 'up':
			    var top = (this.model[idx]["top-pos"] * 1) || 0;
			    this.model[idx]["top-pos"] = top = top - 1;
			    elm.style.top = top + 'px';
			    this.topElm.value = elm.offsetTop;
			    this.leftElm.value = elm.offsetLeft
			    e.preventDefault();
			    break;
			case 'down':
			    var top = (this.model[idx]["top-pos"] * 1) || 0;
			    this.model[idx]["top-pos"] = top = top + 1;
			    elm.style.top = top + 'px';
			    e.preventDefault();
			    this.topElm.value = elm.offsetTop;
			    this.leftElm.value = elm.offsetLeft;
			    break;
			case 'left':
			    var left = (this.model[idx]["left-pos"] * 1) || 0;
			    this.model[idx]["left-pos"] = left = left - 1;
			    elm.style.left = left + 'px';
			    e.preventDefault();
			    this.topElm.value = elm.offsetTop;
			    this.leftElm.value = elm.offsetLeft;
			    break;
			case 'right':
			    var left = (this.model[idx]["left-pos"] * 1) || 0;
			    this.model[idx]["left-pos"] = left = left + 1;
			    elm.style.left = left + 'px';
			    e.preventDefault();
			    this.topElm.value = elm.offsetTop;
			    this.leftElm.value = elm.offsetLeft;
			    break;

			default:

			    break;
		    }
		}.bind(this));
	    }
	}.bind(this));

	this.arrangeWin = new fs_Window({
	    title: "Object Arranger",
	    body: this.cont,
	    buttons: [
		new fs_Button({
		    html: 'Cancel',
		    icon: 'no',
		    events: {
			click: function () {
			    $$('body')[0].removeEvent('keydown', this.keyEvent);
			    this.arrangeWin.close();
			}.bind(this)
		    }
		}),
		new fs_Button({
		    html: 'Reset',
		    icon: 'image-rotate',
		    events: {
			click: function () {
			    this.setOptions(Object.clone(this.orig_options));
			    this.refresh();
			}.bind(this)
		    }
		}),
		new fs_Button({
		    html: 'Apply',
		    icon: 'yes',
		    events: {
			click: function () {
			    this.callback && this.callback(this.model);
			}.bind(this)
		    }
		}),
		new fs_Button({
		    html: 'Save & Close',
		    icon: 'yes',
		    events: {
			click: function () {
			    this.callback(this.model);
			    $$('body')[0].removeEvent('keydown', this.keyEvent);
			    this.arrangeWin.close();
			}.bind(this)
		    }
		})
	    ]
	});
	this.arrangeWin.open();
	this.refresh();

    },
    toElement: function () {
	return this.cont;
    },
    refresh: function () {

	this.list = [];
	this.cont.empty();
	(typeOf(this.model) == 'array') && this.model.each(function (obj, index) {
	    var i = 0;
	    Object.each(obj, function (val, key) {
		if (i > 0) {
		    return;
		}
		i++;
		this.list.push({
		    key: key,
		    val: val,
		    idx: index,
		    opts: obj
		});
	    }.bind(this));
	}.bind(this));
	var objcont = div({
	    class: 'object-container'
	});
	this.center = div({
	    class: 'cont-center'
	});
	objcont.adopt(this.center);
	this.center.style.transform = 'translate(0%, 0%) scale(' + this.scale + ')';
	var listElm = div({
	    id: 'object-arranger'
	});

	listElm.adopt((new fs_Button({
	    icon: 'randomize',
	    html: 'Select All',
	    click: function (e) {
		this.center.getElements('> div').each(function (elm) {
		    elm.addClass('active');
		});
		e.stop();
	    }.bind(this)
	})).toElement());

	var zoom = div({
	    class: 'object-arranger-zoom'
	});
	var zoomtxt = null;
	this.center.style.transform = 'translate(-50%, -50%) scale(' + this.scale + ')';

	zoom.adopt(div({
	    class: 'fs_Button edit object-arranger-zoom-minus',
	    html: fs_Icon('minus'),
	    events: {
		click: function (e) {
		    this.scale -= 1;
		    zoomtxt.set('html', fs_Icon('search') + ' Zoom ' + (this.scale * 1).toFixed(0));
		    this.center.style.transform = 'translate(-50%, -50%) scale(' + this.scale + ')';
		    e.stopPropagation();
		}.bind(this)
	    }
	}));
	zoom.adopt(zoomtxt = div({
	    class: 'fs_Button object-arranger-zoom-text',
	    html: fs_Icon('search') + ' Zoom: ' + this.scale,
	    events: {
		click: function (e) {
		    this.scale = 1;
		    zoomtxt.set('html', fs_Icon('search') + ' Zoom ' + (this.scale * 1).toFixed(0));
		    this.center.style.transform = 'translate(-50%, -50%) scale(' + this.scale + ')';
		    e.stopPropagation();
		}.bind(this)
	    }
	}));
	zoom.adopt(div({
	    class: 'fs_Button edit  object-arranger-zoom-plus',
	    html: fs_Icon('plus'),
	    events: {
		click: function (e) {
		    this.scale += 1;
		    zoomtxt.set('html', fs_Icon('search') + ' Zoom ' + (this.scale * 1).toFixed(0));
		    this.center.style.transform = 'translate(-50%, -50%) scale(' + this.scale + ')';
		    e.stopPropagation();
		}.bind(this)
	    }
	}));
	objcont.adopt(zoom);


	var allsizewrap = div({
	    class: 'object-arranger-scale'
	});
	var allsizetxt = null;
	allsizewrap.adopt(div({
	    class: 'fs_Button edit object-arranger-scale-minus',
	    html: fs_Icon('minus'),
	    events: {
		click: function (e) {
		    this.allsize -= 1;
		    allsizetxt.set('html', fs_Icon('move') + ' Size: ' + (this.allsize > 0 ? '+' + this.allsize : (this.allsize < 0 ? '-' : '')) + this.allsize);
		    this.model.each(function (obj, index) {
			if (Object.keys(obj).indexOf("size") > -1) {
			    this.model[index]["size"] = (this.model[index]["size"] * 1) - 1;
			}
		    }.bind(this));
		    e.stopPropagation();
		    this.refresh();
		}.bind(this)
	    }
	}));
	allsizewrap.adopt(allsizetxt = div({
	    class: 'fs_Button object-arranger-scale-text',
	    html: fs_Icon('move') + ' Size: ' + (this.allsize > 0 ? '+' + this.allsize : (this.allsize < 0 ? '-' : '') + this.allsize),
	    events: {
		click: function (e) {
		    this.allsize = 0;
		    allsizetxt.set('html', fs_Icon('move') + ' Size: ' + (this.allsize > 0 ? '+' + this.allsize : (this.allsize < 0 ? '-' : '')) + this.allsize);
		    this.model.each(function (obj, index) {
			if (Object.keys(obj).indexOf("size") > -1) {
			    this.model[index]["size"] = (this.orig_options.opts[index]["size"] * 1);
			}
		    }.bind(this));
		    e.stopPropagation();
		    this.refresh();
		}.bind(this)
	    }
	}));
	allsizewrap.adopt(div({
	    class: 'fs_Button edit object-arranger-scale-plus',
	    html: fs_Icon('plus'),
	    events: {
		click: function (e) {
		    this.allsize += 1;
		    allsizetxt.set('html', fs_Icon('move') + ' Size: ' + (this.allsize > 0 ? '+' + this.allsize : (this.allsize < 0 ? '-' : '')) + this.allsize);
		    this.model.each(function (obj, index) {
			if (Object.keys(obj).indexOf("size") > -1) {
			    this.model[index]["size"] = (this.model[index]["size"] * 1) + 1;
			}
		    }.bind(this));
		    e.stopPropagation();
		    this.refresh();
		}.bind(this)
	    }
	}));
	objcont.adopt(allsizewrap);

	this.posElms = div({
	    class: 'object-arranger-pos'
	});
	this.posElms.hide();

	this.posElms.adopt(div({
	    class: 'object-arranger-topText',
	    html: 'Top'
	}));
	this.posElms.adopt(this.topElm = new Element('input', {
	    class: 'object-arranger-topPos',
	    type: 'number',
	    events: {
		click: function (e) {
		    e.stopPropagation();
		},
		keyup: function () {
		    if (this.cont.getElements('.active')[0]) {
			var elm = this.cont.getElements('.active')[0];
			if (!elm) {
			    return;
			}
			var idx = elm.getAttribute('index') * 1;
			this.model[idx]["top-pos"] = this.topElm.value;
			elm.style.top = this.topElm.value + 'px';
		    }
		}.bind(this)
	    }
	}));
	this.posElms.adopt(div({
	    class: 'object-arranger-topText',
	    html: 'Left'
	}));
	this.posElms.adopt(this.leftElm = new Element('input', {
	    class: 'object-arranger-leftPos',
	    type: 'number',
	    events: {
		click: function (e) {
		    e.stopPropagation();
		}.bind(this),
		keyup: function () {
		    if (this.cont.getElements('.active')[0]) {
			var elm = this.cont.getElements('.active')[0];
			if (!elm) {
			    return;
			}
			var idx = elm.getAttribute('index') * 1;
			this.model[idx]["left-pos"] = this.leftElm.value;
			elm.style.left = this.leftElm.value + 'px';
		    }
		}.bind(this)
	    }
	}));
	objcont.adopt(this.posElms);

	Object.each(this.list, function (obj, index) {
	    index = index * 1;
	    var li = div({
		class: 'object-arranger-obj',
		html: '<span>' + obj['key'] + ': ' + obj['val'] + '</span>',
		events: {
		    click: function (e) {
			e.stop();
			if (obj["elm"]) {
			    this.cont.getElements('.active').each(function (elm) {
				elm.removeClass('active');
				objcont.focus();
			    });
			    obj["elm"].addClass('active');
			    li.addClass('active');
			    this.posElms.show();
			    this.topElm.value = obj["elm"].offsetTop;
			    this.leftElm.value = obj["elm"].offsetLeft;
			}
		    }.bind(this)
		}
	    });
	    var context = {};
	    context[fs_Icon('edit') + ' Edit'] = function (e) {
		this.builder.openOptionEditor(obj["key"], obj["opts"], function (newOpt) {
		    if (newOpt) {

			this.model[index] = newOpt;
			this.refresh();
		    }
		    e.stop();
		}.bind(this));
	    }.bind(this)

	    context[fs_Icon('format-gallery') + ' Clone'] = function (e) {
		this.model.push(Object.clone(this.model[index]));
		this.refresh();
		e.stop();
	    }.bind(this);
	    if (index != 0) {
		context[fs_Icon('arrow-up-alt') + ' Move to top'] = function (e) {
		    var tmp = this.model[index];
		    this.model.splice(index, 1);
		    this.model.unshift(tmp);
		    this.refresh();
		    e.stop();
		}.bind(this);
	    }
	    if (this.model[index - 1]) {
		context[fs_Icon('arrow-up') + ' Move Up'] = function (e) {
		    var tmp = this.model[index];
		    this.model[index] = this.model[index - 1];
		    this.model[index - 1] = tmp;
		    this.refresh();
		    e.stop();
		}.bind(this);
	    }
	    if (this.model[index + 1]) {
		context[fs_Icon('arrow-down') + ' Move Down'] = function (e) {
		    var tmp = this.model[index];
		    this.model[index] = this.model[index + 1];
		    this.model[index + 1] = tmp;
		    this.refresh();
		    e.stop();
		}.bind(this);
	    }
	    if (this.model.length - 1 != index) {
		context[fs_Icon('arrow-down-alt') + ' Move to bottom'] = function (e) {
		    var tmp = this.model[index];
		    this.model.splice(index, 1);
		    this.model.push(tmp);
		    this.refresh();
		    e.stop();
		}.bind(this);
	    }
	    context[fs_Icon('no') + ' Delete'] = function (e) {
		if (confirm('Are you sure?')) {
		    this.model.splice(index, 1);
		    this.refresh();
		}
		e.stop();
	    }.bind(this);

	    li.addEvent('contextmenu', function (e) {
		e.stop();
		openContextMenu(e, context);
	    }.bind(this));
	    listElm.adopt(li);

	    var elm = null;
	    var liElm;
	    switch (obj["key"]) {
		case "cube":
		    elm = new fs_Cube(obj.opts);
		    var cloneopts = Object.clone(obj.opts);
		    cloneopts["size"] = 20;
		    cloneopts["top-pos"] = 0;
		    cloneopts["left-pos"] = 0;
		    liElm = new fs_Cube(cloneopts);
		    break;
		case "sphere":
		    var sphere = new fs_Sphere(obj.opts);
		    sphere.regenerateGlobe();
		    sphere.render();
		    sphere.render();
		    elm = sphere;
		    var cloneopts = Object.clone(obj.opts);
		    cloneopts["size"] = 15;
		    cloneopts["top-pos"] = 0;
		    cloneopts["left-pos"] = 0;
		    liElm = new fs_Sphere(cloneopts);
		    liElm.regenerateGlobe();
		    liElm.render();
		    liElm.render();
		    break;
		case "cylinder":
		    elm = new fs_Cylinder(obj.opts);
		    var cloneopts = Object.clone(obj.opts);
		    cloneopts["height"] = 20;
		    cloneopts["top-pos"] = 0;
		    cloneopts["left-pos"] = 0;
		    liElm = new fs_Cylinder(cloneopts);
		    break;
		case "panel":
		    elm = new fs_Panel(obj.opts);
		    var cloneopts = Object.clone(obj.opts);
		    cloneopts["size"] = 20;
		    cloneopts["top-pos"] = 0;
		    cloneopts["left-pos"] = 0;
		    liElm = new fs_Panel(cloneopts);
		    break;
		case "image" :
		    var model = {
			panel:'list-model-image',
			height: 20,
			width: 20,
			image: obj.opts.value
		    };
		    elm = new fs_Panel(model);
		    liElm = new fs_Panel(model);
		    break;

		default:
		    break;
	    }
	    if (elm) {
		liElm.toElement().clone().inject(li, 'top');
		obj["elm"] = elm.toElement();
		this.center.adopt(obj["elm"]);
		obj["elm"].addEvent('mousedown', function (e) {
		    e.stop();
		});
		obj["elm"].addEvent('contextmenu', function (e) {
		    e.stop();
		    openContextMenu(e, context);
		}.bind(this));
		obj["elm"].addEvent('click', function (e) {
		    if (obj["elm"]) {
			this.cont.getElements('.active').each(function (elm) {
			    elm.removeClass('active');
			});
			obj["elm"].addClass('active');
			li.addClass('active');
			this.posElms.show();
			this.topElm.value = obj["elm"].offsetTop;
			this.leftElm.value = obj["elm"].offsetLeft;
		    }
		    e.stopPropagation();
		}.bind(this));
		obj["elm"].setAttribute('index', obj["idx"]);
		var drag = new Drag.Move(obj["elm"], {
		    container: objcont,
		    handle: obj["elm"],
		    onDrag: function (el) {
			this.model[index]["top-pos"] = el.offsetTop;
			this.model[index]["left-pos"] = el.offsetLeft;
			this.topElm.value = el.offsetTop;
			this.leftElm.value = el.offsetLeft;
		    }.bind(this)
		});
	    }

	}.bind(this));

	listElm.adopt((new fs_Button({
	    icon: 'plus',
	    html: 'Add Item',
	    events: {
		click: function (e) {
		    getOptSelect(this.builder.options.availableOptions[this.builder.options.table]['model'], function (optTreeType) {
			if (optTreeType) {
			    this.builder.openOptionEditor(optTreeType, {}, function (newOpt) {
				if (newOpt) {
				    (typeOf(this.model) != 'array') && (this.model = []);
				    this.model.push(newOpt);
				    this.refresh();
				}
			    }.bind(this));
			}
		    }.bind(this));
		    e.stop();
		}.bind(this)
	    }
	})).toElement());

	this.cont.adopt(listElm);

	this.cont.adopt(objcont);
    }
});