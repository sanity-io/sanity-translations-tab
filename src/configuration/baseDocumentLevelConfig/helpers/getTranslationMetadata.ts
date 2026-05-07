import {SanityClient, SanityDocumentLike} from 'sanity'

export const getTranslationMetadata = (
  id: string,
  client: SanityClient,
  baseLanguage: string,
): Promise<SanityDocumentLike | null> => {
  // Match by v5 `language` field first, falling back to legacy v4 `_key` so existing
  // metadata documents created before sanity-plugin-internationalized-array v5 keep
  // resolving while users migrate their content.
  return client.fetch(
    `*[
        _type == 'translation.metadata' &&
        translations[language == $baseLanguage || _key == $baseLanguage][0].value._ref == $id
      ][0]`,
    {baseLanguage, id},
  )
}
