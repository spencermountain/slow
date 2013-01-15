var slow=require('./slow');


//slow.in_bits( [1,2,3,4,5,6,7], my_function, {}, console.log)
slow.per_minute( [1,2,3,4,5,6,7], my_function, {per_minute:1, each_time:function(){console.log('hi')}}, console.log)



function my_function(q, callback){
  var x=Math.floor(Math.random()*4000)
  setTimeout(function(){callback("finished "+q+" in "+x+"ms")}, x)
}
