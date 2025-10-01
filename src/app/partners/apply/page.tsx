import { VendorApplyForm } from '@/components/vendors/VendorApplyForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cadastro de Parceiros | Celebre',
  description: 'Cadastre-se como parceiro do Celebre e seja recomendado para eventos incríveis',
}

export default function PartnersApplyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1
            className="mb-4 text-4xl font-bold md:text-5xl"
            style={{ color: 'var(--brand, #863F44)' }}
          >
            Torne-se um Parceiro Celebre
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Conecte-se com anfitriões de eventos que buscam os melhores fornecedores. Preencha o
            formulário abaixo e aguarde nossa aprovação em até 48h.
          </p>
        </div>

        <VendorApplyForm />

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Dúvidas? Entre em contato:{' '}
            <a href="mailto:parceiros@celebre.com" className="underline">
              parceiros@celebre.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
