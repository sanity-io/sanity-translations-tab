import {SanityClient, Schema, TypedObject} from 'sanity'
import {SerializedDocument} from 'sanity-naive-html-serializer'
import {PortableTextTypeComponent} from '@portabletext/to-html'
import {DeserializerRule} from '@sanity/block-tools'

export type TranslationTaskLocaleStatus = {
  localeId: string
  progress: number
}

export type TranslationTask = {
  taskId: string
  documentId: string
  locales: TranslationTaskLocaleStatus[]
  linkToVendorTask?: string
}

export type TranslationLocale = {
  localeId: string
  description: string
  enabled?: boolean
}

//this varies according to provider
//not every vendor uses every field
export type Secrets = {
  organization: string
  project: string
  token?: string
  secret?: string
  username?: string
  password?: string
  proxy?: string
}

export type WorkflowIdentifiers = {
  workflowUid: string
  workflowName: string
}

export interface Adapter {
  getLocales: (secrets: Secrets | null) => Promise<TranslationLocale[]>
  getTranslationTask: (documentId: string, secrets: Secrets | null) => Promise<TranslationTask>
  createTask: (
    taskName: string,
    serializedDocument: SerializedDocument,
    localeIds: string[],
    secrets: Secrets | null,
    workflowUid?: string,
    callbackUrl?: string,
  ) => Promise<TranslationTask>
  getTranslation: (taskid: string, localeId: string, secrets: Secrets | null) => Promise<any | null>
}

export interface TranslationFunctionContext {
  client: SanityClient
  schema: Schema
}

export type ExportForTranslation = (
  id: string,
  context: TranslationFunctionContext,
  baseLanguage?: string,
  serializationOptions?: {
    additionalStopTypes?: string[]
    additionalSerializers?: Record<string, PortableTextTypeComponent | undefined>
  },
  languageField?: string,
) => Promise<SerializedDocument>

export type ImportTranslation = (
  id: string,
  localeId: string,
  document: string,
  context: TranslationFunctionContext,
  baseLanguage?: string,
  serializationOptions?: {
    additionalDeserializers?: Record<string, (value: HTMLElement) => TypedObject>
    additionalBlockDeserializers?: DeserializerRule[]
  },
  languageField?: string,
  mergeWithTargetLocale?: boolean,
) => Promise<void>

export type TranslationsTabConfigOptions = {
  adapter: Adapter
  baseLanguage: string
  secretsNamespace: string | null
  exportForTranslation: ExportForTranslation
  importTranslation: ImportTranslation
  serializationOptions?: {
    additionalStopTypes?: string[]
    additionalSerializers?: Record<string, PortableTextTypeComponent | undefined>
    additionalDeserializers?: Record<string, (value: HTMLElement) => TypedObject>
    additionalBlockDeserializers?: DeserializerRule[]
  }
  workflowOptions?: WorkflowIdentifiers[]
  localeIdAdapter?: (id: string) => string
  languageField?: string
  callbackUrl?: string
  mergeWithTargetLocale?: boolean
}
