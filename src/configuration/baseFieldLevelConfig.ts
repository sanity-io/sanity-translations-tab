import { SanityClient, SanityDocument } from 'sanity'
import {
  BaseDocumentSerializer,
  BaseDocumentDeserializer,
  LegacyBaseDocumentDeserializer,
  BaseDocumentMerger,
} from 'sanity-naive-html-serializer'

import { DummyAdapter } from '../adapter'
import { ExportForTranslation, ImportTranslation } from '../types'
import {
  findLatestDraft,
  findDocumentAtRevision,
  checkSerializationVersion,
} from './utils'

export const baseFieldLevelConfig = {
  exportForTranslation: async (...params: Parameters<ExportForTranslation>) => {
    const [id, context] = params
    const { client, schema } = context
    const doc = await findLatestDraft(id, client)
    const serialized = BaseDocumentSerializer(schema).serializeDocument(
      doc,
      'field'
    )
    serialized.name = id
    return serialized
  },
  importTranslation: async (...params: Parameters<ImportTranslation>) => {
    const [id, localeId, document, context, , baseLanguage = 'en'] = params
    const { client, schema } = context
    const serializationVersion = checkSerializationVersion(document)
    let deserialized
    if (serializationVersion === '2') {
      deserialized = BaseDocumentDeserializer.deserializeDocument(
        document
      ) as SanityDocument
    } else {
      deserialized = LegacyBaseDocumentDeserializer(schema).deserializeDocument(
        document
      ) as SanityDocument
    }
    return fieldLevelPatch(id, deserialized, localeId, client, baseLanguage)
  },
  adapter: DummyAdapter,
  secretsNamespace: 'translationService',
}

export const fieldLevelPatch = async (
  documentId: string,
  translatedFields: SanityDocument,
  localeId: string,
  client: SanityClient,
  baseLanguage: string = 'en'
) => {
  let baseDoc: SanityDocument
  if (translatedFields._rev && translatedFields._id) {
    baseDoc = await findDocumentAtRevision(
      translatedFields._id,
      translatedFields._rev,
      client
    )
  } else {
    baseDoc = await findLatestDraft(documentId, client)
  }

  const merged = BaseDocumentMerger.fieldLevelMerge(
    translatedFields,
    baseDoc,
    localeId,
    baseLanguage
  )

  await client
    .patch(baseDoc._id)
    .set(merged)
    .commit()
}
