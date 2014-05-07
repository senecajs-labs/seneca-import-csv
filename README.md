
SenecaImportCSV
===============

Import a CSV into Seneca

Standalone Usage
----------------

### Install

```bash
npm install seneca-import-csv -g
```

### Run

```bash
seneca-import-csv.js -f your-csv.csv -e your-entity -c ./example-config.json
checking  [===================] 100% 0.0s
importing [==                 ] 14% 16.8s
```

### Config Example

```js
{
  "store": "jsonfile-store",
  "opts": {
    "folder": "./db"
  }
}
```

Embedded Usage
--------------

### Install

```bash
npm install seneca-import-csv --save
```

### Import as Entities

```js
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
```

### Import by Acting

```js

var seneca    = require('seneca')()
  , importer  = require('./')
  , pear      = seneca.make('pear')
  , pattern   = { sample: 'call' }
  , instance  = importer.act(s, pattern)

function check(arrived, done) {
  console.log(arrived)
  done()
}

s.add(pattern, check);

instance.write('name,price\n')
instance.write('hello,200\n')
instance.end('matteo,400\n')
```

License
-------

ISC
