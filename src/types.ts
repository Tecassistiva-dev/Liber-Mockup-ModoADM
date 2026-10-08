export type Option = {
  id: string
  label: string
  type: 'action' | 'submenu' | 'modal'
  submenuId?: string
  // choices: list of possible values to display after the label when set
  choices?: string[]
  choiceKey?: string
}

export type MenuLevel = {
  id: string
  header: string
  title?: string
  options: Option[]
}


export type User = {
  id: string
  name: string
  password: string
  role: string
  menuAccess: Record<string, boolean>
  modoProvaAccess?: Record<string, boolean>
  modoSalaAccess?: Record<string, boolean>
  createdByAdminId?: string
  wifi?: 'Ativado' | 'Desligado'
  bluetooth?: 'Ativado' | 'Desligado'
  modoProvaWifi?: 'Ativado' | 'Desligado'
  modoProvaBt?: 'Ativado' | 'Desligado'
}

export interface ProfileModoProvaConfig {
  status: 'Ativado' | 'Desativado'
  wifi: 'Ativado' | 'Desligado'
  bluetooth: 'Ativado' | 'Desligado'
  apps: Record<string, boolean>
}

export interface ProfileModoSalaConfig {
  status: 'Ativado' | 'Desativado'
  wifi?: 'Ativado' | 'Desligado'
  bluetooth?: 'Ativado' | 'Desligado'
  apps: Record<string, boolean>
}
