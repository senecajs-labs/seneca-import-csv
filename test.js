
var test      = require('tap').test
  , seneca    = require('seneca')
  , importer  = require('./')
  , Joi       = require('joi')

test('importing csv lines as entities', function(t) {
  var s         = seneca()
    , pear      = s.make('pear')
    , instance  = importer.entity(s, 'pear')

  instance.end(new Buffer('name,price\nhello,200\n'))

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

  instance.write(new Buffer('name,price\na,400\n'))

  instance.end(new Buffer('hello,200\n'))

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

test('rowImported event', function(t) {
  var s         = seneca()
    , pear      = s.make('pear')
    , instance  = importer.entity(s, 'pear')
    , rows      = 0

  instance.on('rowImported', function() {
    rows++
  })

  instance.on('importCompleted', function() {
    t.equal(rows, 2)
    t.end()
  })

  instance.write(new Buffer('name,price\na,400\n'))

  instance.end(new Buffer('hello,200\n'))
})

test('rowsImported property', function(t) {
  var s         = seneca()
    , pear      = s.make('pear')
    , instance  = importer.entity(s, 'pear')

  instance.on('importCompleted', function() {
    t.equal(instance.rowsImported, 2)
    t.end()
  })

  instance.write(new Buffer('name,price\na,400\n'))

  instance.end(new Buffer('hello,200\n'))
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

  instance.end(new Buffer('name,price\nhello,200\n'))
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

  instance.write(new Buffer('name,price\na,400\n'))
  instance.end(new Buffer('hello,200\n'))
})

test('converting values', function(t) {
  var s         = seneca()
    , event     = s.make('event')
    , schema    = Joi.object().keys({
          name: Joi.string()
        , price: Joi.number().integer()
        , date: Joi.date()
      })
    , instance  = importer.entity(s, 'event', { schema: schema })
    , now       = new Date()

  instance.write(new Buffer('name,price,date\n'))
  instance.end(new Buffer('hello,200,' + now.toISOString()+ '\n'))

  instance.on('importCompleted', function() {
    event.list$({}, function(err, res) {
      t.notOk(err, 'no error')
      t.equal(res.length, 1, 'one result')
      t.equal(res[0].name, 'hello', 'same name')
      t.equal(res[0].price, 200, 'same price')
      t.deepEqual(res[0].date, now, 'same date')

      t.end()
    })
  })
})

test('stripping unknown keys', function(t) {
  var s         = seneca()
    , event     = s.make('event')
    , schema    = Joi.object().keys({
          name: Joi.string()
        , price: Joi.number().integer()
      })
    , instance  = importer.entity(s, 'event', { schema: schema })
    , now       = new Date()

  instance.write(new Buffer('name,price,date\n'))
  instance.end(new Buffer('hello,200,' + now.toISOString()+ '\n'))

  instance.on('importCompleted', function() {
    event.list$({}, function(err, res) {
      t.notOk(err, 'no error')
      t.equal(res.length, 1, 'one result')
      t.equal(res[0].name, 'hello', 'same name')
      t.equal(res[0].price, 200, 'same price')
      t.equal(res[0].date, undefined, 'no date')

      t.end()
    })
  })
})
