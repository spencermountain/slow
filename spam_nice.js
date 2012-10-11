var request=require('request');
var async=require('async');

var data=[
  {title:"farming"},
  {title:"produce"},
  {title:"toronto"},
  {title:"ottawa"},
  {title:"hamilton"},
  {title:"justice"},
  {title:"parody"},
]


spam_nice(data, ask_wordnet, 2, console.log)

//handle our callbacks for our main task
function spam_nice(data, dothis, count, callback){
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
function waitabit(obj,callback){
	var r=Math.floor(Math.random()*1000)
	setTimeout(function(){
		obj.message="waited for " + r
		return callback(null, obj)
	}, r)
}
function ask_wordnet(obj, callback){
	var url='http://www.freebase.com/api/service/mqlread?query=%7B%20%22query%22%3A%20%5B%7B%20%22id%22%3A%20null%2C%20%22name%22%3A%20null%2C%20%22type%22%3A%20%22%2Fbase%2Fwordnet%2Fsynset%22%2C%20%22gloss%22%3A%20null%2C%20%20%22sort%22%3A%20%5B%20%22word.sense_number%22%20%5D%2C%20%22word%22%3A%20%7B%20%22sense_number%22%3A%20null%2C%20%22word%22%3A%20%7B%20%22word%22%3A%20%22'+obj.title+'%22%20%7D%20%7D%20%7D%5D%20%7D'
	  request({
	    uri: url,
	  }, function(error, response, body) {
	    var data=JSON.parse(body).result[0] || {}
	    obj.result=data.gloss;
	    callback(null,obj)
	  })
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