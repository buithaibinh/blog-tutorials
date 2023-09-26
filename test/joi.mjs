import Joi from 'joi';

const optionSchema = Joi.object().keys({
  status: Joi.string().valid('active', 'inactive').required()
});

const schema = Joi.object().keys({
  duration: Joi.number()
    .min(1)
    .max(100)
    .message(
      'Free subscription can only have duration between 1-10 seconds. Please upgrade to premium subscription to have longer duration.'
    )
    .optional(),
  options: optionSchema
    .keys({
      status: Joi.string().valid('active').required()
    })
    .required()
});

const extended = schema.keys({
  duration: Joi.number()
    .min(1)
    .max(20)
    .message(
      'Free subscription can only have duration between 1-10 seconds. Please upgrade to premium subscription to have longer duration.'
    )
    .optional()
});

const run = async () => {
  const { error, value } = extended.validate({
    duration: 10,
    options: { status: 'active' }
  });

  console.log(error, value);
};

run();
