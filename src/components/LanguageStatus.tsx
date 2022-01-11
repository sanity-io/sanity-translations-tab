import React from 'react'
import { Flex, Card, Text, Grid, Box, Button } from '@sanity/ui'
import { DownloadIcon } from '@sanity/icons'
import ProgressBar from './ProgressBar'

type LanguageStatusProps = {
  title: string
  progress: number

  importFile: Function
}

export const LanguageStatus = ({
  title,
  progress,
  importFile,
}: LanguageStatusProps) => {
  return (
    <Card shadow={1}>
      <Grid columns={5} gap={3} padding={3}>
        <Flex columnStart={1} columnEnd={3} align="center">
          <Text weight="bold" size={1}>
            {title}
          </Text>
        </Flex>
        {progress && progress > 0 ? (
          <Flex columnStart={3} columnEnd={5} align="center">
            <ProgressBar progress={progress} />
          </Flex>
        ) : null}
        <Box columnStart={5} columnEnd={6}>
          <Button
            style={{ width: `100%` }}
            mode="ghost"
            onClick={() => importFile()}
            text="Import"
            tone="positive"
            icon={DownloadIcon}
            whiteSpace="nowrap"
          />
        </Box>
      </Grid>
    </Card>
  )
}
