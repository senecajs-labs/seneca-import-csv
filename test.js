
var test      = require('tap').test
  , seneca    = require('seneca')
  , importer  = require('./')

test('importing csv lines as entities', function(t) {
  var s         = seneca()
    , pear      = s.make('pear')
    , instance  = importer(s, 'pear')

  instance.end('name,price\nhello,200\n')

  instance.on('importCompleted', function() {
    pear.list$({}, function(err, res) {
      t.notOk(err)
      t.equal(res.length, 1)

      if (res[0]) {
        t.equal(res[0].name, 'hello')
        t.equal(res[0].price, '200')
      }

      t.end()
    })
  })
})
