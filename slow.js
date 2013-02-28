var slow=(function(){
    var slow={};
    var arr=[1,2,3,4,5,6,7,8,9,10];

    slow.steady=function(arr, doit, options, done){
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
      options.debug=options.debug||false;
      options.verbose=options.verbose||false;
      if(typeof options.monitor!="function"){
        options.monitor=false;
      }
      if(typeof options.rate=="string"){
      //normalise everthing to bpm
        //convert bpm
        if(options.rate.match(/bpm$/i)){
          options.rate=parseInt(options.rate.replace(/bpm/i,''))||60;
        }
        //(per minute)
        else if(options.rate.match(/ ?(per )?min(ute)?$/i)){
          options.rate=parseInt(options.rate.replace(/ ?(per )?min(ute)?$/i,''))||60;
        }
       //(per hour)
        else if(options.rate.match(/ ?(per )?hour(ly)?$/i)){
          options.rate=parseInt(options.rate.replace(/ ?(per )?hour(ly)?$/i,''))||180;
          options.rate=options.rate/60;
        }
        //(per day)
        else if(options.rate.match(/ ?(per )?day$/i)){
          options.rate=parseInt(options.rate.replace(/ ?(per )?day$/i,''))||24;
          options.rate=options.rate/60/60;
        }
        //convert hertz
        else if(options.rate.match(/ ?he?rtz$/i)){
          options.rate=parseInt(options.rate.replace(/ ?he?r?t?z$/i,''));
          options.rate=Math.abs(options.rate*60)||60;
        }
       //(per second)
        else if(options.rate.match(/ ?(per )?sec(ond)?$/i)){
          options.rate=parseInt(options.rate.replace(/ ?(per )?sec(ond)?$/i,''))||60;
          options.rate=Math.abs(options.rate*60)||60;
        }
        //convert ms
        else if(options.rate.match(/ ?ms$/i)){
          options.rate=parseInt(options.rate.replace(/ ?ms$/i,''));
          options.rate=Math.abs(options.rate/60) || 60;
        }
        if(options.rate=="daily"){
          options.rate=86400000
        }
        if(options.rate=="hourly"){
          options.rate=3600000
        }
        options.rate=parseInt(options.rate);
      }
      //show.on.the.road..
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
            if(options.debug){console.log('-waiting for danglers-');}
            dangling++;
            return
          }
          //done.
          clearInterval(loop);
          if(options.verbose){
            all=make_verbose(arr, all);
          }
          return done(all)
        }
        //don't blow the stack
        if(current>=options.max){
          if(options.debug){console.log('whoa fella.');}
          return
        }
        i+=1;
        current+=1;
        //send the next one
         (function(){ //wrap it for scope
            var spot=i;
            if(options.debug){console.log('sending# '+spot+' - ('+current+' going at once)');}
            doit(arr[i],function(r){
             if(options.monitor){
                options.monitor(r, spot);
              }
              current-=1;
              all[spot]=r;
            })
         })()
      }
      options.rate=bpm_to_ms(options.rate);
      var loop = setInterval(iterate, options.rate);
    }
    //slow.steady(arr,my_function,{debug:true, rate:"86400 per day"})

    slow.heartbeat=function(arr, doit, options, done){
      options=options||{}
      options.rate=options.rate||"72bpm";
      slow.steady(arr, doit, options, done);
    }
    slow.walk=function(arr, doit, options, done){
      options=options||{}
      options.rate=options.rate||"120bpm";
      slow.steady(arr, doit, options, done);
    }
    slow.run=function(arr, doit, options, done){
      options=options||{}
      options.rate=options.rate||"180bpm";
      slow.steady(arr, doit, options, done);
    }
    slow.jog=function(arr, doit, options, done){
      options=options||{}
      options.rate=options.rate||"150bpm";
      slow.steady(arr, doit, options, done);
    }


    slow.crawl=function(arr, doit, options, done){
      options=options||{}
      options.rate=options.rate||"70bpm";
      slow.steady(arr, doit, options, done);
    }
   slow.minutely=function(arr, doit, options, done){
      options=options||{}
      options.rate=options.rate||"1 per minute";
      slow.steady(arr, doit, options, done);
    }
    slow.hourly=function(arr, doit, options, done){
      options=options||{}
      options.rate=options.rate||"1 per hour";
      slow.steady(arr, doit, options, done);
    }
   slow.daily=function(arr, doit, options, done){
      options=options||{}
      options.rate=options.rate||"1 per day";
      slow.steady(arr, doit, options, done);
    }

    //slow.walk(arr,my_function)

    function bpm_to_ms(bpm){
      var bps=Math.abs(bpm/60)||1
      return parseInt(1000/bps)
    }


    ///////////////////////////////
    /////maplimit functions
    //////////////////////////

    slow.pace=function(arr,fn,options,done){
      this.doc="keep a steady amount of things going at once"
      this.aliases=["flow","waterfall","steadfast"]
      var i =-1;
      var all=[];
      var at_once=0;
      if(typeof options=="function"){//flexible paramaters
        done=options;
        options={};
      }
      done=done||console.log;
      options=options||{};
      options.max=Math.abs(options.max)||5;
      options.verbose=options.verbose||false;
      options.debug=options.debug||false;
      if(typeof options.monitor!="function"){
        options.monitor=false;
      }
      function iterate(){
        (function(){//wrap scope
          i++;
          var spot=i;
          at_once++;
          if(options.debug){
            console.log("sending #"+i+" - ("+at_once+" going at once)");
          }
          fn(arr[i],function(result){
            if(options.monitor){
              options.monitor(result, spot);
            }
            at_once-=1;
            all[spot]=result;
            if(i<arr.length-1){
              iterate();
              return;
            }
            //think about ending
            if(at_once<=0){
              if(options.verbose){
                all=make_verbose(arr,all);
              }
              done(all);
            }
          })
        })()
      }
        //get initial functions going
      for(var x=0; (x<options.max && x<arr.length); x++){
        iterate();
      }
    }
    //slow.pace(arr,my_function,{debug:false, verbose:false, monitor:false, max:3},console.log)



    slow.patient=function(arr, doit, options, done){
      options=options||{}
      options.max=options.max||1;
      slow.pace(arr,doit,options,done)
    }
   slow.serial=function(arr, doit, options, done){
      options=options||{}
      options.max=options.max||1;
      slow.pace(arr,doit,options,done)
    }
    slow.handful=function(arr, doit, options, done){
      options=options||{}
      options.max=options.max||3;
      slow.pace(arr,doit,options,done)
    }
    slow.pocket=function(arr, doit, options, done){
      options=options||{}
      options.max=options.max||7;
      slow.pace(arr,doit,options,done)
    }
    slow.backpack=function(arr, doit, options, done){
      options=options||{}
      options.max=options.max||15;
      slow.pace(arr,doit,options,done)
    }
    slow.shovel=function(arr, doit, options, done){
      options=options||{}
      options.max=options.max||35;
      slow.pace(arr,doit,options,done)
    }
    //slow.handful(arr,my_function)


    function make_verbose(arr, result){
      return result.map(function(r,i){
        return {
          input:arr[i],
          result:r
         }
      })
    }


//export the module
    // AMD / RequireJS
    if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return slow;
        });
    }
    // Node.js
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = slow;
    }

    return slow;
})()



///////////Dirty stuff
Object.defineProperty(Array.prototype, 'slow', {
  value: function(fn, options, callback){
          slow.pace(this,fn,options,callback)
         }
})

Object.defineProperty(Array.prototype, 'walk', {
  value: function(fn, options, callback){
          slow.walk(this,fn,options,callback)
         }
})


//  r=[1,2,3,4,5,6,7]
//  for(var i in r){
//   console.log(i)
//  }
// r.slow(my_function)

     function my_function(q, callback){
      var x=Math.floor(Math.random()*4000)
      setTimeout(function(){callback("finished "+q+" in "+x+"ms")}, x)
    }