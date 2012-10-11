
nodejs library to handle callback-stuff when you're calling a website and don't wanna kill.

it lets you set a maximum number of requests at a time, so you don't seem like a bugger.

but its way more bad-ass than doing it one-at-a-time.

## Installation

    $ npm install spamnice

then make a file with:

    var spam_nice=require('spam_nice');
    spam_nice( my-data, my-function, max-requests, final-callback)

## Showing off

    var data=[
      {title:"farming"},
      {title:"produce"},
      {title:"booger"},
      {title:"toronto"},
      {title:"washington"}
    ]
    spam_nice(data, ask_wordnet, 2, console.log)

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
## boogers
Creative Commons, MIT
