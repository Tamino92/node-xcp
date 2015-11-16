/**
 * http://usejsdoc.org/
 */
var express = require('express');
var request = require('request');
var util = require('../modules/apputils') ;
var bodyParser = require('body-parser') ;
var router = express.Router() ;

router.use(bodyParser.json()) ;

var xcpKinds = ["business-objects","contents","alerts", "folders","cabinets"];

var baseObjectRequest = request.defaults({
	'baseUrl' : 'http://nkxcp22:8000/xRest/',
	'headers' : {
		'Accept' : 'application/json',
		'Content-Type' : 'application/json'
	}
});

router.route('/')
	.get(function(request,response){
		response.status(404).json('Nothing here') ;
	})
	.post(function(request,response){
		response.status(405).json('Not allowed') ;
	});

router.route('/:xcpkind')
.get(function(request,response){
	response.status(404).json('Nothing here') ;
})
.post(function(request,response){
	response.status(405).json('Not allowed') ;
});

/*
 * Routes for object collections
 */

router.route('/:xcpkind/:typename')
.all(function(request,response,next){
	if (checkXcpKind(request.params.xcpkind)){
		next();
	}
	else {
		response.status(404).json("xcp kind not supported") ;
	}
})
.get(function(request,response){
	response.status(200).json('xCP Collection on '+request.params.xcpkind+'GET for type : '+request.params.typename) ;
})
.post(function(request,response){
	response.status(405).json('xCP Collection POST for type allowed') ;
});

/*
 * Routes for object instances
 */


router.route('/:xcpkind/:typename/:id')
.all(function(request,response,next){
	if (checkXcpKind(request.params.xcpkind)){
		next();
	}
	else {
		response.status(404).json("xcp kind not supported") ;
	}
})
.get(function(request,response){
	console.log('xCP BO Instance GET '+request.params.xcpkind+' for type : '+request.params.typename+' and id : '+request.params.id) ;
	var app = request.app ;
	var options = {
			url : '/'+request.params.xcpkind+'/'+request.params.typename+'/'+request.params.id,
			qs : request.query,
			headers: {'Authorization' : request.headers['authorization'],
					'set-cookie' : app.locals.xcsrf,
			  	  	'x-csrf-token' : app.locals.xcsrf }
			} ;
	baseObjectRequest.get(options,function (xcperror, xcpresponse, xcpbody) {
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
	console.log('xCP BO Instance POST '+request.params.xcpkind+' for type : '+request.params.typename+' and id : '+request.params.id+' query string : '+JSON.stringify(request.query)) ;
	console.log(JSON.stringify(request.body)) ;
	var app = request.app ;
	var options = {
			url : '/'+request.params.xcpkind+'/'+request.params.typename+'/'+request.params.id,
			qs : request.query,
			headers: {'Authorization' : request.headers['authorization'],
					'set-cookie' : app.locals.xcsrf,
			  	  	'x-csrf-token' : app.locals.xcsrf },
			body : JSON.stringify(request.body)
	} ;
	baseObjectRequest.post(options,function (xcperror, xcpresponse, xcpbody) {
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
		  else if(xcperror || xcpresponse.statusCode == 400){
			  console.log('error from xcp') ;
			  response.status(xcpresponse.statusCode) ;
			  response.write(xcpbody);
			  response.end() ;
		  }
	});
});

function checkXcpKind(xcpkind) {
	  return xcpKinds.indexOf(xcpkind)!=-1 ;
	}

module.exports = router ;