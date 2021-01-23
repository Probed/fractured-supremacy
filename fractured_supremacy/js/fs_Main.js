var fs_Main = new Class({
    Implements: [Events, Options],
    cont: Class.empty,
    _topBar: Class.empty, //holds the fs_TopBar
    _bottomBar: Class.empty, //holds the fs_BottomBar
    _leftBar: Class.empty, //holds the fs_LeftBar
    _rightBar: Class.empty, //holds the fs_RightBar
    options: {
	character: null, //holds the id if the currently active character object
	universe: null, //holds the id if the currently active universe object
	celestial_object: null, //holds the id if the currently active celestial object
	satellite: null, //holds the id if the currently active satellite
	platform: null, //holds the id if the currently active platform
	building: null, //holds the id if the currently active building
    },
    initialize: function (options) {
	this.setOptions(options);

	this.uni = new fs_Universe(UNIVERSE["universe"], this);

	this.cont = new Element('div', {
	    'class': 'game-wrap'
	});

	this.cont.adopt(this.mid = new Element('div', {
	    "class": "mid"
	}));

	this.cont.adopt((this._topbar = new fs_TopBar({

	})).toElement());

	this.cont.adopt((this._leftBar = new fs_LeftBar({

	})).toElement());

	this.cont.adopt((this._rightbar = new fs_RightBar({

	})).toElement());

	this.cont.adopt((this._bottombar = new fs_BottomBar({

	})).toElement());
    },
    toElement: function () {
	return this.cont;
    },
    start: function () {
	this._topbar.refreshTopMid(UNIVERSE["universe"].celestial_objects);
	this.mid.adopt(this.uni.loadContainers());
	this.uni.activate();
    },
    submit: function (options) {
	var data = {
	    action: options.action
	};
	data = Object.merge(data, options.data);
	new Request.JSON({
	    url: CONFIG["ajax_url"],
	    onSuccess: function (resp) {
		if (!resp) {
		    error({
			title: "Submission Failed",
			body: "Empty Response"
		    });
		} else if (resp.success) {
		    options.onSuccess && options.onSuccess(resp);
		} else if (resp.error) {
		    debug.open();
		    error({
			title: "Submission Error",
			body: (function () {
			    var ret = new Element('div', {
				'class': 'error'
			    });
			    if (resp.validate) {
				resp.validate.errors.each(function (err) {
				    ret.adopt(new Element('div', {
					html: err.title + ': ' + err.value
				    }));
				});
			    }
			    if (resp.error) {
				ret.adopt(new Element('div', {
				    html: '<br/><br/>' + resp.error
				}));
			    }
			    return ret;
			})()
		    });
		}
	    }.bind(this),
	    onError: function (text, error) {

	    },
	    onFailure: function (xhr) {
		error({
		    title: "Submit Error",
		    body: "Empty Response"
		});
	    }
	}).post(data);
    }
});