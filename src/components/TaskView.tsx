import React, { useContext } from 'react'
import { Box, Stack, Text, useToast } from '@sanity/ui'

import { TranslationContext } from './TranslationContext'
import { TranslationLocale, TranslationTask } from '../types'
import { LanguageStatus } from './LanguageStatus'

type JobProps = {
  task: TranslationTask
  locales: TranslationLocale[]
}

export const TaskView = ({ task, locales }: JobProps) => {
  const context = useContext(TranslationContext)
  const toast = useToast()

  const importFile = (localeId: string) => {
    if (!context) {
      console.error('Missing context')
      return
    }

    context.adapter
      .getTranslation(task.taskId, localeId, context.secrets)
      .then((record) => {
        if (record) {
          context.importTranslation(localeId, record)
        } else {
          // TODO: Handle this in a toast
          alert('Error getting the translated content!')
        }
      })
  }

  return (
    <Stack space={3}>
      <Text weight="semibold" size={1}>
        Current job progress
      </Text>
      <Box>
        {task.locales.map((localeTask) => {
          const reportPercent = localeTask.progress || 0
          const locale = locales.find((l) => l.localeId === localeTask.localeId)
          return (
            <LanguageStatus
              key={[task.taskId, localeTask.localeId].join('.')}
              importFile={() => {
                importFile(localeTask.localeId)
                toast.push({ title: 'Hello', status: 'info' })
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
