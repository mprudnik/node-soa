module.exports.toObject = ({ required = [], properties }) => ({
  type: 'object',
  additionalProperties: false,
  required,
  properties,
});
