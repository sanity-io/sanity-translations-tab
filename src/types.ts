export type TranslationTask = {
  taskId: string
  documentId: string
  locales: TranslationTaskLocaleStatus[]
}

export type TranslationLocale = {
  localeId: string
  description: string
  enabled?: boolean
}

export type TranslationTaskLocaleStatus = {
  localeId: string
  progress: number
}

export type Secrets = {
  organization: string
  project: string
  token: string | null
  secret: string | null
}

export interface Adapter {
  getLocales: (secrets: Secrets | null) => Promise<TranslationLocale[]>
  getTranslationTask: (
    documentId: string,
    secrets: Secrets | null
  ) => Promise<TranslationTask | null>
  createTask: (
    documentId: string,
    document: Record<string, any>,
    localeIds: string[],
    secrets: Secrets | null,
    isWorkflowMT: boolean
  ) => Promise<TranslationTask>
  getTranslation: (
    taskid: string,
    localeId: string,
    secrets: Secrets | null
  ) => Promise<any | null>
}
