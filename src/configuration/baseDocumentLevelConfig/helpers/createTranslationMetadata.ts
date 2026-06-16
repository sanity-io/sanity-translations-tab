import {KeyedObject, Reference, SanityClient, SanityDocumentLike} from 'sanity'
import {randomKey} from '@sanity/util/content'

type TranslationReference = KeyedObject & {
  _type: 'internationalizedArrayReferenceValue'
  language: string
  value: Reference
}

export const createTranslationMetadata = (
  document: SanityDocumentLike,
  client: SanityClient,
  baseLanguage: string,
): Promise<SanityDocumentLike> => {
  const baseLangEntry: TranslationReference = {
    // sanity-plugin-internationalized-array v5 stores the locale on a dedicated
    // `language` field and expects `_key` to be a unique random key.
    _key: randomKey(),
    _type: 'internationalizedArrayReferenceValue',
    language: baseLanguage,
    value: {
      _type: 'reference',
      _ref: document._id.replace('drafts.', ''),
    },
  }

  if (document._id.startsWith('drafts.')) {
    baseLangEntry.value = {
      ...baseLangEntry.value,
      _weak: true,
      //this should reflect doc i18n config when this
      //plugin is able to take that as a config option
      _strengthenOnPublish: {
        type: document._type,
      },
    }
  }

  return client.create({
    _type: 'translation.metadata',
    translations: [baseLangEntry],
  })
}
