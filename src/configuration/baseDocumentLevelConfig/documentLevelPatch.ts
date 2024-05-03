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
  languageField: string = 'language',
  mergeWithTargetLocale: boolean = false,
  // eslint-disable-next-line max-params
): Promise<void> => {
  //this is the document we use to merge with the translated fields
  let baseDoc: SanityDocument | null = null

  //this is the document that will serve as the translated doc
  let i18nDoc: SanityDocument | null = null

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

  /* first, check our metadata to see if a translated document exists
   * if no metadata exists, we create it
   */
  let translationMetadata = await getTranslationMetadata(documentId, client, baseLanguage)
  if (!translationMetadata) {
    translationMetadata = await createTranslationMetadata(baseDoc, client, baseLanguage)
  }

  //the id of the translated document should be on the metadata if it exists
  const i18nDocId = (translationMetadata.translations as Array<Record<string, any>>).find(
    (translation) => translation._key === localeId,
  )?.value?._ref

  if (i18nDocId) {
    //get draft or published
    i18nDoc = await findLatestDraft(i18nDocId, client)
  }

  //if the user has chosen to merge with the target locale,
  //any existing target document will serve as our base document
  if (mergeWithTargetLocale && i18nDoc) {
    baseDoc = i18nDoc
  } else if (translatedFields._id && translatedFields._rev) {
    /*
     * we send over the _rev with our translation file so we can
     * accurately coalesce the translations in case something has
     * changed in the base document since translating
     */
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

  if (i18nDoc) {
    patchI18nDoc(i18nDoc._id, merged, translatedFields, client)
  }
  //otherwise, create a new document
  //and add the document reference to the metadata document
  else {
    createI18nDocAndPatchMetadata(merged, localeId, client, translationMetadata, languageField)
  }
}
