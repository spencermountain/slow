var rate_limit=require('./rate_limit').rate_limit;

rate_limit( [1,2,3,4,5,6,7], my_function, {}, console.log)

function my_function(q, callback){
  var x=Math.floor(Math.random()*4000)
  setTimeout(function(){callback("finished "+q+" in "+x+"ms")}, x)
}
