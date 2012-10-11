
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

## boogers
Creative Commons, MIT
