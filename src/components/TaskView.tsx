import React, { useContext } from 'react'
import { Box, Heading, Stack, useToast } from '@sanity/ui'

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
      .then((record): boolean => {
        if (record) {
          context.importTranslation(localeId, record)
          return true
        } else {
          // TODO: Handle this in a toast
          alert('Error getting the translated content!')
          return false
        }
      })
      .then(success => {
        toast.push(
          success
            ? { title: 'Success', status: 'success', closable: true }
            : { title: 'Failure', status: 'error' }
        )
      })
  }

  return (
    <Stack space={4}>
      <Heading as="h2" weight="semibold" size={2}>
        Current Job Progress
      </Heading>
      <Box>
        {task.locales.map(localeTask => {
          const reportPercent = localeTask.progress || 0
          const locale = locales.find(l => l.localeId === localeTask.localeId)
          console.log(localeTask)
          return (
            <LanguageStatus
              key={[task.taskId, localeTask.localeId].join('.')}
              importFile={() => {
                importFile(localeTask.localeId)
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
