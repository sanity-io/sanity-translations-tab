# sanity-translations-tab

This is the base module for implementing common translation vendor tasks from a Studio, such as sending content to be translated in some specific languages, importing content back etc. Not useful on its own, but a vendor specific plugin will use this for its chrome.

## Development

1. Clone this repo into a Studio's `plugins` directory.
2. Add `"sanity-translations-tab"` to the `plugins` key of `sanity.json`
3. Your Studio will need a Desk Structure configuration, here's an example of a schema called `translatable`

```js
import S from '@sanity/desk-tool/structure-builder'

import {
  TranslationsTab,
  DummyAdapter,
} from '../../plugins/sanity-translations-tab/src'

export const getDefaultDocumentNode = ({ schemaType }) => {
  if (schemaType === 'translatable') {
    return S.document().views([
      S.view.form(),
      S.view
        .component(TranslationsTab)
        .title('Translations')
        .options({
          // Vendor-specific plugins will have their own adapter, use this for dev
          adapter: DummyAdapter,
          // These two async functions are expected by the plugin
          exportForTranslation: async (props) => props,
          importTranslation: async (props) => props,
        }),
    ])
  }

  return S.document()
}

export default S.defaults()
```

To work on this module locally, run

```
npm start
```

To observe changes to the code, and at the same time run

```
npx parcel example/index.html
```

to run the component in a dev server
