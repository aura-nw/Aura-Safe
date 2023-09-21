import { Schema, Validator } from 'jsonschema'

export function makeSchemaInput(validator: Validator): any[] {
  try {
    const result = validator.schemas['/'].oneOf
      ?.map((msg) => {
        try {
          const properties = getProperties(msg, validator)
          return properties
        } catch (e) {
          return null
        }
      })
      .filter((list) => list && list?.fieldName !== 'upload_logo') // ignore case upload_logo - CW20
    return result || []
  } catch (error) {
    throw new Error(error)
  }
}

function getProperties(schema: Schema, validator: Validator) {
  try {
    const fieldName = Object.keys(schema.properties || {}).at(0)
    if (!fieldName) throw new Error('No property')
    const ref = (schema.properties?.[fieldName] as any)?.['$ref']

    const props = ref ? getRef(validator.schemas, ref) : schema.properties?.[fieldName]

    const childProps = props?.properties
    let fieldList: any

    if (childProps) {
      fieldList = Object.keys(childProps).map((e) => ({
        isAddButtonZero: e === 'amount', //button add zero for amount field
        fieldName: e,
        isRequired: (props.required as string[])?.includes(e),
        ...getType(validator.schemas, childProps[e]),
      }))
    }
    return {
      fieldName,
      properties: props,
      fieldList,
    }
  } catch (error) {
    console.error('e45', error)
    throw new Error(error)
  }
}

function getRef(rootSchemas, ref: string) {
  if (ref) {
    if (rootSchemas && rootSchemas[`/${ref}`]) {
      return rootSchemas[`/${ref}`]
    }
  }

  return null
}

function getRefType(rootSchema, ref: string): string | string[] {
  try {
    if (ref && rootSchema) {
      if (rootSchema && rootSchema[`/${ref}`]) {
        const _ref = rootSchema[`/${ref}`]
        const type = _ref.type
        if (type === 'object') {
        }
        return rootSchema[`/${ref}`].type
      }
    }

    return 'any'
  } catch (error) {
    throw new Error(error)
  }
}

function getType(rootSchema, schema) {
  try {
    const { $ref: ref, type: _type } = schema
    const isBinary = ref === '#/definitions/Binary'

    const type = ref ? getRefType(rootSchema, ref) : _type

    return {
      type: type || 'any',
      isBinary,
    }
  } catch (error) {
    throw new Error(error)
  }
}
