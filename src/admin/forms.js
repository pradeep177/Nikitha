/** Read a (possibly dotted) path like "quiz_result_messages.low". */
export function getIn(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

/** Immutable set for a (possibly dotted) path. */
export function setIn(obj, path, value) {
  const [key, ...rest] = path.split('.')
  if (!rest.length) return { ...obj, [key]: value }
  return { ...obj, [key]: setIn(obj?.[key] ?? {}, rest.join('.'), value) }
}

const isBlank = (v) => v === null || v === undefined || (typeof v === 'string' && v.trim() === '')

/** Validates values against field configs; returns { [name]: message }. */
export function validateFields(fields, values) {
  const errors = {}
  for (const field of fields) {
    if (field.when && !field.when(values)) continue
    const value = getIn(values, field.name)
    if (field.required && isBlank(value)) {
      errors[field.name] = `${field.label} is required.`
      continue
    }
    if (isBlank(value)) continue
    if (field.maxLength && typeof value === 'string' && value.trim().length > field.maxLength) {
      errors[field.name] = `Please keep this under ${field.maxLength} characters (currently ${value.trim().length}).`
    } else if (field.type === 'url' && !/^https?:\/\/\S+$/i.test(value.trim())) {
      errors[field.name] = 'Please enter a full link starting with https://'
    } else if (field.type === 'date' && Number.isNaN(new Date(value).getTime())) {
      errors[field.name] = 'Please enter a valid date.'
    } else if (field.pattern && !field.pattern.test(value)) {
      errors[field.name] = field.patternMessage ?? 'This value has the wrong format.'
    }
    const custom = field.validate?.(value, values)
    if (custom) errors[field.name] = custom
  }
  return errors
}

/** Stable JSON for dirty-checking. */
export function snapshot(values) {
  return JSON.stringify(values ?? {}, Object.keys(values ?? {}).sort())
}

export function isDirty(fields, initial, current) {
  return fields.some((f) => JSON.stringify(getIn(initial, f.name) ?? null) !== JSON.stringify(getIn(current, f.name) ?? null))
}
