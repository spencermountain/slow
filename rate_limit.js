  //handle rate-limited asynchronous freebase calls with a ending callback
var rate_limit=function(arr, fn, options, done) {
  	async_max=options.max||5;
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

  //exports.rate_limit=rate_limit;