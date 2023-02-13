import {SanityClient, SanityDocument} from 'sanity'
import {
  BaseDocumentSerializer,
  BaseDocumentDeserializer,
  BaseDocumentMerger,
  SerializedDocument,
} from 'sanity-naive-html-serializer'

import {DummyAdapter} from '../adapter'
import {ExportForTranslation, ImportTranslation} from '../types'
import {findLatestDraft, findDocumentAtRevision} from './utils'

export const fieldLevelPatch = async (
  documentId: string,
  translatedFields: SanityDocument,
  localeId: string,
  client: SanityClient,
  baseLanguage: string = 'en'
): Promise<void> => {
  let baseDoc: SanityDocument
  if (translatedFields._rev && translatedFields._id) {
    baseDoc = await findDocumentAtRevision(translatedFields._id, translatedFields._rev, client)
  } else {
    baseDoc = await findLatestDraft(documentId, client)
  }

  const merged = BaseDocumentMerger.fieldLevelMerge(
    translatedFields,
    baseDoc,
    localeId,
    baseLanguage
  )

  await client.patch(baseDoc._id).set(merged).commit()
}

export const baseFieldLevelConfig = {
  exportForTranslation: async (
    ...params: Parameters<ExportForTranslation>
  ): Promise<SerializedDocument> => {
    const [id, context] = params
    const {client, schema} = context
    const doc = await findLatestDraft(id, client)
    const serialized = BaseDocumentSerializer(schema).serializeDocument(doc, 'field')
    serialized.name = id
    return serialized
  },
  importTranslation: (...params: Parameters<ImportTranslation>): Promise<void> => {
    const [id, localeId, document, context, , baseLanguage = 'en'] = params
    const {client} = context
    const deserialized = BaseDocumentDeserializer.deserializeDocument(document) as SanityDocument
    return fieldLevelPatch(id, deserialized, localeId, client, baseLanguage)
  },
  adapter: DummyAdapter,
  secretsNamespace: 'translationService',
}
