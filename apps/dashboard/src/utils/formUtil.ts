import * as yup from "yup";
import type { Ref } from "vue";
import type { BaseFieldProps, FormContext, GenericObject, TypedSchema } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import { useForm } from "vee-validate";

export interface Form<T> {
  context: FormContext
  schema:  TypedSchema
  model: { [K in keyof T]: { value: Ref, attr: Ref<BaseFieldProps & GenericObject> } }
  submit: () => Promise<any>
}

const specToFields = <T extends Record<string, yup.AnySchema>>(spec: T, ctx: FormContext):
  { [K in keyof T]: { value: Ref, attr: Ref<BaseFieldProps & GenericObject> } } => {
  const fields = {} as { [K in keyof T]: { value: Ref, attr: Ref<BaseFieldProps & GenericObject> } };
  for (const key in spec) {
    if (Object.prototype.hasOwnProperty.call(spec, key)) {
      const f = ctx.defineField(key as keyof typeof ctx.defineField);
      fields[key] = { value: f[0], attr: f[1] };
    }
  }
  return fields;
};

export function specToForm<T extends Record<string, yup.AnySchema>>(spec: T): Form<T> {
  const schema = toTypedSchema(
    yup.object(spec)
  );

  const context = useForm({
    validationSchema: schema,
  });

  const model = specToFields(spec, context);
  return {
    context,
    schema,
    model,
    submit: async () => console.error("Submit not implemented"),
  };
}

