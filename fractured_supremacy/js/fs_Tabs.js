var fs_Tabs = new Class({
    Implements: [Events, Options],
    cont: Class.empty,
    tabs: Class.empty,
    panels: Class.empty,
    allTabs: [],
    allPanels: [],
    options: {
	tabChanged: null
    },
    initialize: function (options) {
	this.setOptions(options);

	this.cont = new Element('div', {
	    'class': 'tabs-wrapper-login tabs-wrapper'
	});
	this.tabs = new Element('ul', {
	    'class': 'tabs'
	});
	this.panels = new Element('div', {
	    'class': 'tab-panels'
	});
	this.cont.adopt(this.tabs);
	this.cont.adopt(this.panels);
    },
    toElement: function () {
	this._compute();
	return this.cont;
    },
    add: function (tab, panel) {
	var idx = this.allTabs.length;
	var t = new Element('li', {
	    'class': 'tab'
	});
	var a = new Element('a', {
	    'class': 'button-tab',
	    'href': 'javascript:;',
	    'events': {
		'click': function () {
		    deactivate(this.allTabs);
		    deactivate(this.allPanels);
		    activate(t);
		    activate(p);
		    this.panels.empty();
		    this.panels.adopt(this.allPanels[idx]);
		    this.options.tabChanged && this.options.tabChanged(tab, panel, idx);
		}.bind(this)
	    }
	}).adopt(new Element('span', {
	    html: tab.label
	}));
	t.adopt(a);
	this.tabs.adopt(t);
	this.allTabs.append([t]);

	var p = new Element('div', {
	    'class': 'tab-panel'
	}).adopt(panel);
	this.allPanels.append([p]);
	return t;
    },
    _compute: function () {
	var w = 100;
	if (this.allTabs.length > 0) {
	    w = (100 / this.allTabs.length);
	}
	this.allTabs.each(function (elm) {
	    //elm.setStyle('width', w + '%');
	});
    },
    activate: function (index) {
	deactivate(this.allTabs);
	deactivate(this.allPanels);
	activate(this.allTabs[index]);
	activate(this.allPanels[index]);
	this.panels.empty();
	this.panels.adopt(this.allPanels[index]);
    }
});