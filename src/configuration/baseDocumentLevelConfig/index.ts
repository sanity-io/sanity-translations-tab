import {ExportForTranslation, ImportTranslation} from '../../types'
import {SanityDocument} from 'sanity'
import {findLatestDraft} from '../utils'
import {documentLevelPatch} from './documentLevelPatch'
import {legacyDocumentLevelPatch} from './legacyDocumentLevelPatch'
import {
  SerializedDocument,
  BaseDocumentDeserializer,
  BaseDocumentSerializer,
  defaultStopTypes,
  customSerializers,
  customBlockDeserializers,
} from 'sanity-naive-html-serializer'
import {DummyAdapter} from '../../adapter'

export const baseDocumentLevelConfig = {
  exportForTranslation: async (
    ...params: Parameters<ExportForTranslation>
  ): Promise<SerializedDocument> => {
    const [
      id,
      context,
      baseLanguage = 'en',
      additionalStopTypes = [],
      additionalSerializers = {},
      languageField = 'language',
    ] = params
    const {client, schema} = context
    const stopTypes = [...additionalStopTypes, ...defaultStopTypes]
    const serializers = {
      ...customSerializers,
      types: {
        ...customSerializers.types,
        ...additionalSerializers,
      },
    }
    const doc = await findLatestDraft(id, client)
    delete doc[languageField]
    const serialized = BaseDocumentSerializer(schema).serializeDocument(
      doc,
      'document',
      baseLanguage,
      stopTypes,
      serializers,
    )
    serialized.name = id
    return serialized
  },
  importTranslation: (...params: Parameters<ImportTranslation>): Promise<void> => {
    const [
      id,
      localeId,
      document,
      context,
      baseLanguage = 'en',
      additionalDeserializers = {},
      additionalBlockDeserializers = [],
      languageField = 'language',
    ] = params
    const {client} = context
    const deserializers = {
      types: {
        ...additionalDeserializers,
      },
    }
    const blockDeserializers = [...additionalBlockDeserializers, ...customBlockDeserializers]

    const deserialized = BaseDocumentDeserializer.deserializeDocument(
      document,
      deserializers,
      blockDeserializers,
    ) as SanityDocument
    return documentLevelPatch(id, deserialized, localeId, client, baseLanguage, languageField)
  },
  adapter: DummyAdapter,
  secretsNamespace: 'translationService',
}

export const legacyDocumentLevelConfig = {
  ...baseDocumentLevelConfig,
  importTranslation: (...params: Parameters<ImportTranslation>): Promise<void> => {
    const [
      id,
      localeId,
      document,
      context,
      ,
      additionalDeserializers = {},
      additionalBlockDeserializers = [],
    ] = params
    const {client} = context
    const deserializers = {
      types: {
        ...additionalDeserializers,
      },
    }
    const blockDeserializers = [...additionalBlockDeserializers, ...customBlockDeserializers]

    const deserialized = BaseDocumentDeserializer.deserializeDocument(
      document,
      deserializers,
      blockDeserializers,
    ) as SanityDocument
    return legacyDocumentLevelPatch(id, deserialized, localeId, client)
  },
}

export {documentLevelPatch, legacyDocumentLevelPatch}
