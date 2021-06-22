import React from 'react'
import { Card, Heading, Text, Flex, Box, Inline, Button } from '@sanity/ui'

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
  const progressWrapperStyle = {
    height: '5px',
    border: '1px black solid',
    width: 200,
  }
  const progressStyle = {
    height: '5px',
    backgroundColor: 'green',
    width: `${progress}%`,
  }
  return (
    <Card padding={2}>
      <Heading>{title}</Heading>
      <Flex align="center">
        <Box flex={1}>
          <Inline>
            <Box style={progressWrapperStyle}>
              <Box style={progressStyle}>&nbsp;</Box>
            </Box>
            <Box paddingLeft={3}>
              <Text>{progress} %</Text>
            </Box>
          </Inline>
        </Box>
        <Button
          mode="bleed"
          onClick={() => importFile()}
          text="Import"
          tone="positive"
        />
      </Flex>
    </Card>
  )
}
