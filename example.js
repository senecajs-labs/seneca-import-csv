var seneca    = require('seneca')()
  , importer  = require('./')

seneca.use('jsonfile-store', {folder:'./db'})

seneca.ready(function() {
  var pear      = seneca.make('pear')
    , instance  = importer.entity(seneca, 'pear')

  instance.write('name,price\n')
  instance.write('hello,200\n')
  instance.end('matteo,400\n')

  instance.on('importCompleted', function() {
    pear.list$({}, function(err, res) {
      console.log(res)
    })
  })
})
