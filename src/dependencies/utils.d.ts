type SchemaItem = { required?: string[], properties: Record<string, unknown> };
export function toObject(item: SchemaItem & { nullable?: boolean }): any;
