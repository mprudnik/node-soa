const toObject = (item) => ({
  type: 'object',
  additionalProperties: false,
  required: item.required,
  properties: item.properties,
  nullable: Boolean(item.nullable),
});

export default async () => ({
  toObject,
});
