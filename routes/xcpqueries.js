/**
 * http://usejsdoc.org/
 */
var express = require('express');
var request = require('request');
var util = require('../modules/apputils') ;
var router = express.Router() ;

var xcpKinds = ["rtq","hstq"];


var basexCPRequest = request.defaults({
	'baseUrl' : 'http://nkxcp22:8000/xRest/',
	'headers' : {
		'Accept' : 'application/json',
		'Content-Type' : 'application/json'
	}
});


router.route('/')
	.get(function(request,response){
		response.status(404).json('Need to specify request name') ;
	})
	.post(function(request,response){
		response.status(405).json('Not allowed') ;
	});


router.route('/:queryname')
.get(function(request,response){	
	console.log('query name : '+request.params.queryname+' ; query string : '+JSON.stringify(request.query)) ;
	var app = request.app ;
	var options = {
			url : '/realtime-queries/'+request.params.queryname,
			qs : request.query,
			headers: {'Authorization' : request.headers['authorization'],
					'set-cookie' : app.locals.xcsrf,
			  	  	'x-csrf-token' : app.locals.xcsrf }
			} ;
	basexCPRequest.get(options,function (xcperror, xcpresponse, xcpbody) {
		  if (!xcperror && xcpresponse.statusCode == 200) {
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
		  else if(xcperror){
			  console.log('error from xcp') ;
			  response.status(xcpresponse.statusCode) ;
			  response.write(xcpbody);
			  response.end() ;
		  }
	});
})
.post(function(request,response){
	response.status(405).json('Not allowed') ;
});

module.exports = router ;