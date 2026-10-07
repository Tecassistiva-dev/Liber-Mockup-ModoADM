import type { MenuLevel, ProfileModoProvaConfig, ProfileModoSalaConfig } from '../types'
import { SETTINGS_OPTIONS, SETTINGS_LEVELS } from './settings'

export const MENU: MenuLevel[] = [
  {
    id: 'root',
    header: '.menu raiz',
    options: [
      { id: 'digitalizar', label: 'Digitalizar', type: 'action' },
      { id: 'editor', label: 'Editor', type: 'action' },
      { id: 'arquivos', label: 'Arquivos', type: 'action' },
      { id: 'calculadora', label: 'Calculadora', type: 'action' },
      { id: 'ampliar', label: 'Ampliar', type: 'action' },
      { id: 'usandoIa', label: 'Usando IA', type: 'action' },
      { id: 'audios', label: 'Áudios', type: 'action' },
      { id: 'gravador', label: 'Gravador', type: 'action' },
      { id: 'livros', label: 'Livros', type: 'action' },
      { id: 'navegador', label: 'Navegador', type: 'action' },
      { id: 'email', label: 'E-mail', type: 'action' },
      { id: 'contatos', label: 'Contatos', type: 'action' },
      { id: 'aprenderBraille', label: 'Aprender Braille', type: 'action' },
      { id: 'imprimir', label: 'Imprimir', type: 'action' },
      { id: 'modoProvaRoot', label: 'Modo Prova', type: 'submenu', submenuId: 'modoProva' },
      { id: 'modoSalaRoot', label: 'Modo Sala de Aula', type: 'submenu', submenuId: 'modoSala' },
      { id: 'notificacoes', label: 'Notificações', type: 'action' },
      { id: 'settingsEntry', label: 'Configurações', type: 'submenu', submenuId: 'settings' },
      { id: 'desligar', label: 'Desligar', type: 'action' }
    ]
  },
  {
    id: 'settings',
    header: '.configuracoes',
    options: [
      ...SETTINGS_OPTIONS,
      { id: 'modoAdmEntry', label: 'Modo ADM', type: 'submenu', submenuId: 'main' }
    ]
  },
  {
    id: 'logoutPassword',
    header: '.confirmar deslogar',
    options: []
  },
  {
    id: 'main',
    header: '.modo adm',
    options: [
      { id: 'configMode', label: 'Configurar Modos', type: 'submenu', submenuId: 'config' },
      { id: 'users', label: 'Gerenciar Usuários', type: 'submenu', submenuId: 'users' },
      { id: 'toggleVisualMode', label: 'Modo Visual', type: 'action' },
      { id: 'resetFactory', label: 'Reset de Fábrica', type: 'modal', submenuId: 'reset' }
    ]
  },
  {
    id: 'users',
    header: '.gerenciador de usuarios',
    options: [
      { id: 'createUser', label: 'Criar Usuário', type: 'submenu', submenuId: 'createUser' },
      { id: 'editUser', label: 'Editar Usuário', type: 'submenu', submenuId: 'editUserSelect' },
      { id: 'deleteUser', label: 'Deletar Usuário', type: 'submenu', submenuId: 'deleteUserSelect' },
      { id: 'listUsers', label: 'Listar Usuários', type: 'submenu', submenuId: 'listUsers' },
      { id: 'resetPassword', label: 'Redefinir Senha', type: 'submenu', submenuId: 'resetPassword' }
    ]
  },
  {
    id: 'createUser',
    header: '.criar usuario',
    options: [
      { id: 'cu_name', label: 'Inserir Nome', type: 'submenu', submenuId: 'createUserName' },
      { id: 'cu_password', label: 'Inserir Senha', type: 'submenu', submenuId: 'createUserPassword' },
      { id: 'cu_role', label: 'Definir Permissões', type: 'submenu', submenuId: 'createUserRole' },
      { id: 'cu_menus', label: 'Configurar Apps Ativos', type: 'submenu', submenuId: 'createUserMenus' },
      { id: 'cu_confirm', label: 'Confirmar Criação', type: 'submenu', submenuId: 'createUserConfirm' }
    ]
  },
  {
    id: 'editUser',
    header: '.editar usuario',
    options: [
      { id: 'eu_name', label: 'Editar Nome', type: 'submenu', submenuId: 'editUserName' },
      { id: 'eu_password', label: 'Editar Senha', type: 'action' },
      { id: 'eu_role', label: 'Editar Perfil', type: 'submenu', submenuId: 'editUserRole' },
      { id: 'eu_menus', label: 'Editar Apps', type: 'submenu', submenuId: 'editUserMenus' }
    ]
  },
  {
    id: 'editUserCurrentPassword',
    header: '.senha atual',
    options: []
  },
  {
    id: 'listUsers',
    header: '.listar usuarios',
    options: []
  },
  {
    id: 'resetPassword',
    header: '.redefinir senha',
    options: [
      { id: 'rp_select', label: 'Selecionar Usuário', type: 'submenu', submenuId: 'resetPasswordSelect' },
      { id: 'rp_confirm', label: 'Confirmar Redefinição', type: 'submenu', submenuId: 'resetPasswordConfirm' }
    ]
  },
  {
    id: 'createUserName',
    header: '.inserir nome',
    options: []
  },
  {
    id: 'createUserRole',
    header: '.definir permissoes',
    options: []
  },
  {
    id: 'createUserMenus',
    header: '.apps ativos',
    options: []
  },
  {
    id: 'createUserPassword',
    header: '.definir senha',
    options: []
  },
  {
    id: 'createUserConfirm',
    header: '.confirmar criacao',
    options: [
      { id: 'cc_name', label: 'Nome', type: 'submenu', submenuId: 'createUserName' },
      { id: 'cc_password', label: 'Senha', type: 'submenu', submenuId: 'createUserPassword' },
      { id: 'cc_role', label: 'Perfil', type: 'submenu', submenuId: 'createUserRole' },
      { id: 'cc_menus', label: 'Configurar Apps Ativos', type: 'submenu', submenuId: 'createUserMenus' },
      { id: 'cc_confirm', label: 'Confirmar Criação', type: 'action' }
    ]
  },
  {
    id: 'editUserSelect',
    header: '.selecionar usuario',
    options: []
  },
  {
    id: 'editUserName',
    header: '.editar nome',
    options: []
  },
  {
    id: 'editUserPassword',
    header: '.editar senha',
    options: []
  },
  {
    id: 'editUserRole',
    header: '.editar perfil',
    options: []
  },
  {
    id: 'editUserMenus',
    header: '.editar apps',
    options: []
  },
  {
    id: 'editUserFields',
    header: '.editar dados',
    options: []
  },
  {
    id: 'deleteUserSelect',
    header: '.selecionar usuario',
    options: []
  },
  {
    id: 'deleteUserConfirm',
    header: '.confirmar exclusao',
    options: []
  },

  {
    id: 'resetPasswordSelect',
    header: '.selecionar usuario',
    options: []
  },
  {
    id: 'resetPasswordConfirm',
    header: '.confirmar redefinicao',
    options: []
  },
  {
    id: 'config',
    header: '.configuracao de modo',
    options: [
      { id: 'modoProva', label: 'Modo Prova', type: 'submenu', submenuId: 'modoProva', choices: ['Ativado', 'Desativado'], choiceKey: 'modoProva' },
      { id: 'modoSala', label: 'Modo Sala de Aula', type: 'submenu', submenuId: 'modoSala', choices: ['Ativado', 'Desativado'], choiceKey: 'modoSala' }
    ]
  },
  {
    id: 'modoProva',
    header: '.modo prova',
    options: [
      { id: 'mp_status', label: 'Estado', type: 'submenu', submenuId: 'modoProvaStatus', choices: ['Ativado', 'Desativado'], choiceKey: 'modoProva' },
      { id: 'mp_wifi', label: 'WiFi', type: 'submenu', submenuId: 'modoProvaWifi', choices: ['Ligado', 'Desligado'], choiceKey: 'modoProvaWifi' },
      { id: 'mp_bt', label: 'Bluetooth', type: 'submenu', submenuId: 'modoProvaBt', choices: ['Ligado', 'Desligado'], choiceKey: 'modoProvaBt' },
      { id: 'mp_apps', label: 'Configurar Apps', type: 'submenu', submenuId: 'modoProvaMenus' }
    ]
  },
  {
    id: 'modoProvaStatus',
    header: '.estado do modo prova',
    options: [
      { id: 'mp_ativado', label: 'Ativado', type: 'action', choiceKey: 'modoProva' },
      { id: 'mp_desativado', label: 'Desativado', type: 'action', choiceKey: 'modoProva' }
    ]
  },
  {
    id: 'modoProvaWifi',
    header: '.wifi modo prova',
    options: [
      { id: 'mp_wifi_ligado', label: 'Ligado', type: 'action', choiceKey: 'modoProvaWifi' },
      { id: 'mp_wifi_desligado', label: 'Desligado', type: 'action', choiceKey: 'modoProvaWifi' }
    ]
  },
  {
    id: 'modoProvaBt',
    header: '.bt modo prova',
    options: [
      { id: 'mp_bt_ligado', label: 'Ligado', type: 'action', choiceKey: 'modoProvaBt' },
      { id: 'mp_bt_desligado', label: 'Desligado', type: 'action', choiceKey: 'modoProvaBt' }
    ]
  },
  {
    id: 'modoProvaMenus',
    header: '.apps do modo prova',
    options: []
  },
  {
    id: 'modoSala',
    header: '.modo sala de aula',
    options: [
      { id: 'ms_status', label: 'Estado', type: 'submenu', submenuId: 'modoSalaStatus', choices: ['Ativado', 'Desativado'], choiceKey: 'modoSala' },
      { id: 'ms_wifi', label: 'WiFi', type: 'submenu', submenuId: 'modoSalaWifi', choices: ['Ligado', 'Desligado'], choiceKey: 'modoSalaWifi' },
      { id: 'ms_bt', label: 'Bluetooth', type: 'submenu', submenuId: 'modoSalaBt', choices: ['Ligado', 'Desligado'], choiceKey: 'modoSalaBt' },
      { id: 'ms_apps', label: 'Configurar Apps', type: 'submenu', submenuId: 'modoSalaMenus' }
    ]
  },
  {
    id: 'modoSalaStatus',
    header: '.estado do modo sala',
    options: [
      { id: 'ms_ativado', label: 'Ativado', type: 'action', choiceKey: 'modoSala' },
      { id: 'ms_desativado', label: 'Desativado', type: 'action', choiceKey: 'modoSala' }
    ]
  },
  {
    id: 'modoSalaWifi',
    header: '.wifi modo sala',
    options: [
      { id: 'ms_wifi_ligado', label: 'Ligado', type: 'action', choiceKey: 'modoSalaWifi' },
      { id: 'ms_wifi_desligado', label: 'Desligado', type: 'action', choiceKey: 'modoSalaWifi' }
    ]
  },
  {
    id: 'modoSalaBt',
    header: '.bt modo sala',
    options: [
      { id: 'ms_bt_ligado', label: 'Ligado', type: 'action', choiceKey: 'modoSalaBt' },
      { id: 'ms_bt_desligado', label: 'Desligado', type: 'action', choiceKey: 'modoSalaBt' }
    ]
  },
  {
    id: 'modoSalaMenus',
    header: '.apps do modo sala',
    options: []
  },
  {
    id: 'reset',
    header: '.reset de fabrica',
    options: []
  },
  ...SETTINGS_LEVELS
]

export function getLevel(id: string) {
  return MENU.find(m => m.id === id) as MenuLevel
}

export const ROOT_MENU_ITEM_IDS = MENU.find(m => m.id === 'root')?.options.map(opt => opt.id) ?? []
export const APPS_LIBERADOS_IDS = ROOT_MENU_ITEM_IDS.filter(id => id !== 'modoProvaRoot' && id !== 'modoSalaRoot')
export const DEFAULT_MENU_ACCESS = Object.fromEntries(APPS_LIBERADOS_IDS.map(id => [id, true])) as Record<string, boolean>

export const DEFAULT_MODO_PROVA_APPS = ['editor', 'calculadora', 'desligar']
export const DEFAULT_MODO_SALA_APPS = [
  'digitalizar',
  'editor',
  'arquivos',
  'calculadora',
  'ampliar',
  'audios',
  'gravador',
  'livros',
  'aprenderBraille',
  'imprimir',
  'desligar'
]

export const DEFAULT_MODO_PROVA_ACCESS = Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, DEFAULT_MODO_PROVA_APPS.includes(id)])) as Record<string, boolean>
export const DEFAULT_MODO_SALA_ACCESS = Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, DEFAULT_MODO_SALA_APPS.includes(id)])) as Record<string, boolean>

export const DEFAULT_PROFILE_APPS: Record<string, Record<string, boolean>> = {
  universal: Object.fromEntries(APPS_LIBERADOS_IDS.map(id => [id, true])),
  visual: Object.fromEntries(APPS_LIBERADOS_IDS.map(id => [id, ['digitalizar', 'editor', 'arquivos', 'calculadora', 'ampliar', 'usandoIa', 'audios', 'gravador', 'livros', 'aprenderBraille', 'imprimir', 'notificacoes', 'desligar'].includes(id)])),
  cognitivo: Object.fromEntries(APPS_LIBERADOS_IDS.map(id => [id, ['editor', 'arquivos', 'calculadora', 'livros', 'gravador', 'aprenderBraille', 'notificacoes', 'desligar'].includes(id)])),
  neurodivergente: Object.fromEntries(APPS_LIBERADOS_IDS.map(id => [id, ['editor', 'arquivos', 'calculadora', 'livros', 'audios', 'gravador', 'aprenderBraille', 'imprimir', 'notificacoes', 'desligar'].includes(id)])),
  custom: Object.fromEntries(APPS_LIBERADOS_IDS.map(id => [id, true]))
}


export const DEFAULT_PROFILE_MODO_PROVA: Record<string, ProfileModoProvaConfig> = {
  universal: {
    status: 'Desativado',
    wifi: 'Desligado',
    bluetooth: 'Desligado',
    apps: Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, ['editor', 'calculadora', 'desligar'].includes(id)]))
  },
  visual: {
    status: 'Desativado',
    wifi: 'Desligado',
    bluetooth: 'Desligado',
    apps: Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, ['editor', 'calculadora', 'audios', 'livros', 'aprenderBraille', 'desligar'].includes(id)]))
  },
  cognitivo: {
    status: 'Desativado',
    wifi: 'Desligado',
    bluetooth: 'Desligado',
    apps: Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, ['editor', 'calculadora', 'desligar'].includes(id)]))
  },
  neurodivergente: {
    status: 'Desativado',
    wifi: 'Desligado',
    bluetooth: 'Desligado',
    apps: Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, ['editor', 'calculadora', 'audios', 'desligar'].includes(id)]))
  },
  custom: {
    status: 'Desativado',
    wifi: 'Desligado',
    bluetooth: 'Desligado',
    apps: Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, ['editor', 'calculadora', 'desligar'].includes(id)]))
  }
}

export const DEFAULT_PROFILE_MODO_SALA: Record<string, ProfileModoSalaConfig> = {
  universal: {
    status: 'Ativado',
    wifi: 'Ativado',
    bluetooth: 'Ativado',
    apps: Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, DEFAULT_MODO_SALA_APPS.includes(id)]))
  },
  visual: {
    status: 'Ativado',
    wifi: 'Ativado',
    bluetooth: 'Ativado',
    apps: Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, ['digitalizar', 'editor', 'arquivos', 'calculadora', 'ampliar', 'usandoIa', 'audios', 'gravador', 'livros', 'aprenderBraille', 'imprimir', 'desligar'].includes(id)]))
  },
  cognitivo: {
    status: 'Ativado',
    wifi: 'Ativado',
    bluetooth: 'Ativado',
    apps: Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, ['editor', 'arquivos', 'calculadora', 'livros', 'gravador', 'aprenderBraille', 'desligar'].includes(id)]))
  },
  neurodivergente: {
    status: 'Ativado',
    wifi: 'Ativado',
    bluetooth: 'Ativado',
    apps: Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, ['editor', 'arquivos', 'calculadora', 'livros', 'audios', 'gravador', 'aprenderBraille', 'imprimir', 'desligar'].includes(id)]))
  },
  custom: {
    status: 'Ativado',
    wifi: 'Ativado',
    bluetooth: 'Ativado',
    apps: Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, DEFAULT_MODO_SALA_APPS.includes(id)]))
  }
}

export const DEFAULT_PASSWORD = 'Teca123'

export function getRootOptionLabel(menuId: string) {
  return MENU.find(m => m.id === 'root')?.options.find(opt => opt.id === menuId)?.label ?? menuId
}

export const ROLE_OPTIONS = ['Suporte', 'Administrativo', 'Usuário']
