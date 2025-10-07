'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardShortcutsConfig {
  onDelete?: () => void
  onDuplicate?: () => void
  onToggleGrid?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onSave?: () => void
  onEscape?: () => void
  selectedItemId?: string | null
  snapToGrid?: boolean
}

/**
 * Hook para gerenciar keyboard shortcuts no Table Planner
 */
export function useKeyboardShortcuts({
  onDelete,
  onDuplicate,
  onToggleGrid,
  onUndo,
  onRedo,
  onSave,
  onEscape,
  selectedItemId,
  snapToGrid,
}: KeyboardShortcutsConfig) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignorar se estiver em input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Delete - Deletar item selecionado
      if (e.key === 'Delete' && selectedItemId && onDelete) {
        e.preventDefault()
        onDelete()
        return
      }

      // Backspace - Deletar item selecionado (alternativa)
      if (e.key === 'Backspace' && selectedItemId && onDelete) {
        e.preventDefault()
        onDelete()
        return
      }

      // Ctrl/Cmd + D - Duplicar item selecionado
      if (e.key === 'd' && (e.ctrlKey || e.metaKey) && selectedItemId && onDuplicate) {
        e.preventDefault()
        onDuplicate()
        return
      }

      // Ctrl/Cmd + G - Toggle grid
      if (e.key === 'g' && (e.ctrlKey || e.metaKey) && onToggleGrid) {
        e.preventDefault()
        onToggleGrid()
        return
      }

      // Ctrl/Cmd + Z - Undo
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey && onUndo) {
        e.preventDefault()
        onUndo()
        return
      }

      // Ctrl/Cmd + Shift + Z ou Ctrl/Cmd + Y - Redo
      if (
        ((e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) ||
          (e.key === 'y' && (e.ctrlKey || e.metaKey))) &&
        onRedo
      ) {
        e.preventDefault()
        onRedo()
        return
      }

      // Ctrl/Cmd + S - Save
      if (e.key === 's' && (e.ctrlKey || e.metaKey) && onSave) {
        e.preventDefault()
        onSave()
        return
      }

      // Escape - Deselect
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault()
        onEscape()
        return
      }
    },
    [
      selectedItemId,
      onDelete,
      onDuplicate,
      onToggleGrid,
      onUndo,
      onRedo,
      onSave,
      onEscape,
    ]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Helper para mostrar shortcuts ativos
  const getActiveShortcuts = useCallback(() => {
    const shortcuts: { key: string; description: string; active: boolean }[] = [
      {
        key: 'Delete',
        description: 'Deletar item selecionado',
        active: !!selectedItemId && !!onDelete,
      },
      {
        key: 'Ctrl+D',
        description: 'Duplicar item',
        active: !!selectedItemId && !!onDuplicate,
      },
      {
        key: 'Ctrl+G',
        description: snapToGrid ? 'Desativar grade' : 'Ativar grade',
        active: !!onToggleGrid,
      },
      { key: 'Ctrl+Z', description: 'Desfazer', active: !!onUndo },
      { key: 'Ctrl+Shift+Z', description: 'Refazer', active: !!onRedo },
      { key: 'Ctrl+S', description: 'Salvar', active: !!onSave },
      { key: 'Esc', description: 'Desselecionar', active: !!selectedItemId && !!onEscape },
    ]

    return shortcuts.filter((s) => s.active)
  }, [
    selectedItemId,
    onDelete,
    onDuplicate,
    onToggleGrid,
    onUndo,
    onRedo,
    onSave,
    onEscape,
    snapToGrid,
  ])

  return {
    getActiveShortcuts,
  }
}
