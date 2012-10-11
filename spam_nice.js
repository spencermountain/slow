var request=require('request');
var async=require('async');


//handle our callbacks for our main task
exports.spam_nice=function(data, dothis, count, callback){
	data=groups_of(data, count)
	async.series(
        data.map(function(sublist){return function(done){ doparallel(sublist, dothis, done) } }),
				callback
	);
}
//handle our callbacks for asynchonous sub-tasks
function doparallel(data, dothis, callback){
	return async.parallel(
        data.map(function(obj){return function(done){console.log(obj.title);dothis(obj, done)}}),
				callback
	);
}
function groups_of(arr, group_length){
	var all=[]
	for(var i in arr){
		if(i%group_length==0){
			all.push([arr[i]])
		}else{
			all[all.length-1].push(arr[i])
		}
	}
	return all
  }