#Slow.js handles callbacks
##so you don't blow your stack or over-async nice web services.

lets you benefit from asynchronous programming, in a measured way.
slow is smooth, smooth is fast.


it goes:

     __npm install slow__


     slow=require('slow')
     slow__.walk__( [1,2,3,4], whatev, console.log);//gets the results, when they're done, in order
     function whatev(i, callback){
        setTimeout(callbck(i), Math.random()*4000); //randomly delay the callback
      }

unlike the [other](https://github.com/tatumizer/mesh) [woderful](https://raw.github.com/caolan/async) [async](https://github.com/kriszyp/node-promise) [libraries](http://tamejs.org), this one helps you set the pace, so you don't immediately fall-over. you can be safe with memory and respect external services.

#the methods are:
* slow.walk(arr, fn, [options], callback) //[120bpm](http://www.wolframalpha.com/input/?i=average+walking+pace)
* slow.jog(arr, fn, [options], callback)___//150bpm___
* slow.run(arr, fn, [options], callback)//180bpm
* slow.heartbeat(arr, fn, [options], callback)//72bpm
//these methods let you explicitly set a pace, but respect a maximum current request rate (defaults to 10)
(it begins at this pace, but slows it down if callbacks begin to build-up)


//these methods let you do just a few things at a time.
//you can give an async maximum, and they only do that many
//(just go as fast as your callback method does).

* slow.steady()

* slow.handful()//max=3
* slow.pocket()//max=7
* slow.backpack()//max=15
* slow.shovel()//max=35

##the options are:

     {
      __debug__: true, //understand when the requests are being fired
      __verbose__: true, //include the input in the results
      __monitor__: function(r){console.log(r.length)}, //watch the results coming in in real-time
      __max__: 10 //the most number of concurrent requests you're comfortable making
     }
but you can just ignore those tho

##in the f-ing Browzers!1
(2.8k)

    <script src="https://raw.github.com/spencermountain/slow/master/slow.min.js"></script>
    <script>
      slow.__walk__( [1,2,3,4,5,6,7], my_function, {max:3}, function(r){
        alert(r.join(', '))
      })
      function my_function(q, callback){
        var x=Math.floor(Math.random()*2000)
        setTimeout(function(){callback("finished "+q+" in "+x+"ms")}, x)
      }
    </script>

##what about my craziness..
if you're in a situation that needs fancy paramaters, wrap them up like this:

     slow.__steady__( [1,2,3,4], whatev, console.log);
     function whatev(i, callback){
        __my_craziness__(param1, param2, then_finally, a, __callback__) //works fine
      }

or if your function returns __[errror, result]__  (i hate that)

     slow.steady( [1,2,3,4], whatev, console.log);
     function whatev(i, callback){
        my_craziness(i, function(__err, result__){
          callback(__result__||err);//la de da;)
        })
      }


## boogers
MIT