var async=require('async');
at_once=0;
max=200

var arr=[1,2,3,4,5,6,7,8,9,10];

//http://www.wolframalpha.com/input/?i=average+walking+speed
//slow.breath //2500
//slow.walk //100pm   //600ms
//slow.jog  //180pm  //300ms
//slow.run  //180pm  //200ms
//slow.heartrate //72bpm

//slow.pace

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
  console.log(options)
  var loop = setInterval(iterate, options.rate);
}
exports.pace(arr,my_function,{rate:"250bpm"})



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
//exports.flow(arr, my_function,  console.log)


exports.patient=function(arr, fn, options, done){
  this.docs="do only one call at a time";
  this.aliases=["serial","one_at_a_time","in_serial"]
  if(typeof options=="function"){done=options;options={};}//flexible callback parameter
  options=options||{}
  options.max=options.max||1;
  exports.steady(arr,fn,options,done)
}
//exports.patient(arr, my_function, {}, console.log)


function my_function(q, callback){
  at_once++;
  //console.log(at_once+" AT ONCE")
  var x=Math.floor(Math.random()*4000)
  setTimeout(function(){callback("finished "+q+" in "+x+"ms")}, x)
}

// var settle_params=function(params,method,defaults){
//   var o={
//     valid:false,
//     q:params[0],
//     options:params[1] || {},
//     callback:params[2] || console.log,
//     defaults:defaults || {},
//     method:method||''
//   }
//    //flexible parameters
//   if(typeof o.options=="function"){
//     o.callback=o.options;
//     o.options={};
//   }
//   return o
// }