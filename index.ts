export const jsonToStructProto = (json) => {
  const fields = {};
  for (const k in json) {
    fields[k] = jsonValueToProto(json[k]);
  }

  return { fields };
};

const JSON_SIMPLE_TYPE_TO_PROTO_KIND_MAP = {
  [typeof 0]: 'numberValue',
  [typeof '']: 'stringValue',
  [typeof false]: 'boolValue',
};

const JSON_SIMPLE_VALUE_KINDS = new Set([
  'numberValue',
  'stringValue',
  'boolValue',
]);

export const jsonValueToProto = (value) => {
  const valueProto: any = {};

  if (value === null) {
    valueProto.nullValue = 'NULL_VALUE';
  } else if (value instanceof Array) {
    valueProto.listValue = { values: value.map(jsonValueToProto) };
  } else if (typeof value === 'object') {
    valueProto.structValue = jsonToStructProto(value);
  } else if (typeof value in JSON_SIMPLE_TYPE_TO_PROTO_KIND_MAP) {
    const kind = JSON_SIMPLE_TYPE_TO_PROTO_KIND_MAP[typeof value];
    valueProto[kind] = value;
  } else {
    console.warn('Unsupported value type ', typeof value);
  }
  return valueProto;
};

export const structProtoToJson = (proto) => {
  if (!proto || !proto.fields) {
    return {};
  }
  const json = {};
  for (const k in proto.fields) {
    json[k] = valueProtoToJson(proto.fields[k]);
  }
  return json;
};

export const valueProtoToJson = (proto) => {
  const kind = Object.keys(proto)[0];
  if (!proto || !kind) {
    return null;
  }

  if (JSON_SIMPLE_VALUE_KINDS.has(kind)) {
    return proto[kind];
  } else if (kind === 'nullValue') {
    return null;
  } else if (kind === 'listValue') {
    if (!proto.listValue || !proto.listValue.values) {
      console.warn('Invalid JSON list value proto: ', JSON.stringify(proto));
    }
    return proto.listValue.values.map(valueProtoToJson);
  } else if (kind === 'structValue') {
    return structProtoToJson(proto.structValue);
  } else {
    console.warn('Unsupported JSON value proto kind: ', kind);
    return null;
  }
};
