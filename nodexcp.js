/**
 * http://usejsdoc.org/
 */
var express = require('express');

var app = module.exports = express();



// Default route
app.use(express.static('public')) ;

// routers declarations
var xcpObjectsRoutes = require('./routes/xcpobjects') ;
var xcpQueriesRoutes = require('./routes/xcpqueries') ;
var xcpProcessesRoutes = require('./routes/xcpprocesses') ;

// routers mounting
app.use('/obj',xcpObjectsRoutes) ;
app.use('/qry',xcpQueriesRoutes) ;
app.use('/prc',xcpProcessesRoutes) ;
app.locals.title = 'xCP Node Bridge' ;
app.locals.xcsrf = '' ;
app.locals.xcpsession = '' ;
app.listen(1974,function(){
	console.log('xCP Node Bridge listening on port 1974') ;
	console.log('Cheking if xCP is ready...todo !!');
});