/**
 * http://usejsdoc.org/
 */


exports.extractCSRF = function (cookie){
	return ((cookie[0].split(";"))[0].split("="))[1];
};

exports.extractXcpSession =  function (cookie){
	return ((cookie[1].split(";"))[0].split("="))[1];
};