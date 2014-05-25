
var params = window.location.search.replace( "?", "" );
var token = '';
var hgUrl = 'http://api.runkeeper.com'

if (params !== '') {
	$.ajax({
	  url: "http://127.0.0.1:8000/?" + params
	}).done(function( data ) {
	    console.log(data);
	    var resp = JSON.parse(data);
	    console.log(resp.access_token);
	    if (resp.access_token) {
	    	token = resp.access_token;
	    	fetchUser();
	    }
	});
}

function fetchUser () {
	console.log('fetch!');
	console.log(token);
	$.ajax({url: hgUrl + '/user?access_token=' + token}).done(function (data) {
		console.log(data);
	})
	  
}