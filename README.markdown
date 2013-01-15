yoga for your javascript async functions

handles your callback-flow so nothing blows up

it goes:

     npm install slow

     slow=require('slow');
     slow.in_bits( [1,2,3,4,5,6,7], each_function, options, console.log)

*options.max = maximum # of async requests to run at once
*options.each_time = function that calls each time a request finishes [function(result, count)]

##browser
    <script src="./slow.js"></script>
    <script src="http://code.jquery.com/jquery-latest.js"></script>
    <script src="https://raw.github.com/caolan/async/master/lib/async.js"></script>
    <script>
    $(function() {
      slow.in_bits( [1,2,3,4,5,6,7], my_function, {max:3}, function(r){
        $("#result").html(r.join('<br/>'))
      })
      function my_function(q, callback){
        var x=Math.floor(Math.random()*2000)
        setTimeout(function(){callback("finished "+q+" in "+x+"ms")}, x)
      }
    })
    </script>
    <div id="result"></div>


## boogers
MIT