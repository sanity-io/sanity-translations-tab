# sanity-translations-tab

This is the base module for implementing common translation vendor tasks from a Studio, such as sending content to be translated in some specific languages, importing content back etc. Not useful on its own, but vendor-specific plugins will use this for its chrome.

## In-studio development

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
          exportForTranslation: async props => props,
          importTranslation: async props => props,
          /**
           * If the translation vendor has different workflow options,
           * such as machine translation or human, pass them here and
           * they'll be displayed as Select menu options in the tab.
           * If one or more options are included, there will automatically
           * be a "Default" option that will submit the form with no
           * additional parameters
           */
          workflowOptions: [
            {
              workflowUid: '123',
              workflowName: 'Machine Translation (testing)',
            },
          ],
          /**
           * Optional sync or async function used on translation import to
           * Sanity, if the locale codes used by the translation vendor don't
           * match Sanity's. Receives the vendor locale ID and returns the
           * corresponding Sanity ID.
           */
          localeIdAdapter: translationVendorId => sanityId,

          /**
           * For field-level translations, the key for the "source content"
           *  (e.g. "en" or "en_US").
           */
          baseLanguage: 'en_US',
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

## Isolated development

To develop this plugin as a separate repository (outside of your studio environment) and test it locally in a studio during development, you'll need:

- a Sanity studio with a custom desk structure that uses `TranslationsTab` (see implementation of [Studio Plugin for Sanity & Smartling](https://github.com/sanity-io/sanity-plugin-studio-smartling))
- a [symlink](https://medium.com/dailyjs/how-to-use-npm-link-7375b6219557) configured to run `TranslationsTab` from this local development version.

Assuming you already have a studio, the following will get you up and running with a forked repo and symlink:

1. Fork or clone this repo locally in its own directory (not as part of a studio)
2. Run `npm install` to install the plugin's dependencies.
3. Run `npm link` from this plugin's directory (eg, `~/code/sanity-translations-tab`) to create a global symlink to this local instance of the `sanity-translations-tab` dependency.
4. Run `npm run build` to compile an initial version.
5. Run `npm link sanity-translations-tab` inside the directory of the studio you want to use the plugin in (eg, `~/code/my-studio`). This will tell the studio application to use the global symlink to this instance of the dependency.
6. Add `import { TranslationsTab } from 'sanity-translations-tab'` to `deskStructure.js` in the studio. If previously importing `TranslationsTab` from an adapter library such as `sanity-plugin-smartling-studio`, remove that import statement.
7. Run `sanity start` to run the studio locally.
8. Run `npm run start` from the `sanity-translations-tab` directory to start a watch task.
9. Start making changes to the translations tab, as needed, and they should automatically compile in the studio in the browser.
