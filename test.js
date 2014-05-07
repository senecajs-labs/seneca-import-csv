
var test      = require('tap').test
  , seneca    = require('seneca')
  , importer  = require('./')

test('importing csv lines as entities', function(t) {
  var s         = seneca()
    , pear      = s.make('pear')
    , instance  = importer.entity(s, 'pear')

  instance.end('name,price\nhello,200\n')

  instance.on('importCompleted', function() {
    pear.list$({}, function(err, res) {
      t.notOk(err, 'no error')
      t.equal(res.length, 1, 'one result')
      t.equal(res[0].name, 'hello', 'same name')
      t.equal(res[0].price, '200', 'same price')

      t.end()
    })
  })
})

test('skipping the first N rows for entities', function(t) {
  var s         = seneca()
    , pear      = s.make('pear')
    , instance  = importer.entity(s, 'pear', { skip: 1 })

  instance.write('name,price\na,400\n')

  instance.end('hello,200\n')

  instance.on('importCompleted', function() {
    pear.list$({}, function(err, res) {
      t.notOk(err, 'no error')
      t.equal(res.length, 1, 'one result')
      t.equal(res[0].name, 'hello', 'same name')
      t.equal(res[0].price, '200', 'same price')

      t.end()
    })
  })
})

test('acting on every csv line', function(t) {
  t.plan(1)

  var s         = seneca()
    , pear      = s.make('pear')
    , pattern   = { sample: 'call' }
    , instance  = importer.act(s, pattern)
    , message   = { sample: 'call', name: 'hello', price: '200' }

  function check(arrived, done) {
    delete arrived.actid$
    t.deepEqual(arrived, message)
    done(null)
  }

  s.add(pattern, check);

  instance.end('name,price\nhello,200\n')
})

test('skipping the first N rows for acting', function(t) {
  t.plan(1)

  var s         = seneca()
    , pear      = s.make('pear')
    , pattern   = { sample: 'call' }
    , instance  = importer.act(s, pattern, { skip: 1 })
    , message   = { sample: 'call', name: 'hello', price: '200' }

  function check(arrived, done) {
    delete arrived.actid$
    t.deepEqual(arrived, message)
    done(null)
  }

  s.add(pattern, check);

  instance.write('name,price\na,400\n')
  instance.end('hello,200\n')
})
