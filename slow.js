
exports.per_minute=function(arr, fn, options, done){
  this.docs="explicitly set a pace"
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
//exports.per_minute( [1,2], my_function, {per_minute:60, each_time:function(){console.log('hi')}}, console.log)

exports.flow=function(arr, fn, options, done){
  this.docs="keep the calls at a constant level"
  done=done||console.log;
  this.max=Math.abs(options.max)||5;
  this.sent=0;
  this.results=[];
  this.out=0;
  var f=this;
  function iterate(){
    f.sent++;
    f.out++;
    //console.log('send '+(f.sent-1))
    fn(arr[f.sent-1],function(r){
      f.out--;
      f.results.push(r);
      //console.log('=back=='+f.results.length + ' ==')
      if(options.each_time){
        options.each_time(r)
      }
      if(f.sent<arr.length){
        iterate()
      }else{
        if(f.results.length<arr.length){
          //console.log('don\'t kill')
        }else{
          done(f.results)
        }
      }
    })
  }
    //get initial functions going
  for(var x=0; (x<this.max && x<arr.length); x++){
    iterate();
  }
}
//exports.flow( [1,2,3,4,5,6,7], my_function, {max:3, each_time:function(r){console.log(r)}}, console.log)
//exports.flow( [1,2,3,4,5,6,7], my_function, {max:1}, console.log)

exports.serial=function(arr, fn, options, done){
  options=options||{}
  options.max=options.max||1;
  exports.flow(arr,fn,options,done)
}
//exports.serial( [1,2,3,4,5,6,7], my_function)



exports.in_bits2=function(arr, fn, options, done) {
    this.docs="process the data in bunches, ending callback"
    options=options||{}
    options.max=options.max||5;
    done=done||console.log;

    this.all=groups_of(arr, options.max);
    console.log(this.all)
    this.one=function(r, callback){
      console.log(r)
      console.log('===========')
      exports.flow(r, fn, {max:2}, function(d){
        callback('s')
      })
    }
    exports.flow(this.all, this.one, {max:1}, done)
}
//exports.in_bits2( [1,2,3,4,5,6,7], my_function, {max:3})

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


function my_function(q, callback){
  var x=Math.floor(Math.random()*4000)
  setTimeout(function(){callback("finished "+q+" in "+x+"ms")}, x)
}
