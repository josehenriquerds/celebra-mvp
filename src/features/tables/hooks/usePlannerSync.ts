'use client'

import { useEffect, useRef } from 'react'
import type { DecorElement } from '@/schemas'
import { usePlannerStore } from '../stores/usePlannerStore'

type SyncMessage =
  | { type: 'UPDATE_ELEMENT'; payload: { id: string; updates: Partial<DecorElement> } }
  | { type: 'ADD_ELEMENT'; payload: DecorElement }
  | { type: 'DELETE_ELEMENT'; payload: { id: string } }
  | { type: 'SET_ELEMENTS'; payload: DecorElement[] }
  | { type: 'UPDATE_PAN'; payload: { x: number; y: number } }
  | { type: 'UPDATE_ZOOM'; payload: number }

/**
 * Hook para sincronização cross-tab usando BroadcastChannel
 * Sincroniza mudanças de elementos decorativos, pan e zoom entre abas
 */
export function usePlannerSync(eventId: string) {
  const channelRef = useRef<BroadcastChannel | null>(null)
  const isInitializedRef = useRef(false)

  const { addElement, updateElement, deleteElement, setElements, setPan, setZoom } =
    usePlannerStore()

  useEffect(() => {
    // Verificar se BroadcastChannel é suportado
    if (typeof BroadcastChannel === 'undefined') {
      console.warn('BroadcastChannel not supported in this browser')
      return
    }

    const channelName = `planner-sync-${eventId}`
    const channel = new BroadcastChannel(channelName)
    channelRef.current = channel

    // Handler para mensagens de outras abas
    channel.onmessage = (event: MessageEvent<SyncMessage>) => {
      const { type, payload } = event.data

      switch (type) {
        case 'UPDATE_ELEMENT':
          updateElement(payload.id, payload.updates)
          break
        case 'ADD_ELEMENT':
          addElement(payload)
          break
        case 'DELETE_ELEMENT':
          deleteElement(payload.id)
          break
        case 'SET_ELEMENTS':
          setElements(payload)
          break
        case 'UPDATE_PAN':
          setPan(payload)
          break
        case 'UPDATE_ZOOM':
          setZoom(payload)
          break
      }
    }

    isInitializedRef.current = true

    return () => {
      channel.close()
      channelRef.current = null
      isInitializedRef.current = false
    }
  }, [eventId, addElement, updateElement, deleteElement, setElements, setPan, setZoom])

  // Funções para broadcast de mudanças
  const broadcastUpdate = {
    updateElement: (id: string, updates: Partial<DecorElement>) => {
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'UPDATE_ELEMENT',
          payload: { id, updates },
        })
      }
    },

    addElement: (element: DecorElement) => {
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'ADD_ELEMENT',
          payload: element,
        })
      }
    },

    deleteElement: (id: string) => {
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'DELETE_ELEMENT',
          payload: { id },
        })
      }
    },

    setElements: (elements: DecorElement[]) => {
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'SET_ELEMENTS',
          payload: elements,
        })
      }
    },

    updatePan: (pan: { x: number; y: number }) => {
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'UPDATE_PAN',
          payload: pan,
        })
      }
    },

    updateZoom: (zoom: number) => {
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'UPDATE_ZOOM',
          payload: zoom,
        })
      }
    },
  }

  return broadcastUpdate
}
