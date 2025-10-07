'use client'

import { toPng, toSvg } from 'html-to-image'
import { useRef, useCallback } from 'react'
import type { Table, DecorElement } from '@/schemas'

interface ExportOptions {
  format: 'png' | 'svg'
  pixelRatio?: number
  quality?: number
  backgroundColor?: string
  includeDate?: boolean
}

export function useExportLayout() {
  const exportRef = useRef<HTMLDivElement>(null)

  const exportLayout = useCallback(
    async (
      tables: Table[],
      elements: DecorElement[],
      options: ExportOptions = { format: 'png' }
    ) => {
      if (!exportRef.current) {
        throw new Error('Export ref not initialized')
      }

      const {
        format = 'png',
        pixelRatio = 2,
        quality = 0.95,
        backgroundColor = 'white',
        includeDate = true,
      } = options

      try {
        let dataUrl: string

        const commonOptions = {
          backgroundColor,
          pixelRatio: format === 'png' ? pixelRatio : 1,
          quality,
        }

        if (format === 'png') {
          dataUrl = await toPng(exportRef.current, commonOptions)
        } else {
          dataUrl = await toSvg(exportRef.current, commonOptions)
        }

        // Download do arquivo
        const link = document.createElement('a')
        const timestamp = includeDate ? `-${new Date().toISOString().split('T')[0]}` : ''
        link.download = `layout-mesas${timestamp}.${format}`
        link.href = dataUrl
        link.click()

        return { success: true, dataUrl }
      } catch (error) {
        console.error('Error exporting layout:', error)
        return { success: false, error }
      }
    },
    []
  )

  return {
    exportRef,
    exportLayout,
  }
}
