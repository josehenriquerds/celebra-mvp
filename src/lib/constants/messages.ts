/**
 * Mensagens padronizadas da aplicação
 * Centraliza strings para reutilização e manutenção
 */

export const API_MESSAGES = {
  // Erros gerais
  FORBIDDEN: 'Forbidden',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_PARAMS: 'Parâmetros inválidos',
  INVALID_DATA: 'Dados inválidos',

  // Gifts
  GIFT_ALREADY_EXISTS: 'Já existe um presente com esses dados',

  // Vendors
  VENDOR_EMAIL_PHONE_EXISTS: 'E-mail ou telefone já cadastrado',
  VENDOR_APPLY_SUCCESS: 'Cadastro recebido! Revisaremos seu perfil em até 48h.',
  VENDOR_NOT_FOUND: 'Vendor não encontrado',
  VENDOR_INVALID_ACTION: 'Ação inválida',
  VENDOR_APPROVED: 'Vendor aprovado com sucesso',
  VENDOR_REJECTED: 'Vendor reprovado com sucesso',
  VENDOR_SUSPENDED: 'Vendor suspenso com sucesso',
  VENDOR_REACTIVATED: 'Vendor reativado com sucesso',
  VENDOR_UPDATE_FAILED: 'Failed to update vendor',
  VENDOR_DELETE_FAILED: 'Failed to delete vendor',
  VENDOR_FETCH_ERROR: 'Erro ao buscar vendors',
  VENDOR_STATUS_CHANGE_ERROR: 'Erro ao alterar status',
  VENDOR_DELETE_WITH_TASKS: (count: number) =>
    `Não é possível deletar. Este fornecedor possui ${count} tarefa(s) vinculada(s).`,

  // WhatsApp
  WHATSAPP_NO_MESSAGES: 'No messages',
  WHATSAPP_ALREADY_PROCESSED: 'Already processed',
  WHATSAPP_CONTACT_NOT_FOUND: 'Contact not found',
  WHATSAPP_NO_EVENT: 'No event found',
} as const

export const SUCCESS_MESSAGES = {
  OPERATION_SUCCESS: 'Operação realizada com sucesso',
  DELETE_SUCCESS: 'Deletado com sucesso',
  UPDATE_SUCCESS: 'Atualizado com sucesso',
  CREATE_SUCCESS: 'Criado com sucesso',
} as const
