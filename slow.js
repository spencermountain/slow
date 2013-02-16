var async=require('async');
at_once=0;
max=200

var arr=[1,2,3,4,5,6,7,8,9,10];

exports.pace=function(arr, doit, options, done){
  this.aliases=["rate","speed"]
  this.doc="explicitly decide the speed, with an optional maximum limit for safety"
  if(typeof options=="function"){//(be flexible)
    done=options;
    options={};
  }
  done=done||console.log;
  options=options||{}
  options.rate=options.rate||options.speed||options.pace||options.bpm||60;
  options.max=options.max||5;
  options.debug=options.debug||true;
  if(typeof options.rate=="string"){
    //convert bpm
    if(options.rate.match(/bpm$/i)){
      options.rate=parseInt(options.rate.replace(/bpm/i,''))||60;
    }
    //convert hertz
    else if(options.rate.match(/he?rtz$/i)){
      options.rate=parseInt(options.rate.replace(/he?r?t?z$/i,''));
      options.rate=Math.abs(options.rate*60)||60;
    }
    //convert ms
    else if(options.rate.match(/ms$/i)){
      options.rate=parseInt(options.rate.replace(/ms$/i,''));
      options.rate=Math.abs(options.rate/60) || 60;
    }
    options.rate=parseInt(options.rate);
  }
  var i=-1;
  var all=[]
  var current=0;
  var dangling=0;
  var timeout=arr.length/2;
  if(timeout<5){timeout=10;}

  function iterate(){
    //done?
    if(i>=(arr.length-1)){
      //ignore danglers after a while, to avoid inf loop
      if(current!=0 && dangling<timeout){
        if(options.debug){console.log('waiting for danglers');}
        dangling++;
        return
      }
      clearInterval(loop);
      return done(all)
    }
    //don't blow the stack
    if(current>=options.max){
      if(options.debug){console.log('whoa fella');}
      return
    }
    i+=1;
    current+=1;
    //wrap it to preserve ordering
     (function(){
        var spot=i;
        if(options.debug){console.log('sending# '+spot);}
        doit(arr[i],function(r){
          current-=1;
          all[spot]=r;
        })
     })()
  }
  options.rate=bpm_to_ms(options.rate);
  var loop = setInterval(iterate, options.rate);
}
//exports.pace(arr,my_function,{rate:"250bpm"})

exports.heartbeat=function(arr, doit, options, done){
  options=options||{}
  options.rate=options.rate||"72bpm";
  exports.pace(arr, doit, options, done);
}
exports.walk=function(arr, doit, options, done){
  options=options||{}
  options.rate=options.rate||"120bpm";
  exports.pace(arr, doit, options, done);
}
exports.run=function(arr, doit, options, done){
  options=options||{}
  options.rate=options.rate||"180bpm";
  exports.pace(arr, doit, options, done);
}
exports.jog=function(arr, doit, options, done){
  options=options||{}
  options.rate=options.rate||"150bpm";
  exports.pace(arr, doit, options, done);
}
//exports.walk(arr,my_function)

function bpm_to_ms(bpm){
  var bps=Math.abs(bpm/60)||1
  return parseInt(1000/bps)
}

exports.steady=function(arr, doit, options, done){
  this.doc="keep a steady amount of things going at once"
  this.aliases=["flow","waterfall","steadfast"]
  if(typeof options=="function"){
    done=options;
    options={};
  }
  done=done||console.log;
  options=options||{}
  options.debug=options.debug||true;
  options.max=Math.abs(options.max)||5;

  //make it async-friendly
  var unpack=function(x, callback){
    doit(x,function(result){
      at_once=at_once-1;
      callback(null,result);
    })
  }
  async.mapLimit( arr, options.max, unpack, function(err,result){
    return done(result);
  })
}

exports.patient=function(arr, doit, options, done){
  options=options||{}
  options.max=options.max||1;
  exports.steady(arr,doit,options,done)
}
exports.handful=function(arr, doit, options, done){
  options=options||{}
  options.max=options.max||3;
  exports.steady(arr,doit,options,done)
}
exports.pocket=function(arr, doit, options, done){
  options=options||{}
  options.max=options.max||7;
  exports.steady(arr,doit,options,done)
}
exports.backpack=function(arr, doit, options, done){
  options=options||{}
  options.max=options.max||15;
  exports.steady(arr,doit,options,done)
}
exports.shovel=function(arr, doit, options, done){
  options=options||{}
  options.max=options.max||35;
  exports.steady(arr,doit,options,done)
}
//exports.handful(arr,my_function)

function my_function(q, callback){
  at_once++;
  console.log(at_once+" at once")
  var x=Math.floor(Math.random()*4000)
  setTimeout(function(){callback("finished "+q+" in "+x+"ms")}, x)
}
