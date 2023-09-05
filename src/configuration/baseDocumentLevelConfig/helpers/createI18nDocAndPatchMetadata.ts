import {SanityClient, SanityDocumentLike} from 'sanity'

export const createI18nDocAndPatchMetadata = (
  translatedDoc: SanityDocumentLike,
  localeId: string,
  client: SanityClient,
  translationMetadata: SanityDocumentLike,
): void => {
  translatedDoc.language = localeId
  const translations = translationMetadata.translations as Record<string, any>[]
  const existingLocaleKey = translations.find((translation) => translation._key === localeId)
  const operation = existingLocaleKey ? 'replace' : 'after'
  const location = existingLocaleKey ? `translations[_key == "${localeId}"]` : 'translations[-1]'

  //remove system fields
  const {_updatedAt, _createdAt, ...rest} = translatedDoc
  client.create({...rest, _id: 'drafts.'}).then((doc) => {
    const _ref = doc._id.replace('drafts.', '')
    client
      .transaction()
      .patch(translationMetadata._id, (p) =>
        p.insert(operation, location, [
          {
            _key: localeId,
            value: {
              _type: 'reference',
              _ref,
              _weak: true,
              _strengthenOnPublish: {
                _weak: false,
                type: doc._type,
              },
            },
          },
        ]),
      )
      .commit()
  })
}
