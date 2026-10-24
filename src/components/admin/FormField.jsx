import Switch from './Switch'
import MediaField from './MediaField'
import CollageField from './CollageField'
import { inputClass } from '@/utils/ui'

/**
 * Renders one form control from a field config:
 * { name, label, type, required, maxLength, rows, options, help, placeholder, media, render }
 */
export default function FormField({ field, value, onChange, error, values, setValue, context }) {
  const id = `field-${field.name.replaceAll('.', '-')}`
  const helpId = field.help ? `${id}-help` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined
  const common = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    'aria-required': field.required || undefined,
    disabled: field.disabled,
  }
  const length = typeof value === 'string' ? value.trim().length : 0
  const options = typeof field.options === 'function' ? field.options(context, values) : field.options

  let control
  switch (field.type) {
    case 'textarea':
      control = (
        <textarea
          {...common}
          rows={field.rows ?? 4}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      )
      break
    case 'select':
      control = (
        <select {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)} className={inputClass}>
          {!field.required && <option value="">{field.emptyLabel ?? '— None —'}</option>}
          {options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )
      break
    case 'switch':
      control = (
        <div className="flex min-h-12 items-center gap-3">
          <Switch id={id} checked={!!value} onChange={onChange} label={field.label} />
          <span className="text-sm text-ink-soft">{value ? (field.onLabel ?? 'Yes') : (field.offLabel ?? 'No')}</span>
        </div>
      )
      break
    case 'media':
      control = <MediaField id={id} value={value} onChange={onChange} media={field.media} describedBy={describedBy} values={values} setValue={setValue} />
      break
    case 'collage':
      control = <CollageField id={id} value={value} onChange={onChange} media={field.media} describedBy={describedBy} />
      break
    case 'custom':
      control = field.render({ id, value, onChange, values, setValue, context, describedBy })
      break
    default:
      control = (
        <input
          {...common}
          type={field.type === 'url' ? 'url' : field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
          inputMode={field.type === 'url' ? 'url' : undefined}
          value={value ?? ''}
          onChange={(e) => onChange(field.type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)}
          placeholder={field.placeholder}
          className={inputClass}
        />
      )
  }

  const LabelTag = ['switch', 'media', 'collage', 'custom'].includes(field.type) ? 'p' : 'label'

  return (
    <div className={field.full === false ? '' : 'sm:col-span-2'}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <LabelTag {...(LabelTag === 'label' ? { htmlFor: id } : { id: `${id}-label` })} className="text-sm font-extrabold text-ink">
          {field.label}
          {field.required && <span className="text-berry"> *</span>}
        </LabelTag>
        {field.maxLength && (field.type === 'textarea' || field.type === 'text' || !field.type) && (
          <span className={`text-xs tabular-nums ${length > field.maxLength ? 'font-bold text-berry-deep' : 'text-ink-soft'}`}>
            {length}/{field.maxLength}
          </span>
        )}
      </div>
      {control}
      {field.help && (
        <p id={helpId} className="mt-1 text-xs text-ink-soft">
          {field.help}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm font-bold text-berry-deep">
          {error}
        </p>
      )}
    </div>
  )
}
