'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Settings as SettingsIcon,
  Palette,
  Shield,
  Plug,
  MessageSquare,
  Bell,
  Save,
  CheckCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Settings {
  branding: {
    primaryColor: string
    logo: string | null
    customDomain: string | null
  }
  lgpd: {
    consentRequired: boolean
    dataRetentionDays: number
    autoDeleteAfterEvent: boolean
  }
  integrations: {
    googleCalendar: {
      enabled: boolean
      clientId: string | null
      refreshToken: string | null
    }
    outlook: {
      enabled: boolean
      clientId: string | null
      refreshToken: string | null
    }
    n8n: {
      enabled: boolean
      webhookUrl: string | null
    }
  }
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    whatsappEnabled: boolean
  }
}

interface MessageTemplates {
  rsvpConfirmation: string
  rsvpReminder: string
  thankYou: string
  customMessage: string
}

export default function EventSettingsPage() {
  const params = useParams()
  const eventId = params.id as string

  const [settings, setSettings] = useState<Settings | null>(null)
  const [templates, setTemplates] = useState<MessageTemplates | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [eventId])

  async function fetchSettings() {
    try {
      setLoading(true)
      const res = await fetch(`/api/events/${eventId}/settings`)
      const data = await res.json()
      setSettings(data.settings)
      setTemplates(data.templates)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      const res = await fetch(`/api/events/${eventId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, templates }),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings || !templates) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-celebre-brand"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-celebre-ink">Configurações</h1>
          <p className="text-celebre-muted mt-1">
            Personalize seu evento, templates e integrações
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saved ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvo!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="templates">
            <MessageSquare className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="h-4 w-4 mr-2" />
            Marca
          </TabsTrigger>
          <TabsTrigger value="lgpd">
            <Shield className="h-4 w-4 mr-2" />
            LGPD
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="h-4 w-4 mr-2" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Templates de Mensagens</CardTitle>
              <CardDescription>
                Personalize as mensagens automáticas enviadas aos convidados. Use variáveis como{' '}
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{'{{name}}'}</code>,{' '}
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{'{{eventTitle}}'}</code>,{' '}
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{'{{date}}'}</code>,{' '}
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{'{{time}}'}</code>,{' '}
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{'{{venue}}'}</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rsvpConfirmation">Confirmação de RSVP</Label>
                <Textarea
                  id="rsvpConfirmation"
                  value={templates.rsvpConfirmation}
                  onChange={(e) =>
                    setTemplates({ ...templates, rsvpConfirmation: e.target.value })
                  }
                  rows={3}
                  placeholder="Mensagem enviada quando o convidado confirma presença"
                />
                <p className="text-xs text-celebre-muted">
                  Enviada automaticamente quando o convidado confirma presença
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rsvpReminder">Lembrete de RSVP</Label>
                <Textarea
                  id="rsvpReminder"
                  value={templates.rsvpReminder}
                  onChange={(e) => setTemplates({ ...templates, rsvpReminder: e.target.value })}
                  rows={3}
                  placeholder="Mensagem de lembrete sobre o evento"
                />
                <p className="text-xs text-celebre-muted">
                  Lembrete enviado antes do evento
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thankYou">Agradecimento</Label>
                <Textarea
                  id="thankYou"
                  value={templates.thankYou}
                  onChange={(e) => setTemplates({ ...templates, thankYou: e.target.value })}
                  rows={3}
                  placeholder="Mensagem de agradecimento após o evento"
                />
                <p className="text-xs text-celebre-muted">
                  Enviada após o check-in ou ao final do evento
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customMessage">Mensagem Customizada</Label>
                <Textarea
                  id="customMessage"
                  value={templates.customMessage}
                  onChange={(e) => setTemplates({ ...templates, customMessage: e.target.value })}
                  rows={4}
                  placeholder="Crie seu próprio template personalizado"
                />
                <p className="text-xs text-celebre-muted">
                  Template livre para uso em campanhas personalizadas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Identidade Visual</CardTitle>
              <CardDescription>
                Personalize a aparência do portal do convidado e comunicações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Cor Principal</Label>
                <div className="flex gap-3 items-center">
                  <Input
                    type="color"
                    id="primaryColor"
                    value={settings.branding.primaryColor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        branding: { ...settings.branding, primaryColor: e.target.value },
                      })
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={settings.branding.primaryColor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        branding: { ...settings.branding, primaryColor: e.target.value },
                      })
                    }
                    placeholder="#8B5CF6"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-celebre-muted">
                  Cor usada no portal do convidado e botões
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">URL do Logo</Label>
                <Input
                  id="logo"
                  type="url"
                  value={settings.branding.logo || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      branding: { ...settings.branding, logo: e.target.value || null },
                    })
                  }
                  placeholder="https://exemplo.com/logo.png"
                />
                <p className="text-xs text-celebre-muted">
                  Logo exibido no portal do convidado
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customDomain">Domínio Personalizado</Label>
                <Input
                  id="customDomain"
                  type="text"
                  value={settings.branding.customDomain || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      branding: { ...settings.branding, customDomain: e.target.value || null },
                    })
                  }
                  placeholder="meu-evento.com.br"
                />
                <p className="text-xs text-celebre-muted">
                  Configure um domínio personalizado para o portal (requer configuração DNS)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LGPD Tab */}
        <TabsContent value="lgpd" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Privacidade e LGPD</CardTitle>
              <CardDescription>
                Configure políticas de privacidade e conformidade com a LGPD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Consentimento Obrigatório</Label>
                  <p className="text-sm text-celebre-muted">
                    Exigir consentimento explícito para coleta de dados
                  </p>
                </div>
                <Switch
                  checked={settings.lgpd.consentRequired}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      lgpd: { ...settings.lgpd, consentRequired: checked },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataRetentionDays">Retenção de Dados (dias)</Label>
                <Input
                  id="dataRetentionDays"
                  type="number"
                  value={settings.lgpd.dataRetentionDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      lgpd: { ...settings.lgpd, dataRetentionDays: parseInt(e.target.value) },
                    })
                  }
                  min={30}
                  max={3650}
                />
                <p className="text-xs text-celebre-muted">
                  Por quanto tempo os dados devem ser mantidos após o evento (30-3650 dias)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Exclusão Automática</Label>
                  <p className="text-sm text-celebre-muted">
                    Deletar automaticamente dados após o período de retenção
                  </p>
                </div>
                <Switch
                  checked={settings.lgpd.autoDeleteAfterEvent}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      lgpd: { ...settings.lgpd, autoDeleteAfterEvent: checked },
                    })
                  }
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  ✓ Portal do Convidado LGPD-Compliant
                </p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Direito de acesso aos dados</li>
                  <li>• Direito de portabilidade (exportação JSON)</li>
                  <li>• Direito ao esquecimento (exclusão)</li>
                  <li>• Direito de oposição (opt-out)</li>
                  <li>• Registro de consentimentos</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Integrações</CardTitle>
              <CardDescription>
                Conecte com calendários e ferramentas externas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Calendar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Google Calendar</Label>
                    <p className="text-sm text-celebre-muted">
                      Sincronize eventos com Google Calendar
                    </p>
                  </div>
                  <Switch
                    checked={settings.integrations.googleCalendar.enabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        integrations: {
                          ...settings.integrations,
                          googleCalendar: { ...settings.integrations.googleCalendar, enabled: checked },
                        },
                      })
                    }
                  />
                </div>
                {settings.integrations.googleCalendar.enabled && (
                  <div className="space-y-2 ml-6">
                    <Input
                      placeholder="Client ID do Google"
                      value={settings.integrations.googleCalendar.clientId || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          integrations: {
                            ...settings.integrations,
                            googleCalendar: {
                              ...settings.integrations.googleCalendar,
                              clientId: e.target.value || null,
                            },
                          },
                        })
                      }
                    />
                  </div>
                )}
              </div>

              {/* Outlook */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Outlook Calendar</Label>
                    <p className="text-sm text-celebre-muted">
                      Sincronize eventos com Outlook/Microsoft 365
                    </p>
                  </div>
                  <Switch
                    checked={settings.integrations.outlook.enabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        integrations: {
                          ...settings.integrations,
                          outlook: { ...settings.integrations.outlook, enabled: checked },
                        },
                      })
                    }
                  />
                </div>
                {settings.integrations.outlook.enabled && (
                  <div className="space-y-2 ml-6">
                    <Input
                      placeholder="Client ID do Microsoft"
                      value={settings.integrations.outlook.clientId || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          integrations: {
                            ...settings.integrations,
                            outlook: {
                              ...settings.integrations.outlook,
                              clientId: e.target.value || null,
                            },
                          },
                        })
                      }
                    />
                  </div>
                )}
              </div>

              {/* n8n */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>n8n Webhook</Label>
                    <p className="text-sm text-celebre-muted">
                      Automação via n8n para WhatsApp e outros canais
                    </p>
                  </div>
                  <Switch
                    checked={settings.integrations.n8n.enabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        integrations: {
                          ...settings.integrations,
                          n8n: { ...settings.integrations.n8n, enabled: checked },
                        },
                      })
                    }
                  />
                </div>
                {settings.integrations.n8n.enabled && (
                  <div className="space-y-2 ml-6">
                    <Input
                      placeholder="https://n8n.exemplo.com/webhook"
                      value={settings.integrations.n8n.webhookUrl || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          integrations: {
                            ...settings.integrations,
                            n8n: {
                              ...settings.integrations.n8n,
                              webhookUrl: e.target.value || null,
                            },
                          },
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Canais de Notificação</CardTitle>
              <CardDescription>
                Configure quais canais usar para comunicações com convidados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>WhatsApp</Label>
                  <p className="text-sm text-celebre-muted">
                    Enviar mensagens via WhatsApp (requer integração n8n)
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.whatsappEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, whatsappEnabled: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email</Label>
                  <p className="text-sm text-celebre-muted">
                    Enviar notificações por email
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailEnabled: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS</Label>
                  <p className="text-sm text-celebre-muted">
                    Enviar mensagens via SMS
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.smsEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, smsEnabled: checked },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saved ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Alterações Salvas!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Todas as Configurações'}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}