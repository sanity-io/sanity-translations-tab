import {SanityClient, SanityDocumentLike} from 'sanity'
import {randomKey} from '@sanity/util/content'

export const createI18nDocAndPatchMetadata = (
  translatedDoc: SanityDocumentLike,
  localeId: string,
  client: SanityClient,
  translationMetadata: SanityDocumentLike,
  languageField: string = 'language',
): void => {
  translatedDoc[languageField] = localeId
  const translations = translationMetadata.translations as Record<string, any>[]
  // Match by v5 `language` field, falling back to legacy v4 `_key` so that documents
  // created before sanity-plugin-internationalized-array v5 are still updated in-place.
  const existingLocaleEntry = translations.find(
    (translation) => translation.language === localeId || translation._key === localeId,
  )
  const operation = existingLocaleEntry ? 'replace' : 'after'
  const location = existingLocaleEntry
    ? `translations[language == "${localeId}" || _key == "${localeId}"]`
    : 'translations[-1]'

  //remove system fields
  const {_updatedAt, _createdAt, ...rest} = translatedDoc
  client.create({...rest, _id: 'drafts.'}).then((doc) => {
    const _ref = doc._id.replace('drafts.', '')
    client
      .transaction()
      .patch(translationMetadata._id, (p) =>
        p.insert(operation, location, [
          {
            // sanity-plugin-internationalized-array v5 stores the locale on a dedicated
            // `language` field and expects `_key` to be a unique random key.
            _key: randomKey(),
            _type: 'internationalizedArrayReferenceValue',
            language: localeId,
            value: {
              _type: 'reference',
              _ref,
              _weak: true,
              _strengthenOnPublish: {
                type: doc._type,
              },
            },
          },
        ]),
      )
      .commit()
  })
}
