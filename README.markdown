this library handles callbacks so you don't blow your stack, over-async a nice web service.

slow is smooth, smooth is fast.


it goes:

     npm install slow

     slow=require('slow')
     slow.patient( [1,2,3,4], whatev, console.log);//gets the results, when they're done, in order
     function whatev(i, callback){
        setTimeout(callbck(i), Math.random()*4000); //randomly delay the callback
      }

unlike the [woderful](https://raw.github.com/caolan/async) async libraries, this one helps you set the pace, so you don't immediately fall-over. you can be safe with memory and respect external services.

#the methods are:
*slow.walk(arr, fn, [options], callback)
*slow.jog(arr, options, [fn], callback)
*slow.heartbeat(arr, fn, [options], callback)//72bpm
*slow.run(arr, fn, [options], callback)
//these methods let you explicitly set a pace, but respect a maximum current request rate (defaults to 10)
(it begins at this pace, but slows it down if callbacks begin to build-up)


//these methods let you do just a few things at a time.
//you can give an async maximum, and they only do that many
//(just go as fast as your callback method does).
*slow.steady()

*slow.handful()//max=3
*slow.pocket()//max=7
*slow.backpack()//max=15
*slow.shovel()//max=35

##browser
    <script src="./slow.js"></script>
    <script src="https://raw.github.com/caolan/async/master/lib/async.js"></script>
    <script>
      slow.walk( [1,2,3,4,5,6,7], my_function, {max:3}, function(r){
        alert(r.join(', '))
      })
      function my_function(q, callback){
        var x=Math.floor(Math.random()*2000)
        setTimeout(function(){callback("finished "+q+" in "+x+"ms")}, x)
      }
    </script>
    <div id="result"></div>

##what about my craziness..
if you're in a situation that needs fancy paramaters, wrap them up like this:

     slow.steady( [1,2,3,4], whatev, console.log);
     function whatev(i, callback){
        my_craziness(param1, param2, then_finally, a, callback) //works fine
      }

or if your function returns [errror, result]  (i hate that)

     slow.steady( [1,2,3,4], whatev, console.log);
     function whatev(i, callback){
        my_craziness(i, function(err, result){
          callback(result||err);//la de da;)
        })
      }


## boogers
MIT