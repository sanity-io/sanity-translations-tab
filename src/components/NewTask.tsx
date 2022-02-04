import React, { useState, useContext, ChangeEvent } from 'react'
import styled from 'styled-components'
import {
  Button,
  Box,
  Flex,
  Grid,
  Select,
  Stack,
  Switch,
  Text,
} from '@sanity/ui'

import { TranslationContext } from './TranslationContext'
import { TranslationLocale } from '../types'

type Props = {
  locales: TranslationLocale[]
}

type LocaleCheckboxProps = {
  locale: TranslationLocale
  toggle: (locale: string, checked: boolean) => void
  checked: boolean
}

const WrapText = styled(Box)`
  white-space: normal;
`

const LocaleCheckbox = ({ locale, toggle, checked }: LocaleCheckboxProps) => {
  return (
    <Button
      mode="ghost"
      onClick={() => {
        toggle(locale.localeId, !checked)
      }}
      disabled={locale.enabled === false}
      style={{ cursor: `pointer` }}
      radius={2}
    >
      <Flex align="center" gap={3}>
        <Switch
          style={{ pointerEvents: `none` }}
          disabled={locale.enabled === false}
          checked={checked}
          //not needed because of above toggle logic, but silence React warnings.
          onChange={() => {}}
        />
        <WrapText>
          <Text size={1}>{locale.description}</Text>
        </WrapText>
      </Flex>
    </Button>
  )
}

export const NewTask = ({ locales }: Props) => {
  // Lets just stick to the canonical document id for keeping track of
  // translations
  const [selectedLocales, setSelectedLocales] = React.useState<
    React.ReactText[]
  >([])
  const [selectedWorkflowUid, setSelectedWorkflowUid] = React.useState<string>()
  const [isBusy, setIsBusy] = useState(false)

  const context = useContext(TranslationContext)

  const toggleLocale = (locale: string, selected: boolean) => {
    if (!selected) {
      setSelectedLocales(selectedLocales.filter(l => l !== locale))
    } else if (!selectedLocales.includes(locale)) {
      setSelectedLocales([...selectedLocales, locale])
    }
  }

  const createTask = async () => {
    if (!context) {
      console.error('Missing context')
      return
    }
    setIsBusy(true)
    context
      .exportForTranslation(context.documentId)
      .then(serialized => {
        return context.adapter.createTask(
          context.documentId,
          serialized,
          selectedLocales as string[],
          context.secrets,
          selectedWorkflowUid
        )
      })
      .then(() => {
        setIsBusy(false)
      })
  }

  const possibleLocales = locales.filter(locale => locale.enabled !== false)

  return (
    <Stack paddingTop={4} space={4}>
      <Heading as="h2" weight="semibold" size={2}>
        Create New Translation Job
      </Heading>
      <Stack space={3}>
        <Flex align="center" justify="space-between">
          <Text weight="semibold" size={1}>
            {possibleLocales.length === 1 ? `Select locale` : `Select locales`}
          </Text>

          <Button
            fontSize={1}
            padding={2}
            text="Toggle All"
            onClick={() =>
              setSelectedLocales(
                possibleLocales.length === selectedLocales.length
                  ? // Disable all
                    []
                  : // Enable all
                    locales
                      .filter(locale => locale.enabled !== false)
                      .map(locale => locale.localeId)
              )
            }
          />
        </Flex>

        <Grid columns={[1, 1, 2, 3]} gap={1}>
          {(locales || []).map(l => (
            <LocaleCheckbox
              key={l.localeId}
              locale={l}
              toggle={(locale, checked) => toggleLocale(locale, checked)}
              checked={selectedLocales.includes(l.localeId)}
            />
          ))}
        </Grid>
      </Stack>

      {context?.workflowOptions && context.workflowOptions.length > 0 && (
        <Stack space={3}>
          <Text weight="semibold" size={1} as="label" htmlFor="workflow-select">
            Select translation workflow
          </Text>
          <Grid columns={[1, 1, 2]}>
            <Select
              id="workflowSelect"
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                setSelectedWorkflowUid(e.target.value)
              }}
            >
              <option>Default locale workflows</option>
              {context.workflowOptions.map(w => (
                <option
                  key={`workflow-opt-${w.workflowUid}`}
                  value={w.workflowUid}
                >
                  {w.workflowName}
                </option>
              ))}
            </Select>
          </Grid>
        </Stack>
      )}

      <Button
        onClick={createTask}
        disabled={isBusy || !selectedLocales.length}
        tone="positive"
        text="Create Job"
      />
    </Stack>
  )
}
