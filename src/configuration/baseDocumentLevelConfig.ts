import schemas from 'part:@sanity/base/schema'
import sanityClient from 'part:@sanity/base/client'

import {
  BaseDocumentSerializer,
  BaseDocumentDeserializer,
  BaseDocumentMerger,
  LegacyBaseDocumentDeserializer,
} from 'sanity-naive-html-serializer'
import { SanityDocument, SanityDocumentStub } from '@sanity/client'

import { DummyAdapter } from '../adapter'
import {
  findLatestDraft,
  findDocumentAtRevision,
  checkSerializationVersion,
} from './utils'

const client = sanityClient.withConfig({ apiVersion: '2022-04-03' })

export const baseDocumentLevelConfig = {
  exportForTranslation: async (id: string) => {
    const doc = await findLatestDraft(id)
    const serialized = BaseDocumentSerializer(schemas).serializeDocument(
      doc,
      'document'
    )
    serialized.name = id
    return serialized
  },
  importTranslation: async (
    id: string,
    localeId: string,
    document: string,
    idStructure?: 'subpath' | 'delimiter'
  ) => {
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
    await documentLevelPatch(id, deserialized, localeId, idStructure)
  },
  adapter: DummyAdapter,
  secretsNamespace: 'translationService',
  idStructure: 'delimiter',
}

//document-level patch
export const documentLevelPatch = async (
  documentId: string,
  translatedFields: SanityDocument,
  localeId: string,
  idStructure?: 'subpath' | 'delimiter'
) => {
  let baseDoc: SanityDocument
  if (translatedFields._id && translatedFields._rev) {
    baseDoc = await findDocumentAtRevision(
      translatedFields._id,
      translatedFields._rev
    )
  } else {
    baseDoc = await findLatestDraft(documentId)
  }

  const merged = BaseDocumentMerger.documentLevelMerge(
    translatedFields,
    baseDoc
  ) as SanityDocumentStub

  const i18nDoc = await getI18nDoc(documentId, localeId, idStructure)
  if (i18nDoc) {
    const cleanedMerge: Record<string, any> = {}
    //don't overwrite any existing system values on the i18n doc
    Object.entries(merged).forEach(([key, value]) => {
      if (
        Object.keys(translatedFields).includes(key) &&
        !['_id', '_rev', '_updatedAt'].includes(key)
      ) {
        cleanedMerge[key] = value
      }
    })

    await client
      .transaction()
      //@ts-ignore
      .patch(i18nDoc._id, p => p.set(cleanedMerge))
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
      merged.__i18n_lang = localeId
    }
    client.create(merged)
  }
}

const getI18nDoc = async (
  id: string,
  localeId: string,
  idStructure?: 'subpath' | 'delimiter'
) => {
  let draft: SanityDocument
  if (idStructure === 'subpath') {
    draft = await findLatestDraft(`i18n.${id}.${localeId}`)
  } else {
    draft = await findLatestDraft(`${id}__i18n_${localeId}`)
    //await fallback for people who have not explicitly set this param
    if (!idStructure && !draft) {
      draft = await findLatestDraft(`i18n.${id}.${localeId}`)
    }
  }

  return draft
}
