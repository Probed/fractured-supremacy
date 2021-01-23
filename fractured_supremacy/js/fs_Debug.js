var fs_Debug = new Class({
    Implements: [Events, Options],
    cont: Class.empty,
    options: {

    },
    initialize: function (options) {
	this.setOptions(options);
	this.cont = $$('.fs_Debug-wrapper')[0];
	this.addEvents();
    },
    toElement: function () {
	return this.cont;
    },
    addEvents: function () {
	$$('.fs_Debug-menu, .fs_Debug-table').addEvent('click', function (e) {
	    $$('.fs_Debug-table').toggleClass('active');
	});
	return this;
    },

    update: function (resp) {
	if (resp && resp.DEBUG) {
	    var debug = Elements.from(resp.DEBUG);
	    debug.replaces(this.cont);
	    this.cont = debug[0];
	    this.addEvents();
	}
	return this;
    },
    open: function () {
	activate($$('.fs_Debug-table'));
	return this;
    }

});