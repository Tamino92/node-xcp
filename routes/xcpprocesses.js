/**
 * http://usejsdoc.org/
 */
var express = require('express');
var request = require('request');
var util = require('../modules/apputils') ;
var bodyParser = require('body-parser') ;
var router = express.Router() ;

router.use(bodyParser.json()) ;

var baseObjectRequest = request.defaults({
	'baseUrl' : 'http://nkxcp22:8000/xRest/',
	'headers' : {
		'Accept' : 'application/json',
		'Content-Type' : 'application/json'
	}
});


router.route('/processes/:process_name')
.get(function(request,response){
	response.status(404).json("xcp GET on processes not supported") ;
})
.post(function(request,response){
	console.log('xCP Process Instance POST for process : '+request.params.process_name+' query string : '+JSON.stringify(request.query)) ;
	console.log(JSON.stringify(request.body)) ;
	var app = request.app ;
	var options = {
			url : '/processes/'+request.params.process_name,
			qs : request.query,
			headers: {'Authorization' : request.headers['authorization'],
					'set-cookie' : app.locals.xcsrf,
			  	  	'x-csrf-token' : app.locals.xcsrf },
			body : JSON.stringify(request.body)
	} ;
	baseObjectRequest.post(options,function (xcperror, xcpresponse, xcpbody) {
		  if (!xcperror && xcpresponse.statusCode == 201) {
			  	console.log('success from xcp') ;
			  	if (xcpresponse.headers['set-cookie']){
			  		app.locals.xcsrf = util.extractCSRF(xcpresponse.headers['set-cookie']) ;
			  		app.locals.xcpsession = util.extractXcpSession(xcpresponse.headers['set-cookie']) ;
			  	}
			  	response.writeHead(200, {
			  	  'Content-Length': xcpbody.length,
			  	  'Content-Type': 'application/json',
			  	  
			  	  });
			  	response.status(xcpresponse.statusCode) ;
			  	response.write(xcpbody);
			  	response.end() ;
		 }
		  else if(xcperror || xcpresponse.statusCode != 200){
			  console.log('error from xcp') ;
			  response.status(xcpresponse.statusCode) ;
			  response.write(xcpbody);
			  response.end() ;
		  }
	});
});


module.exports = router ;