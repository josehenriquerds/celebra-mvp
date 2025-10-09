Param(
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')
Push-Location $repoRoot

try {
  $patch = @"
diff --git a/src/app/events/[id]/tables/page.tsx b/src/app/events/[id]/tables/page.tsx
index a17b377..8acbed2 100644
--- a/src/app/events/[id]/tables/page.tsx
+++ b/src/app/events/[id]/tables/page.tsx
@@ -37,11 +37,11 @@ import {
   useAssignGuestToSeat,
   useCreateTable,
   useDeleteTable,
-  useTablePlannerData,
   useUnassignGuestFromSeat,
   useUpdateTable,
 } from '@/features/tables/hooks/useTables'
-import { usePlannerStore } from '@/features/tables/stores/usePlannerStore'
+import { useTablePlannerWithCache } from '@/features/tables/hooks'
+import { createPlannerSelector, getPlannerStore } from '@/features/tables/stores/usePlannerStore'
 import { cn } from '@/lib/utils'
 import type { Table } from '@/schemas'
 
@@ -159,7 +159,7 @@ export default function TablePlannerPage() {
   const { toast } = useToast()
 
   // React Query hooks
-  const { data, isLoading } = useTablePlannerData(eventId)
+  const { data, isLoading } = useTablePlannerWithCache(eventId)
   const createTableMutation = useCreateTable()
   const updateTableMutation = useUpdateTable()
   const deleteTableMutation = useDeleteTable()
@@ -167,7 +167,15 @@ export default function TablePlannerPage() {
   const unassignMutation = useUnassignGuestFromSeat()
 
   // Zustand store
-  const { zoom, activeId, setActiveId, addToHistory, showElementsPalette } = usePlannerStore()
+  const plannerStore = getPlannerStore(eventId)
+  const zoom = createPlannerSelector(plannerStore, (state) => state.zoom)
+  const activeId = createPlannerSelector(plannerStore, (state) => state.activeId)
+  const setActiveId = createPlannerSelector(plannerStore, (state) => state.setActiveId)
+  const addToHistory = createPlannerSelector(plannerStore, (state) => state.addToHistory)
+  const showElementsPalette = createPlannerSelector(
+    plannerStore,
+    (state) => state.showElementsPalette
+  )
 
   // Local state
   const [creatingTable, setCreatingTable] = useState(false)
@@ -538,6 +546,8 @@ export default function TablePlannerPage() {
               onAutoArrange={handleAutoArrange}
               onAutoAllocate={handleAutoAllocate}
               exporting={exporting}
+              eventId={eventId}
+              plannerStore={plannerStore}
             />
           </div>
         </div>
diff --git a/src/features/tables/components/Toolbar.tsx b/src/features/tables/components/Toolbar.tsx
index 414dbfc..811a97e 100644
--- a/src/features/tables/components/Toolbar.tsx
+++ b/src/features/tables/components/Toolbar.tsx
@@ -3,30 +3,43 @@
 import { Download, LayoutGrid, Redo, Undo, ZoomIn, ZoomOut, Shapes } from 'lucide-react'
 import { Button } from '@/components/ui/button'
 import { cn } from '@/lib/utils'
-import { usePlannerStore } from '../stores/usePlannerStore'
+import {
+  createPlannerSelector,
+  getPlannerStore,
+  type PlannerStoreHook,
+} from '../stores/usePlannerStore'
 
 interface ToolbarProps {
   onExport: () => void
   onAutoArrange: () => void
   onAutoAllocate: () => void
   exporting?: boolean
+  eventId?: string
+  plannerStore?: PlannerStoreHook
 }
 
 const controlButtonClasses =
   'transition-transform duration-200 ease-smooth hover:bg-muted/60 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]'
 
-export function Toolbar({ onExport, onAutoArrange, onAutoAllocate, exporting }: ToolbarProps) {
-  const {
-    zoom,
-    zoomIn,
-    zoomOut,
-    undo,
-    redo,
-    canUndo,
-    canRedo,
-    toggleElementsPalette,
-    showElementsPalette,
-  } = usePlannerStore()
+export function Toolbar({
+  onExport,
+  onAutoArrange,
+  onAutoAllocate,
+  exporting,
+  eventId,
+  plannerStore,
+}: ToolbarProps) {
+  const store = plannerStore ?? getPlannerStore(eventId)
+
+  const zoom = createPlannerSelector(store, (state) => state.zoom)
+  const zoomIn = createPlannerSelector(store, (state) => state.zoomIn)
+  const zoomOut = createPlannerSelector(store, (state) => state.zoomOut)
+  const undo = createPlannerSelector(store, (state) => state.undo)
+  const redo = createPlannerSelector(store, (state) => state.redo)
+  const canUndo = createPlannerSelector(store, (state) => state.canUndo)
+  const canRedo = createPlannerSelector(store, (state) => state.canRedo)
+  const toggleElementsPalette = createPlannerSelector(store, (state) => state.toggleElementsPalette)
+  const showElementsPalette = createPlannerSelector(store, (state) => state.showElementsPalette)
 
   return (
     <div className="flex flex-wrap items-center gap-2">
diff --git a/src/features/tables/hooks/usePlannerSync.ts b/src/features/tables/hooks/usePlannerSync.ts
index 841b33b..b58c612 100644
--- a/src/features/tables/hooks/usePlannerSync.ts
+++ b/src/features/tables/hooks/usePlannerSync.ts
@@ -2,7 +2,7 @@
 
 import { useEffect, useRef } from 'react'
 import type { DecorElement } from '@/schemas'
-import { usePlannerStore } from '../stores/usePlannerStore'
+import { createPlannerSelector, getPlannerStore } from '../stores/usePlannerStore'
 
 type SyncMessage =
   | { type: 'UPDATE_ELEMENT'; payload: { id: string; updates: Partial<DecorElement> } }
@@ -20,8 +20,13 @@ export function usePlannerSync(eventId: string) {
   const channelRef = useRef<BroadcastChannel | null>(null)
   const isInitializedRef = useRef(false)
 
-  const { addElement, updateElement, deleteElement, setElements, setPan, setZoom } =
-    usePlannerStore()
+  const store = getPlannerStore(eventId)
+  const addElement = createPlannerSelector(store, (state) => state.addElement)
+  const updateElement = createPlannerSelector(store, (state) => state.updateElement)
+  const deleteElement = createPlannerSelector(store, (state) => state.deleteElement)
+  const setElements = createPlannerSelector(store, (state) => state.setElements)
+  const setPan = createPlannerSelector(store, (state) => state.setPan)
+  const setZoom = createPlannerSelector(store, (state) => state.setZoom)
 
   useEffect(() => {
     // Verificar se BroadcastChannel é suportado
diff --git a/src/features/tables/stores/usePlannerStore.ts b/src/features/tables/stores/usePlannerStore.ts
index 6e8c775..0fb78ad 100644
--- a/src/features/tables/stores/usePlannerStore.ts
+++ b/src/features/tables/stores/usePlannerStore.ts
@@ -183,7 +183,30 @@ export const createPlannerStore = (eventId: string) =>
   )
 
 // Default store (para compatibilidade com código existente)
-export const usePlannerStore = createPlannerStore('default')
+const defaultPlannerStore = createPlannerStore('default')
+
+const storeRegistry = new Map<string, typeof defaultPlannerStore>()
+
+export type PlannerStoreHook = typeof defaultPlannerStore
+
+export const getPlannerStore = (eventId: string | undefined | null): PlannerStoreHook => {
+  const key = eventId && eventId.trim().length > 0 ? eventId : 'default'
+
+  if (!storeRegistry.has(key)) {
+    storeRegistry.set(key, createPlannerStore(key))
+  }
+
+  return storeRegistry.get(key) ?? defaultPlannerStore
+}
+
+// Default store (para compatibilidade com código existente)
+export const usePlannerStore = defaultPlannerStore
+
+// Helper para acessar seletores com store customizado
+export const createPlannerSelector = <T,>(
+  store: PlannerStoreHook,
+  selector: (state: PlannerStore) => T
+) => store(selector)
 
 // Selectors (for performance optimization)
 export const useZoom = () => usePlannerStore((state) => state.zoom)
"@

  $tempFile = New-TemporaryFile
  try {
    Set-Content -LiteralPath $tempFile -Value $patch -NoNewline

    if ($DryRun) {
      git apply --stat $tempFile
    } else {
      git apply --whitespace=nowarn $tempFile
    }
  } finally {
    Remove-Item -LiteralPath $tempFile -ErrorAction SilentlyContinue
  }
}
finally {
  Pop-Location
}
