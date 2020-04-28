# Making translations

As you can see in this folder there are 3 other files. You only need to look at `en.json` and `nl.json`.
They are for English and Dutch translation respectively. In your component there are a couple of ways to integrate
the localisation. Here I will show you how.

* [Localisation file structure](#localisation-file-structure)
* [Using localisation in components](#using-localisation-in-components)
    + [Template formatter](#template-formatter)
    + [Attribute formatter](#attribute-formatter)
    + [Typescript/Javascript formatter](#typescript-javascript-formatter)
* [Advanced example](#advanced-example)
* [More information](#more-information)

## Localisation file structure
First lets look at `en.json`. For each component a new JSON node will be created and under that node
all the translations will be put. Below is an example.

```json
{
  "componentName": {
    "string": "string"  
  }
}
```

In all the localisation methods the string will be accessible in the following matter: 
`'componentName.string'`. This might lead to some strings/words being in the localisation file twice
but it does also mean we can customize them per component if needed. To make two different localisation values
you will need to make sure in both `en.json` and `nl.json` the keys of the JSON file are the same, the values that the 
keys represent can differ.

## Using localisation in components
There are several ways to use the localisation in your components
### Template formatter
Where normally you would use `string` in your component you will now need to use `{{ $t('componentName.string') }}`. 
This will look up the value of string under component name in the json files.

### Attribute formatter
If you are using attributes to populate  text fields you can also localize these. Let's take a label for a b-form-group 
for example.

```vue
<b-form-group
  id="string"
  label="string"
>
</b-form-group>
```

Currently this is how the `b-form-group` is looking. To make sure the label attribute will be localized we have to 
change it in the following way.

```vue
<b-form-group
  id="string"
  :label="$t('componentName.string')"
>
</b-form-group>
```

### Typescript/Javascript formatter
If you have some string you are returning from your typescript you can localize these too. Instead of using 
`return 'string';`. You can now use `return this.$t('componentName.string');`.


## Advanced example
A more advanced example is when localizing table header from bootstrap-vue's `b-table` component.
Say you have a fields object in which you specify which columns to use. Earlier you did not have to
specify the headers specifically but now you do. 

If you have the following fields object and want to localize the label `'When'`:
```typescript
fields: Object[] = [
  {
    key: 'formattedDate',
    label: 'When',
  }
]
```

You would first need to of course add `"When"` as key:value pair to the localisation JSON files. Next you would need 
to add the following code to your `b-table` component:

```vue
<template v-slot:head(formattedDate)="data">
    <span v-if="data">{{ $t(`componentName.${data.label}`) }}</span>
</template>
``` 

This is a template formatter for the header data and uses `formattedDate`. Next we use a string formatter to build
the needed string such that the localisation method can find the string in our json files. This will result in a 
localised header. 

## More information
For extra info you can check out the docs of the plugin its self you can find them at [Vue i18n](https://kazupon.github.io/vue-i18n/).
