import {SanityClient, SanityDocumentLike} from 'sanity'

export const createTranslationMetadata = (
  documentId: string,
  client: SanityClient,
  baseLanguage: string,
): Promise<SanityDocumentLike> => {
  return client.create({
    _type: 'translation.metadata',
    translations: [
      {
        _key: baseLanguage,
        value: {
          _type: 'reference',
          _ref: documentId,
        },
      },
    ],
  })
}
