import TranslationsTab from './components/TranslationsTab'
import { DummyAdapter } from './adapter'
import { Secrets, Adapter } from './types'
import {
  baseDocumentLevelConfig,
  baseFieldLevelConfig,
  findLatestDraft,
  documentLevelPatch,
  fieldLevelPatch,
} from './configuration'
import {
  BaseDocumentSerializer,
  BaseDocumentDeserializer,
  BaseDocumentMerger,
  LegacyBaseDocumentDeserializer,
  defaultStopTypes,
  customSerializers,
} from 'sanity-naive-html-serializer'

export {
  Secrets,
  Adapter,
  TranslationsTab,
  DummyAdapter,
  //helpers for setting up easy, standard configuration across different translation vendors
  baseDocumentLevelConfig,
  baseFieldLevelConfig,
  //helpers for end developers who may need to customize serialization
  findLatestDraft,
  documentLevelPatch,
  fieldLevelPatch,
  BaseDocumentSerializer,
  BaseDocumentDeserializer,
  LegacyBaseDocumentDeserializer,
  BaseDocumentMerger,
  defaultStopTypes,
  customSerializers,
}
