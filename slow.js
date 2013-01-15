var async = require('async');

  //handle rate-limited asynchronous freebase calls with a ending callback
exports.in_bits=function(arr, fn, options, done) {
    var async_max=options.max||5;
    done=done||console.log
    //wrap them all in functions
    var function_list = arr.map(function(r,i) {
      return function(callback) {
        fn(r, function(r) {
          if(options.each_time){
            options.each_time(r, i)
          }
          callback(null, r);
        })
      }
    })
    //groups of async tasks in a synchonous task
    var all = groups_of(function_list, async_max).map(function(f_group) {
      return function(callback) {
        async.parallel(f_group, callback);
      }
    })
    async.series(all, function(err, result) {
      //flatten it one level
      result=result.reduce(function(a, b) {
          return a.concat(b);
      });
      done(result)
    });
  }

//explicitly set a pace
exports.per_minute=function(arr, fn, options, done){
  done=done||console.log
  var ppm=options.per_minute||60;
  var ms=(ppm*60) || 60;
  ms=Math.abs(ms).toFixed();
  var all=[]
  var doit=function(){
    fn(arr[all.length], function(r){
       if(options.each_time){
          options.each_time(r)
        }
        all.push(r)
        if(all.length>=arr.length){
          clearInterval(loop);
          return done(all)
        }
    })
  }
  var loop = setInterval(doit, ms);
}

//exports.per_minute( [1,2], my_function, {per_minute:-60, each_time:function(){console.log('hi')}}, console.log)


//send when recieved
exports.flow=function(arr, fn, options, done){
  done=done||console.log
  var max=Math.abs(options.max)||5;
  var going=0;
  var all=[];
  var i=0;
  var total_count=arr.length||0;
  var finished=false;

  var doit=function(){
    console.log('hi')
    going++;
    fn(arr[i], function(r){
      going--;
      i++;
      all.push(r)
      if(options.each_time){
        options.each_time(r)
      }
      if(finished==false && (going==0 || all.length==total_count)){
        finished=true;//stop any rogue functions from calling
        return done(all)
      }else{
        //doit()
      }
    })
  }
  //get some functions all going
  for(var x=0; x<=max; x<arr.length; x++){
    doit();
  }
}
exports.flow( [1,2,3,4,5,6,7], my_function, {max:1, each_time:function(){console.log('hi')}}, console.log)





function my_function(q, callback){
  var x=Math.floor(Math.random()*4000)
  setTimeout(function(){callback("finished "+q+" in "+x+"ms")}, x)
}


  //turn an array into smaller groups of arrays
  function groups_of(arr, group_length) {
    var all = []
    for(var i in arr) {
      if(i % group_length == 0) {
        all.push([arr[i]])
      } else {
        all[all.length - 1].push(arr[i])
      }
    }
    return all
  }
