import type {SanityClient, SanityDocumentLike} from 'sanity'

export const createI18nDocAndPatchMetadata = async (
  translatedDoc: SanityDocumentLike,
  localeId: string,
  client: SanityClient,
  translationMetadata: SanityDocumentLike,
  languageField: string = 'language',
): Promise<void> => {
  translatedDoc[languageField] = localeId
  const translations = translationMetadata.translations as Record<string, any>[]
  const existingLocaleKey = translations.find((translation) => translation._key === localeId)
  const operation = existingLocaleKey ? 'replace' : 'after'
  const location = existingLocaleKey ? `translations[_key == "${localeId}"]` : 'translations[-1]'

  //remove system fields
  const {_updatedAt, _createdAt, ...rest} = translatedDoc
  const doc = await client.create({...rest, _id: 'drafts.'})
  const _ref = doc._id.replace('drafts.', '')
  await client
    .transaction()
    .patch(translationMetadata._id, (p) =>
      p.insert(operation, location, [
        {
          _key: localeId,
          _type: 'internationalizedArrayReferenceValue',
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
}
