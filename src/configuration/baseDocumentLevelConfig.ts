import {SanityClient, SanityDocument, SanityDocumentLike} from 'sanity'
import {
  BaseDocumentSerializer,
  BaseDocumentDeserializer,
  BaseDocumentMerger,
  SerializedDocument,
} from 'sanity-naive-html-serializer'

import {DummyAdapter} from '../adapter'
import {ExportForTranslation, ImportTranslation} from '../types'
import {findLatestDraft, findDocumentAtRevision} from './utils'

/*
 * The new getI18nDoc function gets the IDs from the translation.metadata document
 */
const getI18nDoc = async (
  id: string,
  localeId: string,
  client: SanityClient
  //   idStructure?: 'subpath' | 'delimiter'
) => {
  //   let doc: SanityDocument

  const translationDocumentId = await client.fetch(
    "*[_type == 'translation.metadata' && translations[_key == 'en'][0].value._ref == $id][0].translations[_key == $localeId][0].value._ref",
    {id, localeId}
  )

  const doc = await findLatestDraft(translationDocumentId, client)

  //   if (idStructure === 'subpath') {
  //     doc = await findLatestDraft(`i18n.${id}.${localeId}`, client)
  //   } else {
  //     doc = await findLatestDraft(`${id}__i18n_${localeId}`, client)
  //     //await fallback for people who have not explicitly set this param
  //     if (!idStructure && !doc) {
  //       doc = await findLatestDraft(`i18n.${id}.${localeId}`, client)
  //     }
  //   }

  return doc
}

/*
 * The new documentLevelPatch function makes sure the `language` field is not overwritten and passes fewer params to the get19nDoc function
 */
export const documentLevelPatch = async (
  documentId: string,
  translatedFields: SanityDocument,
  localeId: string,
  client: SanityClient,
  idStructure?: 'subpath' | 'delimiter'
): Promise<void> => {
  let baseDoc: SanityDocument
  if (translatedFields._id && translatedFields._rev) {
    baseDoc = await findDocumentAtRevision(translatedFields._id, translatedFields._rev, client)
  } else {
    baseDoc = await findLatestDraft(documentId, client)
  }

  const merged = BaseDocumentMerger.documentLevelMerge(
    translatedFields,
    baseDoc
  ) as SanityDocumentLike

  const i18nDoc = await getI18nDoc(documentId, localeId, client)
  if (i18nDoc) {
    const cleanedMerge: Record<string, any> = {}
    //don't overwrite any existing system values on the i18n doc
    Object.entries(merged).forEach(([key, value]) => {
      if (
        Object.keys(translatedFields).includes(key) &&
        !['_id', '_rev', '_updatedAt', 'language'].includes(key)
      ) {
        cleanedMerge[key] = value
      }
    })

    await client
      .transaction()
      //@ts-ignore
      .patch(i18nDoc._id, (p) => p.set(cleanedMerge))
      .commit()
  } else {
    let targetId = `drafts.${documentId}__i18n_${localeId}`
    if (idStructure === 'subpath') {
      targetId = `drafts.i18n.${documentId}.${localeId}`
    }
    merged._id = targetId
    //account for legacy implementations of i18n plugin lang
    if (baseDoc._lang) {
      merged._lang = localeId
    } else {
      //eslint-disable-next-line camelcase -- this is configured by another plugin
      merged.__i18n_lang = localeId
    }
    client.create(merged)
  }
}

export const baseDocumentLevelConfig = {
  exportForTranslation: async (
    ...params: Parameters<ExportForTranslation>
  ): Promise<SerializedDocument> => {
    const [id, context] = params
    const {client, schema} = context
    const doc = await findLatestDraft(id, client)
    const serialized = BaseDocumentSerializer(schema).serializeDocument(doc, 'document')
    serialized.name = id
    return serialized
  },
  importTranslation: async (...params: Parameters<ImportTranslation>): Promise<void> => {
    const [id, localeId, document, context, idStructure] = params
    const {client} = context
    const deserialized = BaseDocumentDeserializer.deserializeDocument(document) as SanityDocument
    await documentLevelPatch(id, deserialized, localeId, client, idStructure)
  },
  adapter: DummyAdapter,
  secretsNamespace: 'translationService',
  idStructure: 'delimiter',
}
