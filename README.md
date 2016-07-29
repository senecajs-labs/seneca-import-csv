![SenecaLogo][]
> A [Seneca.js][seneca] plugin.

# seneca-import-CSV

Import a CSV into Seneca

## Standalone Usage

### Install

```bash
$ npm install seneca-import-csv -g
```

### Run

```bash
$ seneca-import-csv.js -f your-csv.csv -e your-entity -c ./example-config.json
checking  [===================] 100% 0.0s
importing [==                 ] 14% 16.8s
```

You can also specify a `-r file` flag to say when and how to resume the
import.

### Config Example

The importer supports both a JSON-based configuration and a module-based
configuration.

#### JSON configuration

```js
{
  "store": "jsonfile-store",
  "opts": {
    "folder": "./db"
  }
}
```

#### module-based configuration

```js
module.exports = function(seneca, Joi) {
  seneca.use('jsonfile-store', {
    "folder": "./db"
  })

  return Joi.object().keys({
    Yr: Joi.number().integer(),
    Mn: Joi.number().integer(),
    "Date Excel": Joi.number().integer(),
    Date: Joi.string(),
    "CO2 [ppm]": Joi.number()
  })
}
```

See the documentation of [Joi](https://github.com/hapijs/joi) for all
the possible options with defining the schema.
The options passed to the `Joi.validate` functions are `convert: true`
and `stripUnknown: true`.

#### JSON configuration

### Auto resume

SenecaImportCSV allows to resume a previously stopped (or crashed)
import sequence.

```bash
$ seneca-import-csv.js -f your-csv.csv -e your-entity -c ./example-config.json -r resume-file
checking  [===================] 100% 0.0s
importing [                   ] 6% 19.6s^C
$ seneca-import-csv.js -f your-csv.csv -e your-entity -c ./example-config.json -r resume-file
checking  [===================] 100% 0.0s
skipping 502 rows
importing [==                 ] 14% 8.7s^C
```

## Embedded Usage

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

## Acknowledgements

This project was kindly sponsored by [nearForm](http://nearform.com).

## Contributing

The [Senecajs org][] encourage open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

## License

Copyright Matteo Collina and other contributors 2014 - 2016, Licensed under [MIT][].

[SenecaLogo]: https://camo.githubusercontent.com/4a0178ff2abf26f9214d4d98bc23eec356ced357/687474703a2f2f73656e6563616a732e6f72672f66696c65732f6173736574732f73656e6563612d6c6f676f2e706e67
[seneca]: http://senecajs.org/
[Senecajs org]: https://github.com/senecajs/
[MIT]: ./LICENSE