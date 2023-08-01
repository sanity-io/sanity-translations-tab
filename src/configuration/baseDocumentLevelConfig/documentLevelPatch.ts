import {SanityClient, SanityDocument, SanityDocumentLike} from 'sanity'
import {BaseDocumentMerger} from 'sanity-naive-html-serializer'

import {findLatestDraft, findDocumentAtRevision} from '../utils'
import {
  createI18nDocAndPatchMetadata,
  getTranslationMetadata,
  createTranslationMetadata,
  patchI18nDoc,
} from './helpers'

export const documentLevelPatch = async (
  documentId: string,
  translatedFields: SanityDocument,
  localeId: string,
  client: SanityClient,
  baseLanguage: string = 'en',
): Promise<void> => {
  let baseDoc: SanityDocument | null = null

  /*
   * we send over the _rev with our translation file so we can
   * accurately coalesce the translations in case something has
   * changed in the base document since translating
   */
  if (translatedFields._id && translatedFields._rev) {
    baseDoc = await findDocumentAtRevision(translatedFields._id, translatedFields._rev, client)
  }
  if (!baseDoc) {
    baseDoc = await findLatestDraft(documentId, client)
  }
  /*
   * we then merge the translation with the base document
   * to create a document that contains the translation and everything
   * that wasn't sent over for translation
   */
  const merged = BaseDocumentMerger.documentLevelMerge(
    translatedFields,
    baseDoc,
  ) as SanityDocumentLike

  /* we now need to check if we have a translation metadata document
   * and a translated document
   * if no metadata exists, we create it
   */
  let translationMetadata = await getTranslationMetadata(documentId, client, baseLanguage)
  if (!translationMetadata) {
    translationMetadata = await createTranslationMetadata(documentId, client, baseLanguage)
  }

  const i18nDocId = (translationMetadata.translations as Array<Record<string, any>>).find(
    (translation) => translation._key === localeId,
  )?.value?._ref

  //if we have a translated document, we patch it
  if (i18nDocId) {
    //get draft or published
    const i18nDoc = await findLatestDraft(i18nDocId, client)
    patchI18nDoc(i18nDoc._id, merged, translatedFields, client)
  }
  //otherwise, create a new document
  //and add the document reference to the metadata document
  else if (translationMetadata) {
    createI18nDocAndPatchMetadata(merged, localeId, client, translationMetadata._id)
  }
}
