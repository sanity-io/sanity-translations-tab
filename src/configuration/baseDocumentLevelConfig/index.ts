import {ExportForTranslation, ImportTranslation} from '../../types'
import {SanityDocument} from 'sanity'
import {findLatestDraft} from '../utils'
import {documentLevelPatch} from './documentLevelPatch'
import {
  SerializedDocument,
  BaseDocumentDeserializer,
  BaseDocumentSerializer,
} from 'sanity-naive-html-serializer'
import {DummyAdapter} from '../../adapter'

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
    const [id, localeId, document, context, baseLanguage] = params
    const {client} = context
    const deserialized = BaseDocumentDeserializer.deserializeDocument(document) as SanityDocument
    await documentLevelPatch(id, deserialized, localeId, client, baseLanguage)
  },
  adapter: DummyAdapter,
  secretsNamespace: 'translationService',
}

export {documentLevelPatch}
