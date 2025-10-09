import type { DefaultSession } from 'next-auth'

interface HostSessionRole {
  eventId: string
  role: 'OWNER' | 'ADMIN' | 'STAFF'
  eventTitle: string
  eventDate: string
}

declare module 'next-auth' {
  interface Session {
    hostId: string
    currentEventId?: string | null
    roles: HostSessionRole[]
    phoneVerifiedAt?: string | null
    accessToken?: string
    user: DefaultSession['user'] & {
      id: string
      phone?: string
      phoneNormalized?: string
    }
  }

  interface User {
    phone?: string
    phoneNormalized?: string
    roles: HostSessionRole[]
    currentEventId?: string | null
    phoneVerifiedAt?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    hostId: string
    phone?: string
    phoneNormalized?: string
    roles?: HostSessionRole[]
    currentEventId?: string | null
    phoneVerifiedAt?: string | null
    accessToken?: string
  }
}
