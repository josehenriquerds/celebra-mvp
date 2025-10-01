export type Role = 'admin' | 'host' | 'cohost' | 'staff' | 'vendor' | 'viewer'

export interface Permission {
  resource: string
  action: 'create' | 'read' | 'update' | 'delete'
}

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'delete' },
  ],
  host: [
    { resource: 'event', action: 'read' },
    { resource: 'event', action: 'update' },
    { resource: 'guest', action: 'create' },
    { resource: 'guest', action: 'read' },
    { resource: 'guest', action: 'update' },
    { resource: 'guest', action: 'delete' },
    { resource: 'task', action: 'create' },
    { resource: 'task', action: 'read' },
    { resource: 'task', action: 'update' },
    { resource: 'task', action: 'delete' },
    { resource: 'vendor', action: 'create' },
    { resource: 'vendor', action: 'read' },
    { resource: 'vendor', action: 'update' },
    { resource: 'table', action: 'create' },
    { resource: 'table', action: 'read' },
    { resource: 'table', action: 'update' },
    { resource: 'report', action: 'read' },
  ],
  cohost: [
    { resource: 'event', action: 'read' },
    { resource: 'guest', action: 'read' },
    { resource: 'guest', action: 'update' },
    { resource: 'task', action: 'read' },
    { resource: 'task', action: 'update' },
    { resource: 'vendor', action: 'read' },
    { resource: 'table', action: 'read' },
    { resource: 'table', action: 'update' },
    { resource: 'report', action: 'read' },
  ],
  staff: [
    { resource: 'event', action: 'read' },
    { resource: 'guest', action: 'read' },
    { resource: 'task', action: 'read' },
    { resource: 'task', action: 'update' },
    { resource: 'table', action: 'read' },
  ],
  vendor: [
    { resource: 'event', action: 'read' },
    { resource: 'task', action: 'read' },
    { resource: 'task', action: 'update' },
  ],
  viewer: [
    { resource: 'event', action: 'read' },
    { resource: 'guest', action: 'read' },
    { resource: 'task', action: 'read' },
    { resource: 'report', action: 'read' },
  ],
}

export function hasPermission(
  role: Role,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  const permissions = rolePermissions[role]

  return permissions.some(
    (p) =>
      (p.resource === '*' || p.resource === resource) && (p.action === action || p.resource === '*')
  )
}

export function canCreate(role: Role, resource: string): boolean {
  return hasPermission(role, resource, 'create')
}

export function canRead(role: Role, resource: string): boolean {
  return hasPermission(role, resource, 'read')
}

export function canUpdate(role: Role, resource: string): boolean {
  return hasPermission(role, resource, 'update')
}

export function canDelete(role: Role, resource: string): boolean {
  return hasPermission(role, resource, 'delete')
}

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    admin: 'Administrador',
    host: 'Anfitrião',
    cohost: 'Co-Anfitrião',
    staff: 'Equipe',
    vendor: 'Fornecedor',
    viewer: 'Visualizador',
  }
  return labels[role]
}
