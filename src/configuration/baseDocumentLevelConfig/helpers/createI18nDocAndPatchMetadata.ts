import {SanityClient, SanityDocumentLike} from 'sanity'

export const createI18nDocAndPatchMetadata = (
  translatedDoc: SanityDocumentLike,
  localeId: string,
  client: SanityClient,
  translationMetadataId: string,
): void => {
  translatedDoc.language = localeId
  client.create(translatedDoc).then((doc) => {
    client
      .transaction()
      .patch(translationMetadataId, (p) =>
        p.insert('after', 'translations[-1]', [
          {
            _key: localeId,
            value: {
              _type: 'reference',
              _ref: doc._id,
            },
          },
        ]),
      )
      .commit()
  })
}
