import {SanityClient, SanityDocumentLike} from 'sanity'

export const createI18nDocAndPatchMetadata = (
  translatedDoc: SanityDocumentLike,
  localeId: string,
  client: SanityClient,
  translationMetadataId: string,
): void => {
  translatedDoc.language = localeId
  //remove system fields
  const {_id, _rev, _updatedAt, _createdAt, ...rest} = translatedDoc
  client.create(rest).then((doc) => {
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
