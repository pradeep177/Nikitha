import { getIn } from '@/admin/forms'
import FormField from './FormField'

/** Lays out a list of field configs as a responsive form grid. */
export default function FieldGrid({ fields, values, errors, setValue, context }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields
        .filter((f) => !f.when || f.when(values))
        .map((field) =>
          field.type === 'heading' ? (
            <h2 key={field.name} className="pt-2 font-hand text-2xl font-bold text-ink sm:col-span-2">
              {field.label}
            </h2>
          ) : (
            <FormField
              key={field.name}
              field={field}
              value={getIn(values, field.name)}
              onChange={(v) => setValue(field.name, v)}
              error={errors?.[field.name]}
              values={values}
              setValue={setValue}
              context={context}
            />
          ),
        )}
    </div>
  )
}
