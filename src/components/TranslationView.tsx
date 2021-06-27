import React, { useContext, useEffect, useState } from 'react'
import { TranslationContext } from './TranslationContext'
import { NewTask } from './NewTask'
import { TaskView } from './TaskView'
import { Box } from '@sanity/ui'
import { TranslationTask, TranslationLocale } from '../types'
/*
import { SettingsView } from './Settings'
*/

export const TranslationView = () => {
  const [locales, setLocales] = useState<TranslationLocale[]>([])
  const [task, setTask] = useState<TranslationTask | null>(null)

  /*
  const [open, setOpen] = useState(false)
  const onClose = useCallback(() => setOpen(false), [])
  const onOpen = useCallback(() => setOpen(true), [])
  */

  const context = useContext(TranslationContext)

  useEffect(() => {
    async function fetchData() {
      if (!context) {
        console.error('Missing context')
        return
      }
      context.adapter
        .getLocales(context.secrets)
        .then(setLocales)
        .then(() =>
          context.adapter.getTranslationTask(
            context.documentId,
            context.secrets
          )
        )
        .then(setTask)
    }
    fetchData()
  }, [context])

  return (
    <Box>
      <NewTask locales={locales} />
      {task && <TaskView task={task} locales={locales} />}
    </Box>
  )
}
