import schemas from 'part:@sanity/base/schema'
import sanityClient from 'part:@sanity/base/client'

import {
  BaseDocumentSerializer,
  BaseDocumentDeserializer,
  LegacyBaseDocumentDeserializer,
  BaseDocumentMerger,
} from 'sanity-naive-html-serializer'
import { SanityDocument } from '@sanity/client'

import { DummyAdapter } from '../adapter'
import {
  findLatestDraft,
  findDocumentAtRevision,
  checkSerializationVersion,
} from './utils'

const client = sanityClient.withConfig({ apiVersion: '2022-04-03' })

const baseFieldLevelConfig = {
  exportForTranslation: async (id: string) => {
    const doc = await findLatestDraft(id)
    const serialized = BaseDocumentSerializer(schemas).serializeDocument(
      doc,
      'field'
    )
    serialized.name = id
    return serialized
  },
  importTranslation: async (id: string, localeId: string, document: string) => {
    const serializationVersion = checkSerializationVersion(document)
    let deserialized
    if (serializationVersion === '2') {
      deserialized = BaseDocumentDeserializer.deserializeDocument(
        document
      ) as SanityDocument
    } else {
      deserialized = LegacyBaseDocumentDeserializer(
        schemas
      ).deserializeDocument(document) as SanityDocument
    }
    return fieldLevelPatch(id, deserialized, localeId)
  },
  adapter: DummyAdapter,
  secretsNamespace: 'translationService',
}

const fieldLevelPatch = async (
  documentId: string,
  translatedFields: SanityDocument,
  localeId: string
) => {
  let baseDoc: SanityDocument
  if (translatedFields._rev && translatedFields._id) {
    baseDoc = await findDocumentAtRevision(
      translatedFields._id,
      translatedFields._rev
    )
  } else {
    baseDoc = await findLatestDraft(documentId)
  }

  const merged = BaseDocumentMerger.fieldLevelMerge(
    translatedFields,
    baseDoc,
    localeId,
    'en'
  )

  await client
    .patch(baseDoc._id)
    .set(merged)
    .commit()
}

export default baseFieldLevelConfig
