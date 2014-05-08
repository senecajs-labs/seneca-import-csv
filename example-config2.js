
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
