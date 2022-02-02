import React, { useContext } from 'react'
import { Box, Heading, Stack, useToast } from '@sanity/ui'

import { TranslationContext } from './TranslationContext'
import { TranslationLocale, TranslationTask } from '../types'
import { LanguageStatus } from './LanguageStatus'

type JobProps = {
  task: TranslationTask
  locales: TranslationLocale[]
}

const getLocale = (
  localeId: string,
  locales: TranslationLocale[]
): TranslationLocale | undefined => locales.find(l => l.localeId === localeId)

export const TaskView = ({ task, locales }: JobProps) => {
  const context = useContext(TranslationContext)
  const toast = useToast()

  const importFile = async (localeId: string) => {
    if (!context) {
      toast.push({
        title:
          'Missing context, unable to import translation. Try refreshing or clicking away from this tab and back.',
        status: 'error',
        closable: true,
      })
      return
    }

    const locale = getLocale(localeId, locales)
    const localeTitle = locale?.description || localeId
    const sanityId = context.localeIdAdapter
      ? context.localeIdAdapter(localeId)
      : localeId

    try {
      const translation = await context.adapter.getTranslation(
        task.taskId,
        localeId,
        context.secrets
      )
      await context.importTranslation(sanityId, translation)

      toast.push({
        title: `Imported ${localeTitle} translation`,
        status: 'success',
        closable: true,
      })
    } catch (err) {
      let errorMsg
      if (err instanceof Error) {
        errorMsg = err.message
      } else {
        errorMsg = err ? String(err) : null
      }

      toast.push({
        title: `Error getting ${localeTitle} translation`,
        description: errorMsg,
        status: 'error',
        closable: true,
      })
    }
  }

  return (
    <Stack space={4}>
      <Heading as="h2" weight="semibold" size={2}>
        Current Job Progress
      </Heading>
      <Box>
        {task.locales.map(localeTask => {
          const reportPercent = localeTask.progress || 0
          const locale = getLocale(localeTask.localeId, locales)
          return (
            <LanguageStatus
              key={[task.taskId, localeTask.localeId].join('.')}
              importFile={async () => {
                await importFile(localeTask.localeId)
              }}
              title={locale?.description || localeTask.localeId}
              progress={reportPercent}
            />
          )
        })}
      </Box>
    </Stack>
  )
}
