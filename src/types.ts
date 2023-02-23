import {SanityClient, Schema} from 'sanity'
import {SerializedDocument} from 'sanity-naive-html-serializer'

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
    documentId: string,
    document: Record<string, any>,
    localeIds: string[],
    secrets: Secrets | null,
    workflowUid?: string
  ) => Promise<TranslationTask>
  getTranslation: (taskid: string, localeId: string, secrets: Secrets | null) => Promise<any | null>
}

export interface TranslationFunctionContext {
  client: SanityClient
  schema: Schema
}

export type ExportForTranslation = (
  id: string,
  context: TranslationFunctionContext
) => Promise<SerializedDocument>

export type ImportTranslation = (
  id: string,
  localeId: string,
  document: string,
  context: TranslationFunctionContext,
  idStructure?: 'subpath' | 'delimiter',
  baseLanguage?: string
) => Promise<void>
