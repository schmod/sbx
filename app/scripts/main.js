// console.log('\'Allo \'Allo!');
CBE = can.Model({
  findAll: 'GET CBEs/{query}',
  findOne: 'GET http://ec2-54-235-58-226.compute-1.amazonaws.com/api/action/datastore_search?resource_id=282099cb-8193-4154-8ade-20603a3fb17d&q={query}',
},{});

Purchase = can.Model({
	findAll:'GET http://communities.socrata.com/resource/ttf6-xnzw.json?VENDOR={vendor}&$order=approveddate'
},{
	attributes:{
		approveddate: 'date'
	}
});

can.fixture('GET CBEs/{query}', function(orig,respondWith,settings){
	 jQuery.ajax({
	  url: 'http://ec2-54-235-58-226.compute-1.amazonaws.com/api/action/datastore_search?resource_id=282099cb-8193-4154-8ade-20603a3fb17d',
	  type: 'GET',
	  dataType: 'json',
	  data: {q: orig.data.query},
	  success: function(data, textStatus, xhr) {
	  	var response = [];
	  	for(i in data.result.records){
	  		response.push(data.result.records[i]);
	  	}
	  	respondWith(response);
	  },
	  error: function(xhr, textStatus, errorThrown) {
	    //called when there is an error
	  }
	});
	
});

var home = can.Control({
	init: function(el,opts){
		this.element.html(can.view('home.ejs',{}));

	},
	'.browse-companies click': function(el,ev){
		var self = this;
		var query = $(".find-company").val();
		window.location.hash="/browse/" + query;
		/*can.route.attr({
			route: '/browse/:query',
			query: query
		});*/

		/*CBE.findAll({query:query},function(companies){
			new browser('#modal',{companies:companies});
		});*/
	}
});

var browser = can.Control({
	init: function(el,opts){
		CBE.findAll({query:opts.query},function(companies){
			el.html(can.view('browse.ejs',{companies: companies}));
			el.modal();
		});
	},
	'[data-dismiss=modal] click': function(el,ev){
		this.destroy();
	},
	'li click': function(el,ev){
		var company = el.data('company');
		this.element.modal('hide');
		this.element.empty();
		this.destroy();
		router.options.company = new Company('.container',{company:company});
	}
});

var Company = can.Control({
	init: function(el,opts){
		var company = opts.company;
		var purchases = Purchase.findAll({vendor:company['Name'].toUpperCase().substr(0,30)},function(purchases){
			el.html(can.view('cbe.ejs',{company:company,purchases:purchases}));	
		});
	}
});

var Router = can.Control({
	init: function(el,opts){

	},
	'route': function(d){
		this.options.home = new home('.container');
	},
	'/browse/:query route': function(d){
		this.options.browser = new browser('#modal',{query:d.query});
	},
	'route': function(d){
		this.options.home = new home('.container');
	}
});

var router = new Router(window);