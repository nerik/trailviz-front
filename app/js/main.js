
var params = window.location.search.replace( "?", "" );
var token = '';
var rkUrl = 'http://api.runkeeper.com';
var routes = {};

var activityTemplate = _.template( $('#activity-template').html() );

localStorage['activities'] = localStorage['activities'] || '{}';
var activities = JSON.parse( localStorage.activities );

// renderList(true);

if (params !== '') {
	fetchToken();
}

function rk(route) {
	return rkUrl + route + '?access_token=' + token;
}

function fetchToken () {
	$.ajax({
	  url: "http://127.0.0.1:8000/?" + params
	}).done(function( data ) {
	    var resp = JSON.parse(data);
	    if (resp.access_token) {
	    	token = resp.access_token;
	    	fetchUser();
	    }
	});
}

function fetchUser () {
	$.ajax({url: rk('/user')}).done(function (data) {
		routes.profile = data.profile;
		routes.activities = data.fitness_activities;
		localStorage['userID'] = data.userID;
		// console.log(data);
		// console.log(routes)

		fetchActivities();
	});
}

function fetchActivities () {
	$.ajax({url: rk(routes.activities)}).done(function (data) {
		// console.log(data);
		for (var i = 0; i < data.items.length; i++) {
			var activity = data.items[i];

			//ignore activities without path
			if (!activity.has_path) continue;

			var localActivity = JSON.parse(localStorage['activities'])[data.uri];

			if ( localActivity )  {
				if (!localActivity.details) {
					fetchActivityDetail(activity);
				}
				continue;
			}

			prepareActivity(activity);

			saveLocalActivities();

			fetchActivityPath(activity);
		};

		renderList();
	});
}

function saveLocalActivities () {
	localStorage['activities'] = JSON.stringify(activities);
}



function prepareActivity (activity) {

	activity.date = new Date(activity.start_time);
	activity.added = true;

	activity.formattedDistance = (activity.total_distance / 1000).toFixed(1).replace(/\.0$/gi, '');
	activity.formattedDate = moment(activity.date).format('Do MMM');
	// console.log(activity.distance)

	activities[activity.uri] = activity;

}


function fetchActivityPath (activity) {
	$.ajax({url: rk(activity.uri)}).done(function (data) {
		activities[activity.uri].details = data;
		prepareActivityPath(activity);
		saveLocalActivities();
		renderPath(activity);
	});
}

function prepareActivityPath (activity) {

	if (!activity.has_path) return;


	activity.details.points = [];

	for (var i = 0; i < activity.details.path.length; i++) {
		var rawPoint = activity.details.path[i];
		activity.details.points.push( L.point(rawPoint.longitude, rawPoint.latitude) );
	};

	activity.bounds = L.bounds(activity.details.points);
}

function getLargestPath () {
	for (activityId in activities) {

	}
}

function renderList(forceAdd) {
	var a = _.sortBy(activities, 'date');
	console.log(a);

	var container = $('#activitiesList');

	var colorIncrement = 100/a.length;

	var i = 0;

	for (activityId in activities) {
		var activity = activities[activityId];

		// prepareActivity(activity);
		// prepareActivityPath(activity);
		// saveLocalActivities();
	
		var tpl = activityTemplate(activity);	
		var el = $(tpl);

		var color = tinycolor.desaturate("red", i*colorIncrement);
		el.css('color', color.toHexString())
		// el.text(activity.formattedDistance + "K");
		container.append(el);

		renderPath(activity);

		i++;
	};

}




function renderPath (activity) {
	
}
