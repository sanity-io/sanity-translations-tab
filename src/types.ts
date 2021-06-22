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

export interface Adapter {
  getLocales: () => Promise<TranslationLocale[]>
  getTranslationTask: (documentId: string) => Promise<TranslationTask | null>
  createTask: (
    documentId: string,
    localeIds: string[]
  ) => Promise<TranslationTask>
  getTranslation: (
    taskid: string,
    localeId: string
  ) => Promise<Record<string, any> | null>
}
