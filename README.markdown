Marsellus Wallace

nodejs library to rate-limit your dangerous-ass

stop your async requests from taking-down someone's shit, you know? Cause I know you don't wanna take down nobody's shit.

this async library will only fire five shots at a time.

     rate_limit=require('rate_limit');
     rate_limit( [1,2,3,4,5,6,7], do_my_function, options, console.log)

*options.max = maximum # of async requests to run at once
*options.each_time = function to monitor the script's progress, calls each time a request finishes

##browser
    <script src="./rate_limit.js"></script>
    <script src="http://code.jquery.com/jquery-latest.js"></script>
    <script src="https://raw.github.com/caolan/async/master/lib/async.js"></script>
    <script>
    $(function() {
      rate_limit( [1,2,3,4,5,6,7], my_function, {max:3}, function(r){
        $("#result").html(r.join('<br/>'))
      })
      function my_function(q, callback){
        var x=Math.floor(Math.random()*2000)
        setTimeout(function(){callback("finished "+q+" in "+x+"ms")}, x)
      }
    })
    </script>
    <div id="result"></div>

you know you better use a callback library with two-hands, and it'll keep your player-ass from taken down somebodys server by accident, on account of your player-ass.

## boogers
MIT