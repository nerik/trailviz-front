console.log('hello front')

$.ajax({
  url: "http://127.0.0.1:8000/"
}).done(function( data ) {
    console.log(data)
});
