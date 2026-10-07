import React, { useEffect, useRef, useState } from 'react'
import {
  
  BookOpen,
  GraduationCap,
  Users,
  LayoutGrid,
  ArrowLeft,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Eye,
  EyeOff,
  Sliders,
  Lock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  KeyRound,
  AlertTriangle,
  Download,
  Upload,
  X,
} from 'lucide-react'
import type { Option, User } from './types'
import type { ProfileModoProvaConfig, ProfileModoSalaConfig } from './types'
import InfoTip from './components/InfoTip'
import AppToggleButton from './components/AppToggleButton'
import {
  getLevel, ROOT_MENU_ITEM_IDS, APPS_LIBERADOS_IDS, DEFAULT_MENU_ACCESS,
  DEFAULT_MODO_PROVA_ACCESS, DEFAULT_MODO_SALA_ACCESS,
  DEFAULT_PROFILE_APPS, DEFAULT_PROFILE_MODO_PROVA, DEFAULT_PROFILE_MODO_SALA,
  DEFAULT_PASSWORD, getRootOptionLabel, ROLE_OPTIONS
} from './data/defaults'
import {
  PRESET_NOTES, PRESET_KEYS, SETTINGS_KEYS, SETTINGS_ACTION_PREFIX, SETTINGS_CONFIRM_PREFIX, SETTINGS_CONN_PREFIX,
  SETTINGS_SET_PREFIX, SETTINGS_STATUS_PREFIX, SETTINGS_TEXT_PREFIX, SETTINGS_BACK_ID, SETTINGS_NOOP_ID,
  SETTINGS_PLACEHOLDER_PREFIX,
  getSettingsChoiceLabels, findSettingsAction, findSettingsStatus, findTextSetting, getDynamicSettingsOptions, isValidIpv4,
  SETTINGS_CONTAINER_IDS, findSettingsAncestors, type OutlineNode,
  parseColorCombo, parseSettingsXml, resolveSettings, runConnectionAction, settingChanges, settingsToXml, type ConnectionAction
} from './data/settings'
import SettingsPanel from './components/SettingsPanel'

const DEMO_USER_NAMES: Record<string, string> = { user_1: 'João', user_2: 'Bruno', user_3: 'Luic' }
const LEGACY_DEMO_USER_NAMES: Record<string, string> = { user_1: 'User 1', user_2: 'User 2', user_3: 'User 3' }

export default function App() {
  const [isVisualMode, setIsVisualMode] = useState(false)
  const [, setActiveNavSection] = useState<'quickActions' | 'profiles' | 'appsLiberados' | 'settings' | 'modoProva' | 'modoSala' | 'users' | 'account' | 'adminPassword' | 'factoryReset'>('quickActions')
  const [userManagementView, setUserManagementView] = useState<'list' | 'new' | 'edit'>('list')
  const [isUsersExpanded, setIsUsersExpanded] = useState(false)
  const [isAdminPasswordExpanded, setIsAdminPasswordExpanded] = useState(false)
  const mainScrollRef = useRef<HTMLElement | null>(null)
  const [isStickyQuickActionsVisible, setIsStickyQuickActionsVisible] = useState(false)
  const [isStickyProfileVisible, setIsStickyProfileVisible] = useState(false)
  const [themeMode, setThemeMode] = useState<'modern' | 'high-contrast-yellow' | 'high-contrast-bw' | 'dark'>('modern')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark')
  }, [themeMode])
  const [activeProfile, setActiveProfile] = useState<string>('universal')
  const [profileConfigTab, setProfileConfigTab] = useState<'standard' | 'modoProva' | 'modoSala'>('standard')
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<User | null>(null)

  const [profileApps, setProfileApps] = useState<Record<string, Record<string, boolean>>>(() => {
    try {
      const stored = window.sessionStorage.getItem('modoAdmProfileApps')
      return stored ? JSON.parse(stored) : DEFAULT_PROFILE_APPS
    } catch {
      return DEFAULT_PROFILE_APPS
    }
  })

  useEffect(() => {
    try {
      window.sessionStorage.setItem('modoAdmProfileApps', JSON.stringify(profileApps))
    } catch { }
  }, [profileApps])

  const [profileModoProva, setProfileModoProva] = useState<Record<string, ProfileModoProvaConfig>>(() => {
    try {
      const stored = window.sessionStorage.getItem('modoAdmProfileModoProva')
      return stored ? JSON.parse(stored) : DEFAULT_PROFILE_MODO_PROVA
    } catch {
      return DEFAULT_PROFILE_MODO_PROVA
    }
  })

  useEffect(() => {
    try {
      window.sessionStorage.setItem('modoAdmProfileModoProva', JSON.stringify(profileModoProva))
    } catch { }
  }, [profileModoProva])

  const [profileModoSala, setProfileModoSala] = useState<Record<string, ProfileModoSalaConfig>>(() => {
    try {
      const stored = window.sessionStorage.getItem('modoAdmProfileModoSala')
      return stored ? JSON.parse(stored) : DEFAULT_PROFILE_MODO_SALA
    } catch {
      return DEFAULT_PROFILE_MODO_SALA
    }
  })

  useEffect(() => {
    try {
      window.sessionStorage.setItem('modoAdmProfileModoSala', JSON.stringify(profileModoSala))
    } catch { }
  }, [profileModoSala])
  const [stack, setStack] = useState<{ id: string; index: number }[]>([{ id: 'root', index: 0 }])
  const [choicesState, setChoicesState] = useState<Record<string, string>>({
    nivel: 'Iniciante',
    guiaSensorial: 'Ligado',
    modoProva: 'Desativado',
    modoSala: 'Ativado',
    wifi: 'Ativado',
    bluetooth: 'Desligado',
    modoProvaWifi: 'Desligado',
    modoProvaBt: 'Desligado',
    modoSalaWifi: 'Desligado',
    modoSalaBt: 'Desligado'
  })
  const [message, setMessage] = useState('')
  const [popupMessage, setPopupMessage] = useState('')
  const popupTimeoutRef = useRef<number | null>(null)
  const [wiped, setWiped] = useState(false)
  const [authRequested, setAuthRequested] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loginUser, setLoginUser] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginStage, setLoginStage] = useState<'username' | 'password'>('username')
  const [loginError, setLoginError] = useState('')
  const loginUserRef = useRef<HTMLInputElement | null>(null)
  const createUserNameRef = useRef<HTMLInputElement | null>(null)
  const createUserPasswordRef = useRef<HTMLInputElement | null>(null)
  const editUserNameRef = useRef<HTMLInputElement | null>(null)
  const editUserPasswordRef = useRef<HTMLInputElement | null>(null)

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = window.sessionStorage.getItem('modoAdmUsers')
      const rawUsers = stored ? JSON.parse(stored) : null
      if (Array.isArray(rawUsers)) {
        return rawUsers.map((user: any) => ({
          id: user.id,
          // sessões antigas guardaram os nomes de demonstração anteriores ("User 1…"); atualiza se não foram editados
          name: LEGACY_DEMO_USER_NAMES[user.id] === user.name ? DEMO_USER_NAMES[user.id] : user.name,
          password: user.id === 'master' ? DEFAULT_PASSWORD : user.password,
          role: user.role || 'Usuário',
          menuAccess: user.menuAccess ? { ...DEFAULT_MENU_ACCESS, ...user.menuAccess } : { ...DEFAULT_MENU_ACCESS },
          modoProvaAccess: user.modoProvaAccess ? { ...DEFAULT_MODO_PROVA_ACCESS, ...user.modoProvaAccess } : { ...DEFAULT_MODO_PROVA_ACCESS },
          modoSalaAccess: user.modoSalaAccess ? { ...DEFAULT_MODO_SALA_ACCESS, ...user.modoSalaAccess } : { ...DEFAULT_MODO_SALA_ACCESS },
          createdByAdminId: user.createdByAdminId || 'master'
        }))
      }
      return [
        {
          id: 'master',
          name: 'Tecassistiva',
          password: DEFAULT_PASSWORD,
          role: 'Suporte',
          menuAccess: { ...DEFAULT_MENU_ACCESS },
          modoProvaAccess: { ...DEFAULT_MODO_PROVA_ACCESS },
          modoSalaAccess: { ...DEFAULT_MODO_SALA_ACCESS },
          createdByAdminId: 'master'
        },
        {
          id: 'user_1',
          name: 'João',
          password: DEFAULT_PASSWORD,
          role: 'Usuário',
          menuAccess: { ...DEFAULT_MENU_ACCESS },
          modoProvaAccess: { ...DEFAULT_MODO_PROVA_ACCESS },
          modoSalaAccess: { ...DEFAULT_MODO_SALA_ACCESS },
          createdByAdminId: 'master'
        },
        {
          id: 'user_2',
          name: 'Bruno',
          password: DEFAULT_PASSWORD,
          role: 'Usuário',
          menuAccess: { ...DEFAULT_MENU_ACCESS },
          modoProvaAccess: { ...DEFAULT_MODO_PROVA_ACCESS },
          modoSalaAccess: { ...DEFAULT_MODO_SALA_ACCESS },
          createdByAdminId: 'master'
        },
        {
          id: 'user_3',
          name: 'Luic',
          password: DEFAULT_PASSWORD,
          role: 'Usuário',
          menuAccess: { ...DEFAULT_MENU_ACCESS },
          modoProvaAccess: { ...DEFAULT_MODO_PROVA_ACCESS },
          modoSalaAccess: { ...DEFAULT_MODO_SALA_ACCESS },
          createdByAdminId: 'master'
        }
      ]
    } catch {
      return [
        {
          id: 'master',
          name: 'Tecassistiva',
          password: DEFAULT_PASSWORD,
          role: 'Suporte',
          menuAccess: { ...DEFAULT_MENU_ACCESS },
          createdByAdminId: 'master'
        },
        {
          id: 'user_1',
          name: 'João',
          password: DEFAULT_PASSWORD,
          role: 'Usuário',
          menuAccess: { ...DEFAULT_MENU_ACCESS },
          createdByAdminId: 'master'
        },
        {
          id: 'user_2',
          name: 'Bruno',
          password: DEFAULT_PASSWORD,
          role: 'Usuário',
          menuAccess: { ...DEFAULT_MENU_ACCESS },
          createdByAdminId: 'master'
        },
        {
          id: 'user_3',
          name: 'Luic',
          password: DEFAULT_PASSWORD,
          role: 'Usuário',
          menuAccess: { ...DEFAULT_MENU_ACCESS },
          createdByAdminId: 'master'
        }
      ]
    }
  })

  useEffect(() => {
    try {
      window.sessionStorage.setItem('modoAdmUsers', JSON.stringify(users))
    } catch { }
  }, [users])

  const [newUserName, setNewUserName] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState('Usuário')
  const [newUserWifi, setNewUserWifi] = useState<'Ativado' | 'Desligado'>('Ativado')
  const [newUserBluetooth, setNewUserBluetooth] = useState<'Ativado' | 'Desligado'>('Desligado')
  const [newUserModoProvaWifi, setNewUserModoProvaWifi] = useState<'Ativado' | 'Desligado'>('Desligado')
  const [newUserModoProvaBt, setNewUserModoProvaBt] = useState<'Ativado' | 'Desligado'>('Desligado')
  const [newUserMenuAccess, setNewUserMenuAccess] = useState<Record<string, boolean>>({ ...DEFAULT_MENU_ACCESS })
  const [newUserModoProvaAccess, setNewUserModoProvaAccess] = useState<Record<string, boolean>>({ ...DEFAULT_MODO_PROVA_ACCESS })
  const [newUserModoSalaAccess, setNewUserModoSalaAccess] = useState<Record<string, boolean>>({ ...DEFAULT_MODO_SALA_ACCESS })
  const [newUserTab, setNewUserTab] = useState<'standard' | 'modoProva' | 'modoSala'>('standard')
  const [selectedCustomUserId, setSelectedCustomUserId] = useState<string | null>(null)

  // Configurações do sistema atreladas ao perfil selecionado (acessibilidade) ou ao usuário (Personalizado)
  const [profileSettings, setProfileSettings] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const stored = window.sessionStorage.getItem('modoAdmProfileSettings')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      window.sessionStorage.setItem('modoAdmProfileSettings', JSON.stringify(profileSettings))
    } catch { }
  }, [profileSettings])

  const settingsScope = activeProfile === 'custom' ? `user:${selectedCustomUserId ?? 'none'}` : activeProfile
  const settingsValues = resolveSettings(activeProfile, profileSettings[settingsScope])
  const applySettingsChanges = (changes: Record<string, string>) => {
    setProfileSettings(prev => ({ ...prev, [settingsScope]: { ...(prev[settingsScope] ?? {}), ...changes } }))
  }
  const setSetting = (key: string, value: string) => applySettingsChanges(settingChanges(key, value))
  const resetPreset = () => {
    setProfileSettings(prev => {
      const current = { ...(prev[settingsScope] ?? {}) }
      PRESET_KEYS.forEach(key => delete current[key])
      return { ...prev, [settingsScope]: current }
    })
    setPopupMessage('Preset do perfil restaurado.')
  }
  const [settingsTextInput, setSettingsTextInput] = useState('')
  const [btSearching, setBtSearching] = useState(false)
  const btTimerRef = useRef<number | null>(null)

  // Árvore de Configurações Gerais: o que está aberto vale para o painel e para a barra lateral
  const [settingsOpen, setSettingsOpen] = useState<Record<string, boolean>>({})
  const [settingsHighlightId, setSettingsHighlightId] = useState<string | null>(null)
  const highlightTimerRef = useRef<number | null>(null)

  const toggleSettingsNode = (id: string) => setSettingsOpen(prev => ({ ...prev, [id]: !prev[id] }))
  const setAllSettingsOpen = (value: boolean) => {
    const next: Record<string, boolean> = {}
    SETTINGS_CONTAINER_IDS.forEach(id => { next[id] = value })
    setSettingsOpen(next)
  }
  const goToSetting = (id: string) => {
    const ancestors = findSettingsAncestors(id)
    setSettingsOpen(prev => {
      const next = { ...prev }
      ancestors.forEach(a => { next[a] = true })
      if (SETTINGS_CONTAINER_IDS.includes(id)) next[id] = true
      return next
    })
    setActiveNavSection('settings')
    window.setTimeout(() => {
      document.getElementById(`cfg-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setSettingsHighlightId(id)
      if (highlightTimerRef.current) window.clearTimeout(highlightTimerRef.current)
      highlightTimerRef.current = window.setTimeout(() => setSettingsHighlightId(null), 1800)
    }, 80)
  }
  const deviceColors = parseColorCombo(settingsValues.combinacaoCores)
  const deviceColorStyle = { '--dev-fg': deviceColors.fg, '--dev-bg': deviceColors.bg } as React.CSSProperties
  const [editUserId, setEditUserId] = useState<string>(users[0]?.id ?? '')
  const [editName, setEditName] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editCurrentPassword, setEditCurrentPassword] = useState('')
  const [editRole, setEditRole] = useState('Usuário')
  const [editUserMenuAccess, setEditUserMenuAccess] = useState<Record<string, boolean>>({ ...DEFAULT_MENU_ACCESS })
  const [editUserModoProvaAccess, setEditUserModoProvaAccess] = useState<Record<string, boolean>>({ ...DEFAULT_MODO_PROVA_ACCESS })
  const [editUserModoSalaAccess, setEditUserModoSalaAccess] = useState<Record<string, boolean>>({ ...DEFAULT_MODO_SALA_ACCESS })
  const [editUserTab, setEditUserTab] = useState<'standard' | 'modoProva' | 'modoSala'>('standard')
  const [customUserConfigTab, setCustomUserConfigTab] = useState<'standard' | 'modoProva' | 'modoSala'>('standard')
  const [deleteUserId, setDeleteUserId] = useState<string>(users[0]?.id ?? '')
  const [resetUserId, setResetUserId] = useState<string>(users[0]?.id ?? '')
  const [logoutPasswordInput, setLogoutPasswordInput] = useState('')

  // Estados para Mudar Senha Administrativa
  const [currentAdminPasswordInput, setCurrentAdminPasswordInput] = useState('')
  const [newAdminPasswordInput, setNewAdminPasswordInput] = useState('')
  const [confirmAdminPasswordInput, setConfirmAdminPasswordInput] = useState('')
  const [showCurrentAdminPassword, setShowCurrentAdminPassword] = useState(false)
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false)
  const [showConfirmAdminPassword, setShowConfirmAdminPassword] = useState(false)
  const [showEditUserPassword, setShowEditUserPassword] = useState(false)
  const [adminPasswordMsg, setAdminPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null)

  // Estado para Confirmação de Redefinir Padrões de Fábrica
  const [showFactoryResetModal, setShowFactoryResetModal] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)

  // Estado para Modal Dedicado de Criação de Usuário
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [showNewUserPassword, setShowNewUserPassword] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const profileFileInputRef = useRef<HTMLInputElement | null>(null)

  const [modoProvaAccess, setModoProvaAccess] = useState<Record<string, boolean>>(() => {
    try {
      const stored = window.sessionStorage.getItem('modoProvaAccess')
      return stored ? JSON.parse(stored) : { ...DEFAULT_MODO_PROVA_ACCESS }
    } catch {
      return { ...DEFAULT_MODO_PROVA_ACCESS }
    }
  })

  const [modoSalaAccess, setModoSalaAccess] = useState<Record<string, boolean>>(() => {
    try {
      const stored = window.sessionStorage.getItem('modoSalaAccess')
      return stored ? JSON.parse(stored) : { ...DEFAULT_MODO_SALA_ACCESS }
    } catch {
      return { ...DEFAULT_MODO_SALA_ACCESS }
    }
  })

  const current = stack[stack.length - 1]
  const currentUser = authenticated ? users.find(user => user.id === currentUserId) ?? null : null
  const visibleUsers = users.filter(u => {
    if (currentUser?.role === 'Suporte') {
      return u.role !== 'Suporte' || u.id !== 'master'
    }
    if (currentUser) {
      return u.createdByAdminId === currentUser.id
    }
    return (u.createdByAdminId === 'master' || !u.createdByAdminId) && u.role !== 'Suporte'
  })
  const level = getLevel(current.id)
  const headerText = (() => {
    if (current.id === 'editUser') {
      const selectedUser = users.find(u => u.id === editUserId)
      return `.editar usuario: ${selectedUser?.name ?? ''}`
    }
    return level.header
  })()
  const dynamicOptions: Option[] = (() => {
    const settingsDynamic = getDynamicSettingsOptions(current.id, settingsValues, {
      btSearching,
      activeProfileId: activeProfile,
      activeUserId: activeProfile === 'custom' ? selectedCustomUserId : null,
      users: visibleUsers.map(u => ({ id: u.id, name: u.name }))
    })
    if (settingsDynamic) return settingsDynamic

    if (current.id === 'createUserRole' || current.id === 'editUserRole') {
      const roles = currentUser?.role === 'Suporte'
        ? ROLE_OPTIONS
        : ROLE_OPTIONS.filter(r => r !== 'Suporte')
      return roles.map(role => ({
        id: `${current.id}_${role}`,
        label: role,
        type: 'action' as const
      }))
    }

    if (current.id === 'users' && currentUser?.role === 'Usuário') {
      return level.options.filter(opt => opt.id !== 'createUser' && opt.id !== 'editUser')
    }

    if (current.id === 'settings') {
      if (currentUser?.role === 'Usuário') {
        return [{ id: 'logoutEntry', label: 'Deslogar', type: 'action' }]
      }
      const modoAdmEntry: Option = { id: 'modoAdmEntry', label: 'Modo ADM', type: 'submenu', submenuId: 'main' }
      const base = level.options.filter(opt => opt.id !== 'modoAdmEntry')
      const withModoAdm = [...base, modoAdmEntry]
      if (currentUser) {
        return [...withModoAdm, { id: 'logoutEntry', label: 'Deslogar', type: 'action' }]
      }
      return withModoAdm
    }

    if (['createUserMenus', 'editUserMenus', 'modoProvaMenus', 'modoSalaMenus'].includes(current.id)) {
      let access: Record<string, boolean>
      if (current.id === 'createUserMenus') access = newUserMenuAccess
      else if (current.id === 'editUserMenus') access = editUserMenuAccess
      else if (current.id === 'modoProvaMenus') access = modoProvaAccess
      else access = modoSalaAccess

      let filteredItemIds = ROOT_MENU_ITEM_IDS.filter(id => id !== 'modoProvaRoot' && id !== 'modoSalaRoot')

      if (['createUserMenus', 'editUserMenus'].includes(current.id)) {
        filteredItemIds = filteredItemIds.filter(id => id !== 'settingsEntry')
      }

      const list = filteredItemIds.map(menuId => ({
        id: `${current.id}_${menuId}`,
        label: `${getRootOptionLabel(menuId)}: ${access[menuId] ? 'Ativado' : 'Desativado'}`,
        type: 'action' as const
      }))
      const finalOptions = [...list, { id: `${current.id}_confirm`, label: 'Concluir', type: 'action' as const }]
      if (['createUserMenus', 'editUserMenus'].includes(current.id)) {
        return [{ id: 'header_apps', label: 'Configurar Apps Ativos:', type: 'action' as const }, ...finalOptions]
      }
      return finalOptions
    }

    if (current.id === 'editUserSelect') {
      return visibleUsers.map(user => ({ id: `editUser_${user.id}`, label: user.name, type: 'action' }))
    }

    if (current.id === 'listUsers') {
      return visibleUsers.map(user => ({ id: `listUser_${user.id}`, label: user.name, type: 'action' }))
    }

    if (current.id === 'deleteUserSelect') {
      return visibleUsers.map(user => ({ id: `deleteUser_${user.id}`, label: user.name, type: 'action' }))
    }

    if (current.id === 'deleteUserConfirm') {
      return [
        { id: 'dec_msg', label: 'Confirma exclusão...', type: 'action' },
        { id: 'dec_cancel', label: 'Cancelar', type: 'action' },
        { id: 'dec_delete', label: 'Excluir', type: 'action' }
      ]
    }

    if (current.id === 'resetPasswordSelect') {
      return visibleUsers.map(user => ({ id: `resetPassword_${user.id}`, label: user.name, type: 'action' }))
    }

    return []
  })()
  const rootOptions = getLevel('root').options.filter(opt => {
    if (!currentUser) return true
    if (currentUser.role === 'Suporte' || currentUser.role === 'Administrativo') {
      return true
    }

    // For Usuário role:
    // 1. Never show mode control shortcuts
    if (['modoProvaRoot', 'modoSalaRoot'].includes(opt.id)) {
      return false
    }

    // 2. If global Modo Prova is active, only show exam apps for the active profile
    if (choicesState.modoProva === 'Ativado') {
      const profileProvaApps = profileModoProva[activeProfile]?.apps ?? DEFAULT_PROFILE_MODO_PROVA[activeProfile]?.apps ?? DEFAULT_MODO_PROVA_ACCESS
      return profileProvaApps[opt.id] ?? false
    }

    // 3. If global Modo Sala de Aula is active, show only classroom apps for the active profile
    if (choicesState.modoSala === 'Ativado') {
      const profileSalaApps = profileModoSala[activeProfile]?.apps ?? DEFAULT_PROFILE_MODO_SALA[activeProfile]?.apps ?? DEFAULT_MODO_SALA_ACCESS
      return profileSalaApps[opt.id] ?? false
    }

    // Always show settings for all users outside of Prova/Sala modes
    if (opt.id === 'settingsEntry') {
      return true
    }

    // 4. Otherwise (Padrão mode), show apps based on user's manual app settings
    return currentUser.menuAccess[opt.id] ?? false
  })
  const options = dynamicOptions.length > 0 ? dynamicOptions : (current.id === 'root' ? rootOptions : level.options)
  const navRef = useRef<HTMLElement | null>(null)
  const activeOptionRef = useRef<HTMLDivElement | null>(null)


  useEffect(() => {
    if (options.length > 0 && current.index >= options.length) {
      setStack(prev => {
        const copy = [...prev]
        const top = { ...copy[copy.length - 1], index: 0 }
        copy[copy.length - 1] = top
        return copy
      })
    }
  }, [options.length, current.index])

  function getChoiceValue(key: string) {
    return SETTINGS_KEYS.has(key) ? settingsValues[key] : choicesState[key]
  }

  useEffect(() => {
    if (activeOptionRef.current) {
      activeOptionRef.current.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }, [current.id, current.index])

  useEffect(() => {
    if (authRequested && loginUserRef.current) {
      loginUserRef.current.focus()
    }
  }, [authRequested, loginStage])

  useEffect(() => {
    if (popupMessage) {
      if (popupTimeoutRef.current) {
        window.clearTimeout(popupTimeoutRef.current)
      }
      popupTimeoutRef.current = window.setTimeout(() => {
        setPopupMessage('')
        popupTimeoutRef.current = null
      }, 5000)
      return () => {
        if (popupTimeoutRef.current) {
          window.clearTimeout(popupTimeoutRef.current)
        }
      }
    }
  }, [popupMessage])

  useEffect(() => {
    if (current.id === 'createUserName' && createUserNameRef.current) {
      createUserNameRef.current.focus()
    }
    if (current.id === 'createUserPassword' && createUserPasswordRef.current) {
      createUserPasswordRef.current.focus()
    }
    if (current.id === 'editUserName' && editUserNameRef.current) {
      editUserNameRef.current.focus()
    }
    if (current.id === 'editUserPassword' && editUserPasswordRef.current) {
      editUserPasswordRef.current.focus()
    }
  }, [current.id])

  useEffect(() => {
    try {
      window.sessionStorage.setItem('modoAdmUsers', JSON.stringify(users))
    } catch {
      // ignore storage errors
    }
  }, [users])

  useEffect(() => {
    try {
      window.sessionStorage.setItem('modoProvaAccess', JSON.stringify(modoProvaAccess))
    } catch { }
  }, [modoProvaAccess])

  useEffect(() => {
    try {
      window.sessionStorage.setItem('modoSalaAccess', JSON.stringify(modoSalaAccess))
    } catch { }
  }, [modoSalaAccess])

  const handleSettingsOption = (opt: Option) => {
    const popBack = () => setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev))

    if (opt.id === SETTINGS_BACK_ID) {
      popBack()
      return
    }
    if (opt.id === SETTINGS_NOOP_ID) return

    if (opt.id.startsWith(SETTINGS_PLACEHOLDER_PREFIX)) {
      setPopupMessage('Ainda sem opções definidas.')
      return
    }

    if (opt.id.startsWith(SETTINGS_STATUS_PREFIX)) {
      const status = findSettingsStatus(opt.id.slice(SETTINGS_STATUS_PREFIX.length))
      if (status) setPopupMessage(status.text)
      return
    }
    if (opt.id.startsWith(SETTINGS_ACTION_PREFIX)) {
      const action = findSettingsAction(opt.id.slice(SETTINGS_ACTION_PREFIX.length))
      if (action) setPopupMessage(action.message)
      return
    }
    if (opt.id.startsWith(SETTINGS_CONFIRM_PREFIX)) {
      // Modo demonstrativo: apenas confirma, nada acontece
      popBack()
      return
    }
    if (opt.id.startsWith(SETTINGS_TEXT_PREFIX)) {
      const key = opt.id.slice(SETTINGS_TEXT_PREFIX.length)
      setSettingsTextInput(settingsValues[key] ?? '')
      moveToScreen(`cfgt_${key}`)
      return
    }
    if (opt.id.startsWith(SETTINGS_SET_PREFIX)) {
      const [key, value] = opt.id.slice(SETTINGS_SET_PREFIX.length).split('|')
      setSetting(key, value)
      if (key === 'wifi') setPopupMessage(value === 'Ligado' ? 'Wi-Fi ligado.' : 'Wi-Fi desligado.')
      return
    }
    if (opt.id.startsWith(SETTINGS_CONN_PREFIX)) {
      const [kind, action, arg] = opt.id.slice(SETTINGS_CONN_PREFIX.length).split('|')
      if (kind === 'bluetooth' && action === 'scan') {
        if (settingsValues.bluetooth !== 'Sim') {
          setPopupMessage('Bluetooth desligado. Ligue-o primeiro.')
          return
        }
        setBtSearching(true)
        if (btTimerRef.current) window.clearTimeout(btTimerRef.current)
        btTimerRef.current = window.setTimeout(() => setBtSearching(false), 1500)
        moveToScreen('cfgd_btScan')
        return
      }
      const result = runConnectionAction(kind as 'wifi' | 'bluetooth', action as ConnectionAction, arg ?? '', settingsValues)
      applySettingsChanges(result.changes)
      setPopupMessage(result.message)
    }
  }

  // Navegação por mouse no menu do dispositivo: passar o mouse seleciona, clicar abre, "Voltar" equivale ao Esc
  const selectOptionById = (id: string) => {
    const idx = options.findIndex(o => o.id === id)
    if (idx < 0 || idx === current.index) return
    setStack(prev => {
      const copy = [...prev]
      copy[copy.length - 1] = { ...copy[copy.length - 1], index: idx }
      return copy
    })
  }

  const goBackDevice = () => {
    setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev))
    setWiped(false)
  }

  const executeOption = (opt: Option | undefined) => {
    if (current.id === 'createUserConfirm' && opt?.id === 'cc_confirm') {
      createUser()
      return
    }

    if (current.id === 'createUserRole' && opt) {
      setNewUserRole(opt.label)
      moveToScreen('createUserMenus')
      return
    }

    if (current.id === 'createUserMenus' && opt) {
      if (opt.id === 'header_apps') return
      if (opt.id === 'createUserMenus_confirm') {
        moveToScreen('createUserConfirm')
        return
      }
      const menuId = opt.id.replace('createUserMenus_', '')
      setNewUserMenuAccess(prev => ({ ...prev, [menuId]: !prev[menuId] }))
      return
    }

    if (current.id === 'editUserRole' && opt) {
      saveEditedRole(opt.label)
      return
    }

    if (current.id === 'editUserMenus' && opt) {
      if (opt.id === 'header_apps') return
      if (opt.id === 'editUserMenus_confirm') {
        saveEditedMenus(editUserMenuAccess)
        return
      }
      const menuId = opt.id.replace('editUserMenus_', '')
      setEditUserMenuAccess(prev => ({ ...prev, [menuId]: !prev[menuId] }))
      return
    }

    if (current.id === 'modoProvaMenus' && opt) {
      if (opt.id === 'modoProvaMenus_confirm') {
        setStack(prev => prev.slice(0, -1))
        return
      }
      const menuId = opt.id.replace('modoProvaMenus_', '')
      setModoProvaAccess(prev => ({ ...prev, [menuId]: !prev[menuId] }))
      return
    }

    if (current.id === 'modoSalaMenus' && opt) {
      if (opt.id === 'modoSalaMenus_confirm') {
        setStack(prev => prev.slice(0, -1))
        return
      }
      const menuId = opt.id.replace('modoSalaMenus_', '')
      setModoSalaAccess(prev => ({ ...prev, [menuId]: !prev[menuId] }))
      return
    }

    if (current.id === 'editUserSelect' && opt) {
      const selected = users.find(user => user.id === opt.id.replace('editUser_', ''))
      if (selected) {
        setEditUserId(selected.id)
        setEditName(selected.name)
        setEditPassword('')
        setEditRole(selected.role)
        setEditUserMenuAccess({ ...selected.menuAccess })
        moveToScreen('editUser')
      }
      return
    }

    if (current.id === 'deleteUserSelect' && opt) {
      const selected = users.find(user => user.id === opt.id.replace('deleteUser_', ''))
      if (selected) {
        setDeleteUserId(selected.id)
        moveToScreen('deleteUserConfirm')
      }
      return
    }

    if (current.id === 'deleteUserConfirm' && opt) {
      if (opt.id === 'dec_msg') return
      if (opt.id === 'dec_delete') {
        deleteUser()
      } else if (opt.id === 'dec_cancel') {
        setStack(prev => prev.slice(0, -1))
      }
      return
    }

    if (current.id === 'resetPasswordSelect' && opt) {
      const selected = users.find(user => user.id === opt.id.replace('resetPassword_', ''))
      if (selected) {
        setResetUserId(selected.id)
        moveToScreen('resetPasswordConfirm')
      }
      return
    }

    if (!opt) {
      if (current.id === 'reset') {
        setWiped(true)
      }
      if (current.id === 'resetPasswordConfirm') {
        resetPassword()
      }
      return
    }

    if (current.id === 'resetPasswordConfirm') {
      resetPassword()
      return
    }

    if (current.id === 'editUser' && opt) {
      if (opt.id === 'eu_password') {
        if (currentUser?.role === 'Suporte') {
          moveToScreen('editUserPassword')
        } else {
          setEditCurrentPassword('')
          moveToScreen('editUserCurrentPassword')
        }
        return
      }
    }

    if (opt.id.startsWith('cfg_')) {
      handleSettingsOption(opt)
      return
    }

    if (opt.id === 'toggleVisualMode') {
      setIsVisualMode(true)
      return
    }

    if (opt.id === 'logoutEntry') {
      setLogoutPasswordInput('')
      moveToScreen('logoutPassword')
      return
    }

    if (opt.id === 'modoAdmEntry') {
      if (!authenticated) {
        setAuthRequested(true)
        setLoginStage('username')
        setLoginUser('')
        setLoginPassword('')
        setLoginError('')
        return
      }
      setStack(prev => [...prev, { id: opt.submenuId!, index: 0 }])
      setIsVisualMode(true)
      setMessage('')
    } else if (opt.type === 'submenu' && opt.submenuId) {
      if (opt.submenuId === 'editUser' || opt.submenuId === 'deleteUser' || opt.submenuId === 'resetPassword') {
        const firstUser = visibleUsers[0]?.id
        if (firstUser) {
          setEditUserId(firstUser)
          setDeleteUserId(firstUser)
          setResetUserId(firstUser)
          const selected = visibleUsers.find(u => u.id === firstUser)
          setEditName(selected?.name ?? '')
          setEditPassword('')
          setEditRole(selected?.role ?? 'Usuário')
        }
      }

      if (opt.submenuId === 'createUser') {
        setNewUserName('')
        setNewUserPassword('')
        setNewUserRole('Usuário')
        setNewUserMenuAccess({ ...DEFAULT_MENU_ACCESS })
      }
      setStack(prev => [...prev, { id: opt.submenuId!, index: 0 }])
      setMessage('')
    } else if (opt.type === 'action' && opt.choiceKey) {
      if (SETTINGS_KEYS.has(opt.choiceKey)) {
        setSetting(opt.choiceKey, opt.label)
      } else {
        setChoicesState(prev => ({ ...prev, [opt.choiceKey!]: opt.label }))
      }
      const choiceNames: Record<string, string> = {
        nivel: 'Nível',
        guiaSensorial: 'Guia Sensorial',
        modoProva: 'Modo Prova',
        modoSala: 'Modo Sala de Aula',
        wifi: 'WiFi',
        bluetooth: 'Bluetooth',
        modoProvaWifi: 'WiFi (Modo Prova)',
        modoProvaBt: 'Bluetooth (Modo Prova)',
        modoSalaWifi: 'WiFi (Modo Sala)',
        modoSalaBt: 'Bluetooth (Modo Sala)',
        ...getSettingsChoiceLabels()
      }
      setPopupMessage(`${choiceNames[opt.choiceKey!] || opt.choiceKey} alterado para ${opt.label}`)
      setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev))
    } else if (opt.type === 'modal' && opt.submenuId) {
      setStack(prev => [...prev, { id: opt.submenuId!, index: 0 }])
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const { key } = e

      if (showExitModal) return

      if (e.repeat && key === 'Enter') return

      if (!['ArrowDown', 'ArrowUp', 'Enter', 'Backspace', 'Escape'].includes(key)) {
        return
      }

      const isEditingField = document.activeElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)
      if (!isEditingField && key !== 'Backspace') {
        e.preventDefault()
      }

      if (popupMessage && (key === 'Enter' || key === 'Escape')) {
        setPopupMessage('')
        return
      }

      if (isEditingField) {
        if (key === 'Escape') {
          // Escape still backs out from focused form fields
        } else if (current.id === 'listUsersSearch' && (key === 'ArrowDown' || key === 'ArrowUp')) {
          // Allow arrow navigation through search results while the search input is focused
        } else if (key === 'Backspace') {
          return
        } else {
          return
        }
      }

      if (key === 'ArrowDown') {
        setStack(prev => {
          const copy = [...prev]
          const top = { ...copy[copy.length - 1] }
          if (options.length === 0) return prev
          top.index = (top.index + 1) % options.length
          copy[copy.length - 1] = top
          return copy
        })
      }

      if (key === 'ArrowUp') {
        setStack(prev => {
          const copy = [...prev]
          const top = { ...copy[copy.length - 1] }
          if (options.length === 0) return prev
          top.index = (top.index - 1 + options.length) % options.length
          copy[copy.length - 1] = top
          return copy
        })
      }

      if (key === 'Enter') {
        executeOption(options[current.index])
      }

      if (key === 'Escape') {
        if (authRequested) {
          if (loginStage === 'password') backToLoginUsername()
          else cancelLogin()
          return
        }
        setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev))
        setWiped(false)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    stack, options, users, popupMessage, authRequested, loginStage,
    wiped, authenticated, deleteUserId, resetUserId,
    modoProvaAccess, modoSalaAccess, newUserMenuAccess, editUserMenuAccess,
    profileSettings, settingsScope, showExitModal
  ])

  const moveToScreen = (targetId: string) => {
    if (current.id === targetId) return
    setStack(prev => [...prev, { id: targetId, index: 0 }])
    setMessage('')
  }

  const handleScreenEnter = () => {
    if (current.id.startsWith('cfgt_')) {
      const key = current.id.slice('cfgt_'.length)
      const textItem = findTextSetting(key)
      const value = settingsTextInput.trim()
      if (textItem?.validate === 'ipv4' && !isValidIpv4(value)) {
        setMessage('Endereço IP inválido.')
        return
      }
      applySettingsChanges({ [key]: value })
      setPopupMessage(`Salvo: ${textItem?.label ?? 'campo'}.`)
      setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev))
      return
    }

    if (current.id === 'logoutPassword') {
      if (logoutPasswordInput !== currentUser?.password) {
        setMessage('Senha incorreta.')
        return
      }
      setAuthenticated(false)
      setCurrentUserId(null)
      setStack([{ id: 'root', index: 0 }])
      setPopupMessage('Deslogado com sucesso.')
      return
    }

    if (current.id === 'createUserName') {
      if (!newUserName.trim()) {
        setMessage('Digite o nome antes de continuar.')
        return
      }
      moveToScreen('createUserPassword')
      return
    }

    if (current.id === 'createUserPassword') {
      if (!newUserPassword) {
        setMessage('Digite a senha antes de continuar.')
        return
      }
      moveToScreen('createUserRole')
      return
    }

    if (current.id === 'editUserName') {
      if (!editName.trim()) {
        setMessage('Digite o nome antes de continuar.')
        return
      }
      saveEditedName(editName)
      return
    }

    if (current.id === 'editUserCurrentPassword') {
      const selectedUser = users.find(u => u.id === editUserId)
      if (editCurrentPassword !== selectedUser?.password) {
        setMessage('Senha atual incorreta.')
        return
      }
      moveToScreen('editUserPassword')
      return
    }

    if (current.id === 'editUserPassword') {
      if (!editPassword) {
        setMessage('Digite a nova senha antes de continuar.')
        return
      }
      saveEditedPassword(editPassword)
      return
    }

    if (current.id === 'deleteUserSelect') {
      moveToScreen('deleteUserConfirm')
      return
    }

    if (current.id === 'resetPasswordSelect') {
      moveToScreen('resetPasswordConfirm')
      return
    }
  }

  const cancelLogin = () => {
    setAuthRequested(false)
    setLoginUser('')
    setLoginPassword('')
    setLoginError('')
    setLoginStage('username')
  }

  const backToLoginUsername = () => {
    setLoginStage('username')
    setLoginPassword('')
    setLoginError('')
  }

  const handleLogin = () => {
    if (loginStage === 'username') {
      if (!loginUser.trim()) {
        setLoginError('Digite o usuário')
        return
      }
      setLoginStage('password')
      setLoginError('')
      return
    }

    const foundUser = users.find(user => user.name.toLowerCase() === loginUser.trim().toLowerCase())
    if (foundUser && foundUser.password === loginPassword) {
      setAuthenticated(true)
      setCurrentUserId(foundUser.id)
      setAuthRequested(false)
      setLoginError('')
      setLoginPassword('')
      setLoginUser('')
      setLoginStage('username')
      if (foundUser.role === 'Suporte' || foundUser.role === 'Administrativo') {
        setStack(prev => [...prev, { id: 'main', index: 0 }])
        setIsVisualMode(true)
        setPopupMessage(`Acesso ADM concedido para ${foundUser.name}.`)
      } else {
        setPopupMessage(`Usuário ${foundUser.name} autenticado.`)
      }
      return
    }

    setLoginError('Usuário ou senha incorretos.')
  }

  const redirectToUsersMenu = () => {
    setStack(prev => {
      const idx = prev.findIndex(item => item.id === 'users')
      if (idx !== -1) return prev.slice(0, idx + 1)
      return prev.length > 1 ? prev.slice(0, -1) : prev
    })
  }

  const createUser = () => {
    const name = newUserName.trim()
    if (!name) {
      setMessage('Informe nome e senha para criar.')
      return
    }
    if (!newUserPassword) {
      setMessage('Informe uma senha válida.')
      return
    }
    if (users.some(user => user.name.toLowerCase() === name.toLowerCase())) {
      setMessage('Já existe usuário com esse nome.')
      return
    }
    const activeAdminId = currentUser?.id || 'master'
    const nextUser: User = {
      id: `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      name,
      password: newUserPassword,
      role: newUserRole || 'Usuário',
      menuAccess: { ...newUserMenuAccess },
      createdByAdminId: activeAdminId
    }
    setUsers(prev => [...prev, nextUser])
    setPopupMessage(`Usuário ${name} criado.`)
    setMessage('')
    setNewUserName('')
    setNewUserPassword('')
    setNewUserRole('Usuário')
    redirectToUsersMenu()
  }

  const redirectToEditUserMenu = () => {
    setStack(prev => {
      const idx = prev.findIndex(item => item.id === 'editUser')
      if (idx !== -1) return prev.slice(0, idx + 1)
      return prev.length > 1 ? prev.slice(0, -1) : prev
    })
  }

  const saveEditedName = (newName: string) => {
    const selected = users.find(user => user.id === editUserId)
    if (!selected) {
      setMessage('Selecione um usuário para editar.')
      return
    }
    const name = newName.trim()
    if (!name) {
      setMessage('Nome não pode ficar vazio.')
      return
    }
    setUsers(prev => prev.map(user => {
      if (user.id !== editUserId) return user
      return {
        ...user,
        name
      }
    }))
    setPopupMessage(`Usuário ${name} atualizado.`)
    redirectToEditUserMenu()
  }

  const saveEditedPassword = (newPass: string) => {
    const selected = users.find(user => user.id === editUserId)
    if (!selected) {
      setMessage('Selecione um usuário para editar.')
      return
    }
    const pass = newPass.trim()
    if (!pass) {
      setMessage('Senha não pode ficar vazia.')
      return
    }
    setUsers(prev => prev.map(user => {
      if (user.id !== editUserId) return user
      return {
        ...user,
        password: pass
      }
    }))
    setPopupMessage(`Senha atualizada com sucesso.`)
    setEditPassword('')
    redirectToEditUserMenu()
  }

  const saveEditedRole = (newRole: string) => {
    const selected = users.find(user => user.id === editUserId)
    if (!selected) {
      setMessage('Selecione um usuário para editar.')
      return
    }
    setUsers(prev => prev.map(user => {
      if (user.id !== editUserId) return user
      return {
        ...user,
        role: newRole
      }
    }))
    setPopupMessage(`Perfil de ${selected.name} atualizado.`)
    redirectToEditUserMenu()
  }



  const saveEditedMenus = (newAccess: Record<string, boolean>) => {
    const selected = users.find(user => user.id === editUserId)
    if (!selected) {
      setMessage('Selecione um usuário para editar.')
      return
    }
    setUsers(prev => prev.map(user => {
      if (user.id !== editUserId) return user
      return {
        ...user,
        menuAccess: { ...newAccess }
      }
    }))
    setPopupMessage(`Aplicativos de ${selected.name} atualizados.`)
    redirectToEditUserMenu()
  }
  const deleteUser = () => {
    const selected = users.find(user => user.id === deleteUserId)
    if (!selected) {
      setMessage('Selecione um usuário para deletar.')
      return
    }
    if (selected.id === 'master') {
      setMessage('Usuário suporte não pode ser deletado.')
      return
    }
    if (users.length <= 1) {
      setMessage('Deve haver ao menos um usuário.')
      return
    }
    setUsers(prev => prev.filter(user => user.id !== deleteUserId))
    setPopupMessage(`Usuário ${selected.name} excluído.`)
    const remainingVisibleUsers = visibleUsers.filter(user => user.id !== deleteUserId)
    const nextUser = remainingVisibleUsers[0]
    if (nextUser) {
      setDeleteUserId(nextUser.id)
      setResetUserId(nextUser.id)
      setEditUserId(nextUser.id)
      setEditName(nextUser.name)
      setEditRole(nextUser.role)
    }
    redirectToUsersMenu()
  }

  const resetPassword = () => {
    const selected = users.find(user => user.id === resetUserId)
    if (!selected) {
      setMessage('Selecione um usuário para redefinir.')
      return
    }
    setUsers(prev => prev.map(user => user.id === resetUserId ? { ...user, password: DEFAULT_PASSWORD } : user))
    setPopupMessage(`Senha de ${selected.name} redefinida para ${DEFAULT_PASSWORD}.`)
    redirectToUsersMenu()
  }

  const handleUpdateAdminPassword = () => {
    const masterUser = users.find(u => u.id === 'master') || users.find(u => u.role === 'Suporte' || u.role === 'Administrativo')
    if (!masterUser) {
      setAdminPasswordMsg({ text: 'Usuário administrativo não encontrado.', isError: true })
      return
    }

    if (currentAdminPasswordInput !== masterUser.password) {
      setAdminPasswordMsg({ text: 'A senha atual informada está incorreta.', isError: true })
      return
    }

    if (!newAdminPasswordInput.trim()) {
      setAdminPasswordMsg({ text: 'Informe uma nova senha válida.', isError: true })
      return
    }

    if (newAdminPasswordInput !== confirmAdminPasswordInput) {
      setAdminPasswordMsg({ text: 'A confirmação não confere com a nova senha.', isError: true })
      return
    }

    setUsers(prev => prev.map(u => (u.id === masterUser.id ? { ...u, password: newAdminPasswordInput.trim() } : u)))
    setAdminPasswordMsg({ text: 'Senha administrativa alterada com sucesso!', isError: false })
    setPopupMessage('Senha administrativa atualizada!')
    setCurrentAdminPasswordInput('')
    setNewAdminPasswordInput('')
    setConfirmAdminPasswordInput('')
  }

  const exitAdminMode = () => {
    setShowExitModal(false)
    setIsVisualMode(false)
    setStack(prev => (prev.length > 1 && prev[prev.length - 1].id === 'main' ? prev.slice(0, -1) : prev))
  }

  const logoutAndExit = () => {
    setShowExitModal(false)
    setAuthenticated(false)
    setCurrentUserId(null)
    setLoginUser('')
    setLoginPassword('')
    setStack([{ id: 'root', index: 0 }])
    setIsVisualMode(false)
    setPopupMessage('Sessão encerrada com sucesso.')
  }

  const handleFactoryReset = () => {
    try {
      window.sessionStorage.clear()
    } catch { }

    const defaultMasterUser: User = {
      id: 'master',
      name: 'Tecassistiva',
      password: DEFAULT_PASSWORD,
      role: 'Suporte',
      menuAccess: { ...DEFAULT_MENU_ACCESS }
    }
    setUsers([defaultMasterUser])
    setProfileApps(DEFAULT_PROFILE_APPS)
    setProfileModoProva(DEFAULT_PROFILE_MODO_PROVA)
    setProfileModoSala(DEFAULT_PROFILE_MODO_SALA)
    setModoProvaAccess({ ...DEFAULT_MODO_PROVA_ACCESS })
    setModoSalaAccess({ ...DEFAULT_MODO_SALA_ACCESS })

    setProfileSettings({})
    setChoicesState({
      nivel: 'Iniciante',
      guiaSensorial: 'Ligado',
      modoProva: 'Desativado',
      modoSala: 'Ativado',
      wifi: 'Ativado',
      bluetooth: 'Desligado',
      modoProvaWifi: 'Desligado',
      modoProvaBt: 'Desligado',
      modoSalaWifi: 'Desligado',
      modoSalaBt: 'Desligado'
    })
    setThemeMode('modern')
    setActiveProfile('universal')
    setShowFactoryResetModal(false)
    setPopupMessage('Todos os padrões de fábrica foram restaurados!')
    scrollToSection('section-quick-actions', 'quickActions')
  }

  const handleOpenCreateUserModal = () => {
    setNewUserName('')
    setNewUserPassword(DEFAULT_PASSWORD)
    setNewUserRole('Usuário')
    setNewUserWifi('Ativado')
    setNewUserBluetooth('Desligado')
    setNewUserModoProvaWifi('Desligado')
    setNewUserModoProvaBt('Desligado')
    setNewUserMenuAccess({ ...DEFAULT_MENU_ACCESS })
    setNewUserModoProvaAccess({ ...DEFAULT_MODO_PROVA_ACCESS })
    setNewUserModoSalaAccess({ ...DEFAULT_MODO_SALA_ACCESS })
    setNewUserTab('standard')
    setShowNewUserPassword(false)
    setShowCreateUserModal(true)
  }

  const handleSaveNewUser = () => {
    if (!newUserName.trim()) {
      alert('Por favor, informe o nome do usuário / aluno.')
      return
    }
    const activeAdminId = currentUser?.id || 'master'
    const newUserObj: User = {
      id: `user_${Date.now()}`,
      name: newUserName.trim(),
      password: newUserPassword.trim() || DEFAULT_PASSWORD,
      role: newUserRole,
      menuAccess: { ...newUserMenuAccess },
      modoProvaAccess: { ...newUserModoProvaAccess },
      modoSalaAccess: { ...newUserModoSalaAccess },
      createdByAdminId: activeAdminId,
      wifi: newUserWifi,
      bluetooth: newUserBluetooth,
      modoProvaWifi: newUserModoProvaWifi,
      modoProvaBt: newUserModoProvaBt
    }
    setUsers(prev => [...prev, newUserObj])
    selectCustomUser(newUserObj.id)
    setPopupMessage(`Usuário "${newUserObj.name}" cadastrado com sucesso!`)
    setShowCreateUserModal(false)
  }

  const handleExportUsers = () => {
    if (visibleUsers.length === 0) {
      alert('Não há usuários cadastrados para exportar.')
      return
    }

    const adminName = currentUser?.name || 'Suporte'
    const dateStr = new Date().toISOString().split('T')[0]

    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xmlContent += `<usuarios exportadoEm="${dateStr}" administrador="${adminName}">\n`

    for (const u of visibleUsers) {
      const safeName = u.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      xmlContent += `  <usuario>\n`
      xmlContent += `    <nome>${safeName}</nome>\n`
      xmlContent += `    <perfil>${u.role}</perfil>\n`
      xmlContent += `    <aplicativosLiberados>\n`
      for (const [appId, isAllowed] of Object.entries(u.menuAccess || {})) {
        xmlContent += `      <app id="${appId}">${isAllowed ? 'true' : 'false'}</app>\n`
      }
      xmlContent += `    </aplicativosLiberados>\n`
      xmlContent += `    <modoProva>\n`
      for (const [appId, isAllowed] of Object.entries(u.modoProvaAccess || {})) {
        xmlContent += `      <app id="${appId}">${isAllowed ? 'true' : 'false'}</app>\n`
      }
      xmlContent += `    </modoProva>\n`
      xmlContent += `    <modoSala>\n`
      for (const [appId, isAllowed] of Object.entries(u.modoSalaAccess || {})) {
        xmlContent += `      <app id="${appId}">${isAllowed ? 'true' : 'false'}</app>\n`
      }
      xmlContent += `    </modoSala>\n`
      xmlContent += settingsToXml(resolveSettings(undefined, profileSettings[`user:${u.id}`]), '    ')
      xmlContent += `  </usuario>\n`
    }

    xmlContent += `</usuarios>`

    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' })
    const downloadUrl = URL.createObjectURL(blob)
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", downloadUrl)
    const adminSlug = adminName.toLowerCase().replace(/\s+/g, '_')
    downloadAnchor.setAttribute("download", `usuarios_liber_${adminSlug}_${dateStr}.xml`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    URL.revokeObjectURL(downloadUrl)

    setPopupMessage(`${visibleUsers.length} usuário(s) exportado(s) em XML com sucesso!`)
  }

  const handleImportUsers = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader()
    const files = event.target.files
    if (!files || files.length === 0) return

    fileReader.readAsText(files[0], "UTF-8")
    fileReader.onload = (e) => {
      try {
        const xmlText = e.target?.result as string
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, "application/xml")

        const parserError = xmlDoc.querySelector("parsererror")
        if (parserError) {
          alert('O arquivo XML selecionado possui formatação inválida.')
          return
        }

        const userNodes = xmlDoc.querySelectorAll("usuario")
        if (userNodes.length === 0) {
          alert('Nenhum usuário encontrado no arquivo XML.')
          return
        }

        const activeAdminId = currentUser?.id || 'master'
        let importedCount = 0
        const newUsersList: User[] = []
        const importedSettings: Record<string, Record<string, string>> = {}

        userNodes.forEach(userNode => {
          const nome = userNode.querySelector("nome")?.textContent?.trim()
          const perfil = userNode.querySelector("perfil")?.textContent?.trim() || 'Usuário'
          const senha = userNode.querySelector("senha")?.textContent?.trim() || DEFAULT_PASSWORD

          if (nome) {
            const menuAccess: Record<string, boolean> = { ...DEFAULT_MENU_ACCESS }
            const modoProvaAccess: Record<string, boolean> = { ...DEFAULT_MODO_PROVA_ACCESS }
            const modoSalaAccess: Record<string, boolean> = { ...DEFAULT_MODO_SALA_ACCESS }

            const appNodes = userNode.querySelectorAll("aplicativosLiberados app, aplicativos app, app")
            appNodes.forEach(appNode => {
              const appId = appNode.getAttribute("id")
              if (appId) {
                menuAccess[appId] = appNode.textContent?.trim().toLowerCase() === 'true'
              }
            })

            const provaNodes = userNode.querySelectorAll("modoProva app")
            provaNodes.forEach(appNode => {
              const appId = appNode.getAttribute("id")
              if (appId) {
                modoProvaAccess[appId] = appNode.textContent?.trim().toLowerCase() === 'true'
              }
            })

            const salaNodes = userNode.querySelectorAll("modoSala app")
            salaNodes.forEach(appNode => {
              const appId = appNode.getAttribute("id")
              if (appId) {
                modoSalaAccess[appId] = appNode.textContent?.trim().toLowerCase() === 'true'
              }
            })

            const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
            const userSettings = parseSettingsXml(userNode)
            if (Object.keys(userSettings).length > 0) importedSettings[`user:${newUserId}`] = userSettings

            newUsersList.push({
              id: newUserId,
              name: nome,
              password: senha,
              role: perfil,
              menuAccess,
              modoProvaAccess,
              modoSalaAccess,
              createdByAdminId: activeAdminId
            })
            importedCount++
          }
        })

        if (importedCount > 0) {
          setUsers(prev => [...prev, ...newUsersList])
          if (Object.keys(importedSettings).length > 0) setProfileSettings(prev => ({ ...prev, ...importedSettings }))
          setPopupMessage(`${importedCount} usuário(s) importado(s) via XML com sucesso!`)
        } else {
          alert('Nenhum usuário válido encontrado no arquivo XML.')
        }
      } catch {
        alert('Erro ao processar o arquivo XML de usuários.')
      } finally {
        if (event.target) event.target.value = ''
      }
    }
  }

  const handleExportProfiles = () => {
    const adminName = currentUser?.name || 'Suporte'
    const dateStr = new Date().toISOString().split('T')[0]

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xml += `<perfis_liber exportadoEm="${dateStr}" exportadoPor="${adminName}" versao="1.0">\n`

    for (const p of DISABILITY_PROFILES) {
      if (p.id === 'custom') continue
      const apps = profileApps[p.id] || DEFAULT_PROFILE_APPS[p.id] || DEFAULT_MENU_ACCESS
      const prova = profileModoProva[p.id] || DEFAULT_PROFILE_MODO_PROVA[p.id] || DEFAULT_PROFILE_MODO_PROVA.universal
      const sala = profileModoSala[p.id] || DEFAULT_PROFILE_MODO_SALA[p.id] || DEFAULT_PROFILE_MODO_SALA.universal

      xml += `  <perfil id="${p.id}" nome="${p.name}">\n`
      xml += `    <configuracoes>\n`
      for (const [k, v] of Object.entries(p.config || {})) {
        xml += `      <config chave="${k}">${v}</config>\n`
      }
      xml += `    </configuracoes>\n`

      xml += `    <appsLiberados>\n`
      for (const [appId, allowed] of Object.entries(apps)) {
        xml += `      <app id="${appId}">${allowed ? 'true' : 'false'}</app>\n`
      }
      xml += `    </appsLiberados>\n`

      xml += `    <modoProva status="${prova.status}" wifi="${prova.wifi}" bluetooth="${prova.bluetooth}">\n`
      for (const [appId, allowed] of Object.entries(prova.apps || {})) {
        xml += `      <app id="${appId}">${allowed ? 'true' : 'false'}</app>\n`
      }
      xml += `    </modoProva>\n`

      xml += `    <modoSala status="${sala.status}" wifi="${sala.wifi || 'Ativado'}" bluetooth="${sala.bluetooth || 'Ativado'}">\n`
      for (const [appId, allowed] of Object.entries(sala.apps || {})) {
        xml += `      <app id="${appId}">${allowed ? 'true' : 'false'}</app>\n`
      }
      xml += `    </modoSala>\n`

      xml += settingsToXml(resolveSettings(p.id, profileSettings[p.id]), '    ')

      xml += `  </perfil>\n`
    }

    xml += `</perfis_liber>`

    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' })
    const downloadUrl = URL.createObjectURL(blob)
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", downloadUrl)
    downloadAnchor.setAttribute("download", `perfis_liber_${dateStr}.xml`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    URL.revokeObjectURL(downloadUrl)

    setPopupMessage('Configurações dos perfis exportadas em XML com sucesso!')
  }

  const handleImportProfiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader()
    const files = event.target.files
    if (!files || files.length === 0) return

    fileReader.readAsText(files[0], "UTF-8")
    fileReader.onload = (e) => {
      try {
        const xmlText = e.target?.result as string
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, "application/xml")

        const parserError = xmlDoc.querySelector("parsererror")
        if (parserError) {
          alert('O arquivo XML selecionado possui formatação inválida.')
          return
        }

        const perfilNodes = xmlDoc.querySelectorAll("perfil")
        if (perfilNodes.length === 0) {
          alert('Nenhum perfil encontrado no arquivo XML.')
          return
        }

        setProfileApps(prev => {
          const nextApps = { ...prev }
          perfilNodes.forEach(node => {
            const id = node.getAttribute("id")
            if (id) {
              const appNodes = node.querySelectorAll("appsLiberados app")
              if (appNodes.length > 0) {
                const map: Record<string, boolean> = { ...(nextApps[id] || DEFAULT_PROFILE_APPS[id] || DEFAULT_MENU_ACCESS) }
                appNodes.forEach(an => {
                  const appId = an.getAttribute("id")
                  if (appId) {
                    map[appId] = an.textContent?.trim().toLowerCase() === 'true'
                  }
                })
                nextApps[id] = map
              }
            }
          })
          return nextApps
        })

        setProfileModoProva(prev => {
          const nextProva = { ...prev }
          perfilNodes.forEach(node => {
            const id = node.getAttribute("id")
            if (id) {
              const provaNode = node.querySelector("modoProva")
              if (provaNode) {
                const current = nextProva[id] || DEFAULT_PROFILE_MODO_PROVA[id] || DEFAULT_PROFILE_MODO_PROVA.universal
                const status = (provaNode.getAttribute("status") as 'Ativado' | 'Desativado') || current.status
                const wifi = (provaNode.getAttribute("wifi") as 'Ativado' | 'Desligado') || current.wifi
                const bluetooth = (provaNode.getAttribute("bluetooth") as 'Ativado' | 'Desligado') || current.bluetooth
                const appNodes = provaNode.querySelectorAll("app")
                const appsMap = { ...current.apps }
                appNodes.forEach(an => {
                  const appId = an.getAttribute("id")
                  if (appId) {
                    appsMap[appId] = an.textContent?.trim().toLowerCase() === 'true'
                  }
                })
                nextProva[id] = { status, wifi, bluetooth, apps: appsMap }
              }
            }
          })
          return nextProva
        })

        setProfileModoSala(prev => {
          const nextSala = { ...prev }
          perfilNodes.forEach(node => {
            const id = node.getAttribute("id")
            if (id) {
              const salaNode = node.querySelector("modoSala")
              if (salaNode) {
                const current = nextSala[id] || DEFAULT_PROFILE_MODO_SALA[id] || DEFAULT_PROFILE_MODO_SALA.universal
                const status = (salaNode.getAttribute("status") as 'Ativado' | 'Desativado') || current.status
                const wifi = (salaNode.getAttribute("wifi") as 'Ativado' | 'Desligado') || current.wifi || 'Ativado'
                const bluetooth = (salaNode.getAttribute("bluetooth") as 'Ativado' | 'Desligado') || current.bluetooth || 'Ativado'
                const appNodes = salaNode.querySelectorAll("app")
                const appsMap = { ...current.apps }
                appNodes.forEach(an => {
                  const appId = an.getAttribute("id")
                  if (appId) {
                    appsMap[appId] = an.textContent?.trim().toLowerCase() === 'true'
                  }
                })
                nextSala[id] = { status, wifi, bluetooth, apps: appsMap }
              }
            }
          })
          return nextSala
        })

        const importedProfileSettings: Record<string, Record<string, string>> = {}
        perfilNodes.forEach(node => {
          const id = node.getAttribute("id")
          if (!id || id === 'custom') return
          const parsed = parseSettingsXml(node)
          if (Object.keys(parsed).length > 0) importedProfileSettings[id] = parsed
        })
        if (Object.keys(importedProfileSettings).length > 0) {
          setProfileSettings(prev => {
            const next = { ...prev }
            for (const [id, values] of Object.entries(importedProfileSettings)) next[id] = { ...(next[id] ?? {}), ...values }
            return next
          })
        }

        setPopupMessage(`${perfilNodes.length} perfil(is) de acessibilidade importados com sucesso!`)
      } catch {
        alert('Erro ao processar o arquivo XML de perfis.')
      } finally {
        if (event.target) event.target.value = ''
      }
    }
  }



  if (authRequested) {
    const isPasswordStep = loginStage === 'password'
    return (
      <div style={deviceColorStyle} className="w-screen h-screen bg-[color:var(--dev-bg)] font-sans font-bold text-[color:var(--dev-fg)] flex flex-col">
        <main className="flex-grow px-4 py-6 flex items-center justify-center">
          <div className="w-full max-w-xl bg-black/80 p-6 sm:p-8 rounded-sm text-white">
            <div className="text-xs uppercase tracking-[0.2em] opacity-70">Acesso Modo ADM</div>
            <div className="mt-1 mb-5 text-2xl">{isPasswordStep ? 'Digite sua senha' : 'Digite seu usuário'}</div>

            {isPasswordStep && (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-sm border border-white/30 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-xs opacity-70">Usuário</div>
                  <div className="truncate text-lg">{loginUser}</div>
                </div>
                <button
                  type="button"
                  onClick={backToLoginUsername}
                  className="shrink-0 rounded-sm border border-white/60 px-3 py-2 text-sm hover:bg-white/10"
                >
                  Alterar usuário
                </button>
              </div>
            )}

            <input
              key={loginStage}
              ref={loginUserRef}
              aria-label={isPasswordStep ? 'Senha' : 'Usuário'}
              value={isPasswordStep ? loginPassword : loginUser}
              onChange={e => {
                if (isPasswordStep) setLoginPassword(e.target.value)
                else setLoginUser(e.target.value)
                if (loginError) setLoginError('')
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.stopPropagation()
                  e.preventDefault()
                  if (!e.repeat) handleLogin()
                }
              }}
              className="w-full rounded-sm border-2 border-white/70 bg-black px-4 py-4 text-xl text-white"
              type={isPasswordStep ? 'password' : 'text'}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              autoFocus
            />

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleLogin}
                className="w-full flex-1 rounded-sm bg-[color:var(--dev-fg)] px-6 py-4 text-xl text-[color:var(--dev-bg)]"
              >
                {isPasswordStep ? 'Entrar' : 'Continuar'}
              </button>
              <button
                type="button"
                onClick={isPasswordStep ? backToLoginUsername : cancelLogin}
                className="w-full flex-1 rounded-sm border-2 border-white/50 px-6 py-4 text-xl text-white hover:bg-white/10"
              >
                {isPasswordStep ? 'Voltar' : 'Cancelar'}
              </button>
            </div>
            <p className="mt-3 text-xs opacity-60">Enter confirma · Esc {isPasswordStep ? 'volta ao usuário' : 'cancela'}</p>

            {loginError ? (
              <p className="mt-3 text-sm text-red-400">{loginError}</p>
            ) : null}
          </div>
        </main>
      </div>
    )
  }

  function ContrastDiagonalIcon({ className = "w-6 h-6" }: { className?: string }) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <circle cx="12" cy="12" r="9.5" />
        <path d="M18.7 5.3A9.5 9.5 0 0 1 5.3 18.7z" fill="currentColor" stroke="none" />
        <line x1="5.3" y1="18.7" x2="18.7" y2="5.3" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  }

  const DISABILITY_PROFILES: {
    id: string
    name: string
    icon: string
    config: Record<string, string>
  }[] = [
      {
        id: 'universal',
        name: 'Universal',
        icon: '/icons/perfil-universal.png',
        config: { nivel: 'Iniciante', guiaSensorial: 'Ligado' }
      },
      {
        id: 'visual',
        name: 'Deficiência Visual',
        icon: '/icons/perfil-visual.png',
        config: { nivel: 'Iniciante', guiaSensorial: 'Ligado' }
      },
      {
        id: 'cognitivo',
        name: 'TDAH',
        icon: '/icons/perfil-cognitivo.png',
        config: { nivel: 'Iniciante', guiaSensorial: 'Ligado' }
      },
      {
        id: 'neurodivergente',
        name: 'TEA',
        icon: '/icons/perfil-neurodivergente.png',
        config: { nivel: 'Intermediário', guiaSensorial: 'Ligado' }
      },
      {
        id: 'custom',
        name: 'Personalizado',
        icon: '/icons/perfil-usuario.png',
        config: {}
      }
    ]

  const navigateToAppsTab = (tab: 'standard' | 'modoProva' | 'modoSala') => {
    if (selectedCustomUserId) {
      setCustomUserConfigTab(tab)
    } else {
      setProfileConfigTab(tab)
    }

    const navKey = tab === 'standard' ? 'appsLiberados' : tab
    setActiveNavSection(navKey)

    const targetEl = selectedCustomUserId
      ? (document.getElementById('section-selected-user-apps') || document.getElementById('section-users'))
      : (document.getElementById('section-apps') || document.getElementById('section-users'))
    if (targetEl && mainScrollRef.current) {
      const containerTop = mainScrollRef.current.getBoundingClientRect().top
      const elementTop = targetEl.getBoundingClientRect().top
      const scrollOffset = elementTop - containerTop + mainScrollRef.current.scrollTop - 20
      mainScrollRef.current.scrollTo({ top: Math.max(0, scrollOffset), behavior: 'smooth' })
    } else if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const scrollToSection = (sectionId: string, navKey: 'quickActions' | 'profiles' | 'appsLiberados' | 'settings' | 'modoProva' | 'modoSala' | 'users' | 'account' | 'adminPassword' | 'factoryReset') => {
    if (navKey === 'users') {
      setIsUsersExpanded(true)
    }
    if (navKey === 'adminPassword') {
      setIsAdminPasswordExpanded(true)
    }
    if (navKey === 'appsLiberados') {
      navigateToAppsTab('standard')
      return
    }
    if (navKey === 'modoProva') {
      navigateToAppsTab('modoProva')
      return
    }
    if (navKey === 'modoSala') {
      navigateToAppsTab('modoSala')
      return
    }

    setActiveNavSection(navKey)
    const element = document.getElementById(sectionId)
    if (element && mainScrollRef.current) {
      const containerTop = mainScrollRef.current.getBoundingClientRect().top
      const elementTop = element.getBoundingClientRect().top
      const scrollOffset = elementTop - containerTop + mainScrollRef.current.scrollTop - 20
      mainScrollRef.current.scrollTo({ top: Math.max(0, scrollOffset), behavior: 'smooth' })
    } else if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleScrollSpy = () => {
    const container = mainScrollRef.current
    if (!container) return
    const scrollPos = container.scrollTop

    // Ativa a subida dos 3 botões (Wi-Fi, Bluetooth, Contraste) para o Header quando a rolagem cobrir a área de ações rápidas
    const quickActionsEl = document.getElementById('section-quick-action-buttons')
    if (quickActionsEl) {
      const qaTrigger = quickActionsEl.offsetTop + quickActionsEl.offsetHeight - 20
      setIsStickyQuickActionsVisible(scrollPos > qaTrigger)
    } else {
      setIsStickyQuickActionsVisible(scrollPos > 120)
    }

    // Ativa a subida do perfil selecionado para o Header quando a rolagem cobrir os botões de perfis
    const profileCardsEl = document.getElementById('section-profiles-cards')
    if (profileCardsEl) {
      const profileTrigger = profileCardsEl.offsetTop + profileCardsEl.offsetHeight - 30
      setIsStickyProfileVisible(scrollPos > profileTrigger)
    } else {
      setIsStickyProfileVisible(scrollPos > 340)
    }

    const sectionElements = [
      { id: 'section-quick-actions', key: 'quickActions' as const },
      { id: 'section-profiles', key: 'profiles' as const },
      { id: 'section-users', key: 'users' as const },
      { id: 'section-apps', key: 'apps' as const },
      { id: 'section-settings', key: 'settings' as const },
      { id: 'section-admin-password', key: 'adminPassword' as const },
      { id: 'section-factory-reset', key: 'factoryReset' as const }
    ]

    for (let i = sectionElements.length - 1; i >= 0; i--) {
      const s = sectionElements[i]
      const el = document.getElementById(s.id)
      if (el && el.offsetTop - 140 <= scrollPos) {
        if (s.key === 'apps') {
          const currentTab = selectedCustomUserId ? customUserConfigTab : profileConfigTab
          if (currentTab === 'modoProva') {
            setActiveNavSection('modoProva')
          } else if (currentTab === 'modoSala') {
            setActiveNavSection('modoSala')
          } else {
            setActiveNavSection('appsLiberados')
          }
        } else {
          setActiveNavSection(s.key)
        }
        break
      }
    }
  }

  const toggleProfileModoProvaStatus = (targetProfileId: string) => {
    setProfileModoProva(prev => {
      const currentConfig = prev[targetProfileId] || DEFAULT_PROFILE_MODO_PROVA[targetProfileId] || DEFAULT_PROFILE_MODO_PROVA.universal
      const nextStatus: 'Ativado' | 'Desativado' = currentConfig.status === 'Ativado' ? 'Desativado' : 'Ativado'
      const updated = {
        ...prev,
        [targetProfileId]: {
          ...currentConfig,
          status: nextStatus
        }
      }
      setChoicesState(c => ({ ...c, modoProva: nextStatus }))
      return updated
    })
  }

  const toggleProfileModoSalaStatus = (targetProfileId: string) => {
    setProfileModoSala(prev => {
      const currentConfig = prev[targetProfileId] || DEFAULT_PROFILE_MODO_SALA[targetProfileId] || DEFAULT_PROFILE_MODO_SALA.universal
      const nextStatus: 'Ativado' | 'Desativado' = currentConfig.status === 'Ativado' ? 'Desativado' : 'Ativado'
      const updated = {
        ...prev,
        [targetProfileId]: {
          ...currentConfig,
          status: nextStatus
        }
      }
      setChoicesState(c => ({ ...c, modoSala: nextStatus }))
      return updated
    })
  }

  // Escolher um usuário significa usar o perfil Personalizado: marca-o automaticamente
  const selectCustomUser = (userId: string | null) => {
    if (userId && activeProfile !== 'custom') {
      setActiveProfile('custom')
      setChoicesState(prev => ({
        ...prev,
        modoProva: profileModoProva.custom?.status ?? DEFAULT_PROFILE_MODO_PROVA.custom?.status ?? 'Desativado',
        modoSala: profileModoSala.custom?.status ?? DEFAULT_PROFILE_MODO_SALA.custom?.status ?? 'Ativado'
      }))
    }
    setSelectedCustomUserId(userId)
  }

  const applyDisabilityProfile = (profileId: string) => {
    setActiveProfile(profileId)
    setSelectedCustomUserId(null)

    const modoProvaForProfile = profileModoProva[profileId]?.status ?? DEFAULT_PROFILE_MODO_PROVA[profileId]?.status ?? 'Desativado'
    const modoSalaForProfile = profileModoSala[profileId]?.status ?? DEFAULT_PROFILE_MODO_SALA[profileId]?.status ?? 'Ativado'

    if (profileId === 'custom') {
      setIsUsersExpanded(true)
      setChoicesState(prev => ({
        ...prev,
        modoProva: modoProvaForProfile,
        modoSala: modoSalaForProfile
      }))
      setPopupMessage('Perfil Personalizado ativado. Selecione um usuário abaixo para configurar.')
      return
    }

    const profile = DISABILITY_PROFILES.find(p => p.id === profileId)
    setChoicesState(prev => ({
      ...prev,
      modoProva: modoProvaForProfile,
      modoSala: modoSalaForProfile,
      ...(profile?.config ? profile.config : {})
    }))

    // Sincroniza os apps ativos do perfil para o usuário mestre / usuário ativo
    const activeAppsForProfile = profileApps[profileId] || DEFAULT_PROFILE_APPS[profileId] || DEFAULT_MENU_ACCESS
    if (currentUser) {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, menuAccess: { ...activeAppsForProfile } } : u))
    }

    setPopupMessage(`Perfil "${profile?.name}" ativado.`)
  }

  const toggleAppForCustomUser = (userId: string, appId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const currentAccess = u.menuAccess || { ...DEFAULT_MENU_ACCESS }
        return {
          ...u,
          menuAccess: {
            ...currentAccess,
            [appId]: !currentAccess[appId]
          }
        }
      }
      return u
    }))
  }

  const setAllAppsForCustomUser = (userId: string, value: boolean) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          menuAccess: Object.fromEntries(APPS_LIBERADOS_IDS.map(id => [id, value]))
        }
      }
      return u
    }))
  }

  const toggleModoProvaAppForCustomUser = (userId: string, appId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const currentAccess = u.modoProvaAccess || { ...DEFAULT_MODO_PROVA_ACCESS }
        return {
          ...u,
          modoProvaAccess: {
            ...currentAccess,
            [appId]: !(currentAccess[appId] ?? false)
          }
        }
      }
      return u
    }))
  }

  const setAllModoProvaAppsForCustomUser = (userId: string, value: boolean) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          modoProvaAccess: Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, value]))
        }
      }
      return u
    }))
  }

  const toggleModoSalaAppForCustomUser = (userId: string, appId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const currentAccess = u.modoSalaAccess || { ...DEFAULT_MODO_SALA_ACCESS }
        return {
          ...u,
          modoSalaAccess: {
            ...currentAccess,
            [appId]: !(currentAccess[appId] ?? true)
          }
        }
      }
      return u
    }))
  }

  const setAllModoSalaAppsForCustomUser = (userId: string, value: boolean) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          modoSalaAccess: Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, value]))
        }
      }
      return u
    }))
  }

  const toggleAppForProfile = (appId: string) => {
    setProfileApps(prev => {
      const currentMap = prev[activeProfile] || { ...DEFAULT_MENU_ACCESS }
      const updated = {
        ...prev,
        [activeProfile]: {
          ...currentMap,
          [appId]: !currentMap[appId]
        }
      }
      return updated
    })
  }

  const toggleAppForProfileModoProva = (targetProfileId: string, appId: string) => {
    setProfileModoProva(prev => {
      const currentConfig = prev[targetProfileId] || DEFAULT_PROFILE_MODO_PROVA[targetProfileId] || DEFAULT_PROFILE_MODO_PROVA.universal
      return {
        ...prev,
        [targetProfileId]: {
          ...currentConfig,
          apps: {
            ...currentConfig.apps,
            [appId]: !currentConfig.apps[appId]
          }
        }
      }
    })
  }

  const setProfileModoProvaWifi = (targetProfileId: string, wifi: 'Ativado' | 'Desligado') => {
    setProfileModoProva(prev => {
      const currentConfig = prev[targetProfileId] || DEFAULT_PROFILE_MODO_PROVA[targetProfileId] || DEFAULT_PROFILE_MODO_PROVA.universal
      return {
        ...prev,
        [targetProfileId]: {
          ...currentConfig,
          wifi
        }
      }
    })
  }

  const setProfileModoProvaBt = (targetProfileId: string, bluetooth: 'Ativado' | 'Desligado') => {
    setProfileModoProva(prev => {
      const currentConfig = prev[targetProfileId] || DEFAULT_PROFILE_MODO_PROVA[targetProfileId] || DEFAULT_PROFILE_MODO_PROVA.universal
      return {
        ...prev,
        [targetProfileId]: {
          ...currentConfig,
          bluetooth
        }
      }
    })
  }

  const toggleAppForProfileModoSala = (targetProfileId: string, appId: string) => {
    setProfileModoSala(prev => {
      const currentConfig = prev[targetProfileId] || DEFAULT_PROFILE_MODO_SALA[targetProfileId] || DEFAULT_PROFILE_MODO_SALA.universal
      return {
        ...prev,
        [targetProfileId]: {
          ...currentConfig,
          apps: {
            ...currentConfig.apps,
            [appId]: !currentConfig.apps[appId]
          }
        }
      }
    })
  }

  const toggleWifi = () => {
    setSetting('wifi', settingsValues.wifi === 'Ligado' ? 'Desligado' : 'Ligado')
  }

  const toggleBluetooth = () => {
    setSetting('bluetooth', settingsValues.bluetooth === 'Sim' ? 'Não' : 'Sim')
  }

  const toggleContrastTheme = () => {
    setThemeMode(prev => prev === 'high-contrast-yellow' ? 'modern' : 'high-contrast-yellow')
  }

  if (isVisualMode) {
    const isWifiOn = settingsValues.wifi === 'Ligado'
    const isBtOn = settingsValues.bluetooth === 'Sim'
    const isHighContrast = themeMode === 'high-contrast-yellow'
    const isModoProvaActive = (profileModoProva[activeProfile]?.status ?? DEFAULT_PROFILE_MODO_PROVA[activeProfile]?.status ?? choicesState.modoProva ?? 'Desativado') === 'Ativado'
    const isModoSalaActive = (profileModoSala[activeProfile]?.status ?? DEFAULT_PROFILE_MODO_SALA[activeProfile]?.status ?? choicesState.modoSala ?? 'Ativado') === 'Ativado'
    const currentProfileName = activeProfile === 'custom'
      ? (visibleUsers.find(u => u.id === selectedCustomUserId)?.name || 'Personalizado')
      : (DISABILITY_PROFILES.find(p => p.id === activeProfile)?.name || 'Universal')

    // Estilos limpos para os dois modos solicitados
    const themeStyles = isHighContrast ? {
      bg: 'hc bg-[#FFFF00] text-[#0000FF]',
      sidebar: 'bg-[#FFFF00] border-r-4 border-[#0000FF] text-[#0000FF]',
      card: 'section-card section-card-hc [--strip-bg:#0000FF] [--strip-ink:#FFFF00] [--strip-fg:#FFFF00] bg-[#FFFF00] border-4 border-[#0000FF] rounded-2xl text-[#0000FF]',
      header: 'bg-[#FFFF00] border-b-4 border-[#0000FF]',
      activeTab: 'bg-[#0000FF] text-[#FFFF00] font-black',
      inactiveTab: 'text-[#0000FF] hover:bg-yellow-200 font-bold',
      primaryBtn: 'bg-[#0000FF] hover:bg-blue-900 text-[#FFFF00] font-black rounded-xl',
      border: 'border-[#0000FF]',
      accentBg: 'bg-[#0000FF]/10 border-2 border-[#0000FF] rounded-xl'
    } : {
      bg: 'bg-transparent text-slate-900',
      sidebar: 'bg-gradient-to-b from-[#001a3d] via-[#00244f] to-[#002f66] border-transparent text-slate-200 shadow-[6px_0_28px_-14px_rgba(0,20,60,0.55)]',
      card: 'section-card bg-white border-y-2 border-[#111827] sm:border-x-2 sm:rounded-lg text-[#111827]',
      header: 'bg-white border-[#111827]',
      activeTab: 'rounded-xl bg-white/[0.13] text-white font-bold ring-1 ring-white/20 shadow-[inset_3px_0_0_0_#2dd4bf]',
      inactiveTab: 'rounded-xl text-slate-300 hover:bg-white/[0.07] hover:text-white font-semibold',
      primaryBtn: 'bg-gradient-to-r from-[#002554] to-[#00387a] hover:from-[#001c40] hover:to-[#002554] text-white shadow-xs rounded-xl font-bold',
      border: 'border-slate-200/80',
      accentBg: 'bg-slate-100 border-slate-200 text-slate-900 rounded-xl'
    }

    const navLeaf = isHighContrast
      ? 'text-[#0000FF] hover:bg-yellow-200'
      : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'

    const renderSettingsNav = (nodes: OutlineNode[], depth: number): React.ReactNode => nodes.map(node => {
      const isContainer = !!node.children
      const isOpen = !!settingsOpen[node.id]
      return (
        <div key={node.id}>
          <button
            type="button"
            title={node.label}
            aria-expanded={isContainer ? isOpen : undefined}
            onClick={() => (isContainer && isOpen ? toggleSettingsNode(node.id) : goToSetting(node.id))}
            className={`flex w-full items-center gap-1.5 rounded-lg py-1.5 pr-2 text-left text-xs sm:text-[13px] font-semibold transition-colors ${navLeaf}`}
            style={{ paddingLeft: `${0.5 + depth * 0.75}rem` }}
          >
            {isContainer ? (
              <ChevronDown size={12} className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
            ) : (
              <span className="inline-block h-1 w-1 flex-shrink-0 rounded-full bg-current opacity-60" />
            )}
            <span className="truncate">{node.label}</span>
          </button>
          {isContainer && isOpen && <div className="space-y-0.5">{renderSettingsNav(node.children!, depth + 1)}</div>}
        </div>
      )
    })

    return (
      <div className={`flex h-screen w-screen font-sans ${themeStyles.bg} transition-colors duration-150 overflow-hidden`}>
        {/* Área Principal */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header Superior com Sticky Controls ao Rolar */}
          <header className={`px-4 sm:px-6 md:px-10 py-3 border-b flex items-center justify-between gap-2 sm:gap-4 ${themeStyles.header} z-20 sticky top-0 transition-colors min-h-[60px] sm:min-h-[68px]`}>
            {/* Lado Esquerdo: Título + Perfil Ativo Fixo */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink">
              <span className="text-sm md:text-base font-bold font-display tracking-tight opacity-90 hidden xl:inline flex-shrink-0">
                Painel Administrativo
              </span>

              {/* Perfil Ativo Fixo no Header ao rolar para baixo com animação */}
              <div
                onClick={() => scrollToSection('section-quick-actions', 'quickActions')}
                className={`flex items-center space-x-2 px-2 sm:px-2.5 py-1 border cursor-pointer transition-all duration-300 transform flex-shrink min-w-0 ${isStickyProfileVisible
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto shadow-xs animate-profile-float'
                  : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
                  } ${isHighContrast
                    ? 'bg-[#0000FF] border-2 border-[#FFFF00] text-[#FFFF00]'
                    : 'bg-white border-[#002554]/30 text-slate-800 hover:border-[#002554] hover:shadow-xs'
                  }`}
                title="Clique para ir até a seleção de perfis de acessibilidade"
              >
                <img
                  src={DISABILITY_PROFILES.find(p => p.id === activeProfile)?.icon || '/assets/icones-perfis/universal.png'}
                  alt="Perfil Ativo"
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />

                <div className="flex items-center space-x-1 text-[11px] sm:text-xs truncate min-w-0">
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-60 flex-shrink-0">Perfil:</span>
                  <span className={`font-bold truncate ${isHighContrast ? 'text-[#FFFF00]' : 'text-[#002554]'}`}>
                    {activeProfile === 'custom'
                      ? (visibleUsers.find(u => u.id === selectedCustomUserId)?.name || 'Personalizado')
                      : (DISABILITY_PROFILES.find(p => p.id === activeProfile)?.name || 'Universal')}
                  </span>
                </div>

                <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 font-bold uppercase flex-shrink-0 transition-all ${isHighContrast ? 'bg-[#FFFF00] text-[#0000FF]' : 'bg-[#002554]/10 text-[#002554]'
                  }`}>
                  Trocar
                </span>
              </div>
            </div>

            {/* Lado Direito: Botões Rápidos Fixos + Usuário */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* Botões Rápidos Fixos no Header (Wi-Fi, Bluetooth e Contraste) */}
              <div className={`flex items-center space-x-1 sm:space-x-1.5 transition-all duration-300 transform flex-shrink-0 ${isStickyQuickActionsVisible
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto animate-profile-float'
                : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
                }`}>
                {/* Botão Wi-Fi no Header */}
                <button
                  onClick={toggleWifi}
                  aria-label="Alternar Wi-Fi"
                  title={isWifiOn ? "Wi-Fi Ligado" : "Wi-Fi Desligado"}
                  className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 border flex items-center justify-center transition-all ${isWifiOn
                    ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] border-[#FFFF00]' : 'bg-emerald-500 text-white border-emerald-600')
                    : (isHighContrast ? 'bg-[#FFFF00] text-[#0000FF] border-[#0000FF] opacity-60' : 'bg-white text-slate-400 border-slate-300 hover:text-slate-700')
                    }`}
                >
                  {isWifiOn ? <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <WifiOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>

                {/* Botão Bluetooth no Header */}
                <button
                  onClick={toggleBluetooth}
                  aria-label="Alternar Bluetooth"
                  title={isBtOn ? "Bluetooth Ligado" : "Bluetooth Desligado"}
                  className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 border flex items-center justify-center transition-all ${isBtOn
                    ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] border-[#FFFF00]' : 'bg-blue-600 text-white border-blue-700')
                    : (isHighContrast ? 'bg-[#FFFF00] text-[#0000FF] border-[#0000FF] opacity-60' : 'bg-white text-slate-400 border-slate-300 hover:text-slate-700')
                    }`}
                >
                  {isBtOn ? <Bluetooth className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <BluetoothOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>

                {/* Botão Contraste no Header */}
                <button
                  onClick={toggleContrastTheme}
                  aria-label="Alternar Alto Contraste"
                  title={isHighContrast ? "Desativar Alto Contraste" : "Ativar Alto Contraste"}
                  className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 border flex items-center justify-center transition-all ${isHighContrast
                    ? 'bg-[#FFFF00] text-[#0000FF] border-[#0000FF]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  <ContrastDiagonalIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Sair do Modo ADM */}
              {(
                <button
                  type="button"
                  onClick={() => setShowExitModal(true)}
                  aria-label="Sair do Modo ADM"
                  className={`flex h-11 flex-shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-semibold ${isHighContrast ? 'border-[#0000FF] text-[#0000FF]' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              )}

              {/* Informações do Usuário */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 pl-2 sm:pl-3 border-l border-inherit flex-shrink-0">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-xs flex-shrink-0 ${isHighContrast ? 'bg-[#0000FF] text-[#FFFF00]' : 'bg-[#002554]/10 text-[#002554]'}`}>
                  {currentUser?.name?.charAt(0) || 'S'}
                </div>
                <div className="text-left leading-tight hidden md:block flex-shrink-0">
                  <div className="text-xs font-bold truncate max-w-[100px] sm:max-w-[140px]">{currentUser?.name || 'Suporte'}</div>
                  <div className="text-[10px] opacity-70 truncate">{currentUser?.role || 'Administrador'}</div>
                </div>
              </div>
            </div>
          </header>

          {/* Conteúdo Rolável Contínuo (Scroll-to-Section) */}
          <main
            ref={mainScrollRef}
            onScroll={handleScrollSpy}
            className="flex-1 overflow-y-auto px-0 py-4 sm:p-6 lg:p-10 pb-28 scroll-smooth min-w-0"
          >
            <div className="w-full max-w-[1200px] mx-auto space-y-4 lg:space-y-5">

              {/* 1. SEÇÃO DE AÇÕES RÁPIDAS & PERFIS DE ACESSIBILIDADE */}
              <section id="section-quick-actions" className="space-y-4 lg:space-y-5 scroll-mt-4">
                <div className={`p-5 sm:p-7 border ${themeStyles.card} [--section-accent:#0ea5e9] space-y-3`}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold tracking-wider uppercase opacity-70">Ações Rápidas</h2>
                  </div>

                  <div id="section-quick-action-buttons" className="flex items-center gap-6 sm:gap-7 md:gap-8 lg:gap-9 flex-wrap">
                    {/* Botão Ícone Wi-Fi */}
                    <button
                      onClick={toggleWifi}
                      aria-label="Alternar Wi-Fi"
                      title={isWifiOn ? "Wi-Fi Ligado" : "Wi-Fi Desligado"}
                      className={`relative w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-300 transform active:scale-95 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${isWifiOn
                        ? (isHighContrast
                          ? 'bg-[#0000FF] text-[#FFFF00] border-[#0000FF] ring-2 ring-[#0000FF]/30'
                          : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-400 shadow-emerald-500/25 shadow-lg ring-2 ring-emerald-500/20')
                        : (isHighContrast
                          ? 'bg-[#FFFF00] text-[#0000FF] border-[#0000FF] opacity-60 hover:opacity-100'
                          : 'bg-white text-slate-400 border-slate-200/90 hover:border-slate-300 hover:text-slate-600 shadow-xs')
                        }`}
                    >
                      <div className={`transition-transform duration-300 ${isWifiOn ? 'scale-105' : 'scale-100'}`}>
                        {isWifiOn ? (
                          <div className="relative">
                            <Wifi className="w-7 h-7 sm:w-8 sm:h-8" />
                          </div>
                        ) : (
                          <WifiOff className="w-7 h-7 sm:w-8 sm:h-8" />
                        )}
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold tracking-tight">Wi-Fi</span>
                    </button>

                    {/* Botão Ícone Bluetooth */}
                    <button
                      onClick={toggleBluetooth}
                      aria-label="Alternar Bluetooth"
                      title={isBtOn ? "Bluetooth Ligado" : "Bluetooth Desligado"}
                      className={`relative w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-300 transform active:scale-95 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${isBtOn
                        ? (isHighContrast
                          ? 'bg-[#0000FF] text-[#FFFF00] border-[#0000FF] ring-2 ring-[#0000FF]/30'
                          : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-500 shadow-blue-600/25 shadow-lg ring-2 ring-blue-500/20')
                        : (isHighContrast
                          ? 'bg-[#FFFF00] text-[#0000FF] border-[#0000FF] opacity-60 hover:opacity-100'
                          : 'bg-white text-slate-400 border-slate-200/90 hover:border-slate-300 hover:text-slate-600 shadow-xs')
                        }`}
                    >
                      <div className={`transition-transform duration-300 ${isBtOn ? 'scale-105' : 'scale-100'}`}>
                        {isBtOn ? (
                          <div className="relative">
                            <Bluetooth className="w-7 h-7 sm:w-8 sm:h-8" />
                          </div>
                        ) : (
                          <BluetoothOff className="w-7 h-7 sm:w-8 sm:h-8" />
                        )}
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold tracking-tight">Bluetooth</span>
                    </button>

                    {/* Botão Ícone Alto Contraste */}
                    <button
                      onClick={toggleContrastTheme}
                      aria-label="Alternar Alto Contraste"
                      title={isHighContrast ? "Desativar Alto Contraste" : "Ativar Alto Contraste Amarelo/Azul"}
                      className={`relative w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-500 transform active:scale-95 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${isHighContrast
                        ? 'bg-[#0000FF] text-[#FFFF00] border-[#0000FF] ring-2 ring-[#0000FF]/30 shadow-blue-900/30 shadow-lg'
                        : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:text-slate-900 shadow-xs'
                        }`}
                    >
                      <div className={`transition-transform duration-500 ease-in-out ${isHighContrast ? 'rotate-180 scale-105' : 'rotate-0 scale-100'}`}>
                        <ContrastDiagonalIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold tracking-tight">Contraste</span>
                    </button>
                  </div>
                </div>

                {/* Perfis de Acessibilidade */}
                <div id="section-profiles" className="space-y-3 scroll-mt-4">
                  <div className={`p-5 sm:p-7 border ${themeStyles.card} [--section-accent:#14b8a6] space-y-5`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xs font-bold tracking-wider uppercase opacity-70">Perfis de Acessibilidade</h2>
                        <InfoTip isHighContrast={isHighContrast}>Personalizações e regras de uso por perfil.</InfoTip>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 ${isHighContrast ? 'bg-[#0000FF] text-[#FFFF00]' : 'bg-[#002554]/10 text-[#002554]'}`}>
                        Ativo: {activeProfile === 'custom'
                          ? (visibleUsers.find(u => u.id === selectedCustomUserId)?.name || 'Personalizado')
                          : (DISABILITY_PROFILES.find(p => p.id === activeProfile)?.name || 'Universal')}
                      </span>

                      {/* Botões de Exportar e Importar Perfis */}
                      <button
                        type="button"
                        onClick={handleExportProfiles}
                        className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-bold border transition-colors ${
                          isHighContrast ? 'border-[#0000FF] hover:bg-[#0000FF] hover:text-[#FFFF00]' : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
                        }`}
                        title="Exportar configurações de todos os perfis em arquivo XML"
                      >
                        <Upload size={13} />
                        <span>Exportar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => profileFileInputRef.current?.click()}
                        className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-bold border transition-colors ${
                          isHighContrast ? 'border-[#0000FF] hover:bg-[#0000FF] hover:text-[#FFFF00]' : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
                        }`}
                        title="Importar configurações de perfis a partir de arquivo XML"
                      >
                        <Download size={13} />
                        <span>Importar</span>
                      </button>

                      <input
                        ref={profileFileInputRef}
                        type="file"
                        accept=".xml,text/xml,application/xml"
                        onChange={handleImportProfiles}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div id="section-profiles-cards" className="grid grid-cols-5 gap-x-3 gap-y-4 sm:gap-x-5 lg:gap-x-8 portrait:grid-cols-[repeat(auto-fill,minmax(min(100%,8.5rem),1fr))] portrait:gap-6">
                    {DISABILITY_PROFILES.map(profile => {
                      const isActive = activeProfile === profile.id
                      return (
                        <button
                          key={profile.id}
                          onClick={() => applyDisabilityProfile(profile.id)}
                          className={`p-3 sm:p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${isActive
                            ? (isHighContrast
                                ? 'bg-[#0000FF] text-[#FFFF00] border-[#0000FF] shadow-sm'
                                : 'bg-gradient-to-b from-blue-50/90 to-indigo-50/60 text-[#002554] border-[#002554]/70 shadow-md ring-2 ring-[#002554]/20')
                            : (isHighContrast
                                ? 'bg-[#FFFF00] text-[#0000FF] border-[#0000FF] hover:bg-yellow-200'
                                : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 shadow-xs')
                            }`}
                        >
                          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center mb-2">
                            <img
                              src={profile.icon}
                              alt={profile.name}
                              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          </div>

                          <span className="text-xs font-bold leading-snug">
                            {profile.name}
                          </span>

                          {isActive && (
                            <span className={`mt-2 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow-xs ${isHighContrast ? 'bg-[#FFFF00] text-[#0000FF]' : 'bg-[#002554] text-white'
                              }`}>
                              Ativo
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Bloco de Aplicativos Liberados / Usuários */}
                  </div>

                  <div className="pt-4 space-y-4 lg:space-y-5">
                    {/* 1. SEÇÃO DE USUÁRIOS (Sempre visível após os perfis de acessibilidade, recolhida por padrão) */}
                      <div id="section-users" className={`p-5 sm:p-7 border ${themeStyles.card} [--section-accent:#6366f1] scroll-mt-6 transition-all`}>
                        {/* Cabeçalho Acordeão do Menu de Usuários */}
                        <div
                          onClick={() => setIsUsersExpanded(prev => !prev)}
                          className={`flex flex-col landscape:flex-row landscape:items-center sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                            isUsersExpanded ? 'pb-4 border-b border-inherit' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${
                              isHighContrast 
                                ? 'bg-[#0000FF] text-[#FFFF00]' 
                                : 'bg-[#002554]/10 text-[#002554] dark:bg-blue-500/20 dark:text-blue-300'
                            }`}>
                              <Users size={20} />
                            </div>

                            <div>
                              <div className="flex items-center space-x-2 flex-wrap gap-1">
                                <h3 className="text-base font-bold text-[#002554] dark:text-blue-300">
                                  Usuários
                                </h3>
                                <InfoTip isHighContrast={isHighContrast}>Gerencie os usuários cadastrados e seus acessos. Clique no cabeçalho para expandir ou recolher a lista.</InfoTip>
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                  isHighContrast
                                    ? 'bg-[#0000FF] text-[#FFFF00]'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                }`}>
                                  {visibleUsers.length} cadastrado{visibleUsers.length !== 1 ? 's' : ''}
                                </span>
                                {selectedCustomUserId && (
                                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                    isHighContrast
                                      ? 'bg-[#0000FF] text-[#FFFF00]'
                                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  }`}>
                                    Aluno selecionado: {visibleUsers.find(u => u.id === selectedCustomUserId)?.name || 'Selecionado'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 gap-1.5 flex-nowrap shrink-0 portrait:flex-wrap" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setIsUsersExpanded(true)
                                handleOpenCreateUserModal()
                              }}
                              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold ${themeStyles.primaryBtn}`}
                            >
                              <span>Novo</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleExportUsers}
                              className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold border transition-colors rounded-xl ${
                                isHighContrast ? 'border-[#0000FF] hover:bg-[#0000FF] hover:text-[#FFFF00]' : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
                              }`}
                              title="Exportar usuários e permissões em XML"
                            >
                              <Upload size={14} />
                              <span className="hidden sm:inline">Exportar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold border transition-colors rounded-xl ${
                                isHighContrast ? 'border-[#0000FF] hover:bg-[#0000FF] hover:text-[#FFFF00]' : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
                              }`}
                              title="Importar usuários e permissões a partir de XML"
                            >
                              <Download size={14} />
                              <span className="hidden sm:inline">Importar</span>
                            </button>

                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".xml,text/xml,application/xml"
                              onChange={handleImportUsers}
                              className="hidden"
                            />

                            {/* Botão de Toggle do Acordeão */}
                            <button
                              type="button"
                              onClick={() => setIsUsersExpanded(prev => !prev)}
                              className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold border rounded-xl transition-all ${
                                isHighContrast
                                  ? 'border-[#0000FF] bg-[#FFFF00] text-[#0000FF] hover:bg-[#0000FF] hover:text-[#FFFF00]'
                                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                              }`}
                              title={isUsersExpanded ? 'Recolher menu de usuários' : 'Expandir menu de usuários'}
                            >
                              <span className="text-xs">{isUsersExpanded ? 'Recolher' : 'Expandir'}</span>
                              {isUsersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </div>

                        {/* Conteúdo Expandido */}
                        {isUsersExpanded && (
                          <div className="pt-4 space-y-5">
                            {userManagementView === 'list' ? (
                              <>

                            {/* Tabela de Usuários */}
                            <div className="overflow-hidden border border-inherit">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/60 uppercase text-[10px] font-bold tracking-wider opacity-75 border-b border-inherit">
                                  <tr>
                                    <th className="px-4 py-3">Nome</th>
                                    <th className="px-4 py-3">Perfil</th>
                                    <th className="px-4 py-3">Apps Liberados</th>
                                    <th className="px-4 py-3 text-right">Ações</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-inherit">
                                  {visibleUsers.length === 0 ? (
                                    <tr>
                                      <td colSpan={4} className="px-4 py-8 text-center text-xs opacity-75">
                                        Nenhum aluno cadastrado por você ainda. Clique em <strong>Novo Usuário</strong> acima para adicionar seu primeiro aluno.
                                      </td>
                                    </tr>
                                  ) : (
                                    visibleUsers.map(u => {
                                      const isSelected = selectedCustomUserId === u.id
                                      const activeCount = APPS_LIBERADOS_IDS.filter(id => u.menuAccess?.[id] ?? true).length
                                      return (
                                        <tr
                                          key={u.id}
                                          onClick={() => selectCustomUser(selectedCustomUserId === u.id ? null : u.id)}
                                          className={`cursor-pointer transition-all ${isSelected
                                            ? (isHighContrast
                                              ? 'bg-[#0000FF] text-[#FFFF00] font-bold'
                                              : 'bg-[#002554]/10 font-bold border-l-4 border-l-[#002554]')
                                            : 'hover:bg-slate-50 opacity-85 hover:opacity-100'
                                            }`}
                                        >
                                          <td className="px-4 py-3">
                                            <div className="flex items-center space-x-2">
                                              <div className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold ${isSelected
                                                ? (isHighContrast ? 'bg-[#FFFF00] text-[#0000FF]' : 'bg-[#002554] text-white')
                                                : 'bg-slate-200 text-slate-700'
                                                }`}>
                                                {u.name.charAt(0).toUpperCase()}
                                              </div>
                                              <span>{u.name}</span>
                                              {isSelected && (
                                                <span className={`text-[9px] px-1.5 py-0.5 uppercase font-black ${isHighContrast ? 'bg-[#FFFF00] text-[#0000FF]' : 'bg-[#002554] text-white'
                                                  }`}>
                                                  Selecionado
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold ${u.role === 'Suporte' ? 'bg-[#002554]/10 text-[#002554]' :
                                              u.role === 'Administrativo' ? 'bg-[#002554]/15 text-[#002554]' :
                                                'bg-slate-100 text-slate-700'
                                              }`}>
                                              {u.role}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className="font-semibold">{activeCount} ativos</span>
                                          </td>
                                          <td className="px-4 py-3 text-right space-x-2" onClick={e => e.stopPropagation()}>
                                            <button
                                              onClick={() => {
                                                selectCustomUser(u.id)
                                                setSelectedUserToEdit(u)
                                                setEditUserId(u.id)
                                                setEditName(u.name)
                                                setEditPassword('')
                                                setEditRole(u.role)
                                                setEditUserMenuAccess({ ...u.menuAccess })
                                                setEditUserModoProvaAccess(u.modoProvaAccess ? { ...u.modoProvaAccess } : { ...DEFAULT_MODO_PROVA_ACCESS })
                                                setEditUserModoSalaAccess(u.modoSalaAccess ? { ...u.modoSalaAccess } : { ...DEFAULT_MODO_SALA_ACCESS })
                                                setEditUserTab('standard')
                                                setUserManagementView('edit')
                                              }}
                                              className="px-2.5 py-1 border border-inherit font-bold hover:bg-slate-50"
                                            >
                                              Editar
                                            </button>
                                            {u.id !== 'master' && (
                                              <button
                                                onClick={() => {
                                                  if (window.confirm(`Tem certeza que deseja excluir o usuário "${u.name}"?`)) {
                                                    if (selectedCustomUserId === u.id) {
                                                      setSelectedCustomUserId(null)
                                                    }
                                                    setUsers(prev => prev.filter(x => x.id !== u.id))
                                                    setPopupMessage(`Usuário ${u.name} excluído.`)
                                                  }
                                                }}
                                                className="px-2.5 py-1 text-rose-600 font-bold hover:bg-rose-50"
                                              >
                                                Excluir
                                              </button>
                                            )}
                                          </td>
                                        </tr>
                                      )
                                    })
                                  )}
                                </tbody>
                              </table>
                            </div>

                            {/* Edição dos Aplicativos do Usuário Selecionado */}
                            {(() => {
                              if (!selectedCustomUserId) {
                                return null
                              }
                              const activeCustomUser = visibleUsers.find(u => u.id === selectedCustomUserId)
                              if (!activeCustomUser) return null
                              return (
                                <div id="section-selected-user-apps" className="pt-4 border-t border-inherit space-y-3 scroll-mt-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold">
                                        Apps de <strong className="text-[#002554] dark:text-blue-300 underline">{activeCustomUser.name}</strong>
                                      </span>
                                      <InfoTip isHighContrast={isHighContrast}>
{customUserConfigTab === 'standard' && 'Estes aplicativos estarão disponíveis no menu principal do Liber em uso padrão.'}
                                      {customUserConfigTab === 'modoProva' && 'Aplicativos autorizados quando este aluno estiver em Modo Prova.'}
                                      {customUserConfigTab === 'modoSala' && 'Aplicativos didáticos liberados para este aluno durante as aulas regulares.'} As permissões alteradas são salvas em tempo real no perfil deste usuário.
</InfoTip>
                                    </div>

                                    {/* Abas idênticas aos perfis + Botão de Desmarcar */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex-nowrap portrait:flex-wrap gap-1 shadow-xs">
                                        <button
                                          type="button"
                                          onClick={() => setCustomUserConfigTab('standard')}
                                          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                            customUserConfigTab === 'standard'
                                              ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] shadow-sm' : 'bg-white text-[#002554] shadow-xs')
                                              : 'opacity-70 hover:opacity-100 hover:bg-white/50'
                                          }`}
                                        >
                                          <LayoutGrid size={14} />
                                          <span className="whitespace-nowrap">Apps Liberados</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => setCustomUserConfigTab('modoProva')}
                                          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                            customUserConfigTab === 'modoProva'
                                              ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] shadow-sm' : 'bg-white text-[#002554] shadow-xs')
                                              : 'opacity-70 hover:opacity-100 hover:bg-white/50'
                                          }`}
                                        >
                                          <GraduationCap size={14} />
                                          <span className="whitespace-nowrap">Modo Prova</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => setCustomUserConfigTab('modoSala')}
                                          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                            customUserConfigTab === 'modoSala'
                                              ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] shadow-sm' : 'bg-white text-[#002554] shadow-xs')
                                              : 'opacity-70 hover:opacity-100 hover:bg-white/50'
                                          }`}
                                        >
                                          <BookOpen size={14} />
                                          <span className="whitespace-nowrap">Sala de Aula</span>
                                        </button>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => setSelectedCustomUserId(null)}
                                        className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold border transition-colors rounded-xl ${
                                          isHighContrast
                                            ? 'border-[#0000FF] bg-[#FFFF00] text-[#0000FF] hover:bg-[#0000FF] hover:text-[#FFFF00]'
                                            : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-xs'
                                        }`}
                                        title="Fechar configuração individual deste aluno e voltar às configurações do perfil"
                                      >
                                        <X size={14} />
                                        <span className="landscape:max-lg:sr-only">Desmarcar</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Botões de Ação Rápida */}
                                  <div className="flex items-center justify-end flex-wrap gap-2 pt-1">
                                    <div className="flex items-center space-x-2 text-[11px] font-bold">
                                      {customUserConfigTab === 'standard' && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => setAllAppsForCustomUser(activeCustomUser.id, true)}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                                          >
                                            Todos
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setAllAppsForCustomUser(activeCustomUser.id, false)}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                                          >
                                            Nenhum
                                          </button>
                                        </>
                                      )}
                                      {customUserConfigTab === 'modoProva' && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => setUsers(prev => prev.map(u => u.id === activeCustomUser.id ? { ...u, modoProvaAccess: Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, ['editor', 'calculadora', 'desligar'].includes(id)])) } : u))}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 flex items-center space-x-1 rounded"
                                          >
                                            <Lock size={12} />
                                            <span>Padrão Seguro</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setAllModoProvaAppsForCustomUser(activeCustomUser.id, true)}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                                          >
                                            Todos
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setAllModoProvaAppsForCustomUser(activeCustomUser.id, false)}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                                          >
                                            Nenhum
                                          </button>
                                        </>
                                      )}
                                      {customUserConfigTab === 'modoSala' && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => setUsers(prev => prev.map(u => u.id === activeCustomUser.id ? { ...u, modoSalaAccess: { ...DEFAULT_MODO_SALA_ACCESS } } : u))}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 flex items-center space-x-1 rounded"
                                          >
                                            <BookOpen size={12} />
                                            <span>Restaurar</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setAllModoSalaAppsForCustomUser(activeCustomUser.id, true)}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                                          >
                                            Todos
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setAllModoSalaAppsForCustomUser(activeCustomUser.id, false)}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                                          >
                                            Nenhum
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Grade Aba 1: Apps Liberados */}
                                  {customUserConfigTab === 'standard' && (
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,11.5rem),1fr))] gap-5 sm:gap-6 md:gap-7 lg:gap-8">
                                      {APPS_LIBERADOS_IDS.map(menuId => {
                                        const isAllowed = activeCustomUser.menuAccess?.[menuId] ?? true
                                        return (
                                          <AppToggleButton
                                            key={menuId}
                                            appId={menuId}
                                            label={getRootOptionLabel(menuId)}
                                            isActive={isAllowed}
                                            onToggle={() => toggleAppForCustomUser(activeCustomUser.id, menuId)}
                                            isHighContrast={isHighContrast}
                                            variant="default"
                                          />
                                        )
                                      })}
                                    </div>
                                  )}

                                  {/* Grade Aba 2: Modo Prova */}
                                  {customUserConfigTab === 'modoProva' && (
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,11.5rem),1fr))] gap-5 sm:gap-6 md:gap-7 lg:gap-8">
                                      {ROOT_MENU_ITEM_IDS.filter(id => id !== 'modoProvaRoot' && id !== 'modoSalaRoot' && id !== 'settingsEntry').map(menuId => {
                                        const isAllowed = activeCustomUser.modoProvaAccess?.[menuId] ?? DEFAULT_MODO_PROVA_ACCESS[menuId] ?? false
                                        return (
                                          <AppToggleButton
                                            key={menuId}
                                            appId={menuId}
                                            label={getRootOptionLabel(menuId)}
                                            isActive={isAllowed}
                                            onToggle={() => toggleModoProvaAppForCustomUser(activeCustomUser.id, menuId)}
                                            isHighContrast={isHighContrast}
                                            variant="prova"
                                          />
                                        )
                                      })}
                                    </div>
                                  )}

                                  {/* Grade Aba 3: Modo Sala de Aula */}
                                  {customUserConfigTab === 'modoSala' && (
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,11.5rem),1fr))] gap-5 sm:gap-6 md:gap-7 lg:gap-8">
                                      {ROOT_MENU_ITEM_IDS.filter(id => id !== 'modoProvaRoot' && id !== 'modoSalaRoot' && id !== 'settingsEntry').map(menuId => {
                                        const isAllowed = activeCustomUser.modoSalaAccess?.[menuId] ?? DEFAULT_MODO_SALA_ACCESS[menuId] ?? true
                                        return (
                                          <AppToggleButton
                                            key={menuId}
                                            appId={menuId}
                                            label={getRootOptionLabel(menuId)}
                                            isActive={isAllowed}
                                            onToggle={() => toggleModoSalaAppForCustomUser(activeCustomUser.id, menuId)}
                                            isHighContrast={isHighContrast}
                                            variant="sala"
                                          />
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                          </>
                        ) : (
                          /* Formulário de Edição do Usuário */
                          selectedUserToEdit && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between mb-4 pb-3 border-b border-inherit">
                                <div>
                                  <h3 className="text-base font-bold">Editar Usuário: {selectedUserToEdit.name}</h3>
                                  <InfoTip isHighContrast={isHighContrast}>Altere dados cadastrais e permissões individuais.</InfoTip>
                                </div>
                                <button
                                  onClick={() => setUserManagementView('list')}
                                  className="px-3 py-1.5 text-xs font-bold border border-inherit hover:opacity-80"
                                >
                                  Voltar para Lista
                                </button>
                              </div>

                              <div className="space-y-4 max-w-2xl">
                                <div>
                                  <label className="block text-xs font-bold uppercase opacity-80 mb-1">Nome do Usuário</label>
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-inherit bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#002554]"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-bold uppercase opacity-80 mb-1">Nova Senha (opcional)</label>
                                    <div className="relative">
                                      <input
                                        type={showEditUserPassword ? 'text' : 'password'}
                                        value={editPassword}
                                        onChange={e => setEditPassword(e.target.value)}
                                        placeholder="Deixe em branco para manter a atual"
                                        className={`w-full px-3.5 py-2.5 ${editPassword ? 'pr-10' : 'pr-3.5'} border border-inherit bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#002554]`}
                                      />
                                      {editPassword.length > 0 && (
                                        <button
                                          type="button"
                                          onClick={() => setShowEditUserPassword(prev => !prev)}
                                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-800 transition-colors"
                                          title={showEditUserPassword ? 'Ocultar senha' : 'Ver senha'}
                                        >
                                          {showEditUserPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-bold uppercase opacity-80 mb-1">Perfil</label>
                                    <select
                                      value={editRole}
                                      onChange={e => setEditRole(e.target.value)}
                                      className="w-full px-3.5 py-2.5 border border-inherit bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#002554]"
                                    >
                                      <option value="Usuário">Usuário (Aluno)</option>
                                      <option value="Administrativo">Administrativo (Professor)</option>
                                      {currentUser?.role === 'Suporte' && <option value="Suporte">Suporte Técnico</option>}
                                    </select>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-inherit space-y-3">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex-nowrap portrait:flex-wrap gap-1 shadow-xs">
                                      <button
                                        type="button"
                                        onClick={() => setEditUserTab('standard')}
                                        className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                          editUserTab === 'standard'
                                            ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] shadow-sm' : 'bg-white text-[#002554] shadow-xs')
                                            : 'opacity-70 hover:opacity-100 hover:bg-white/50'
                                        }`}
                                      >
                                        <LayoutGrid size={14} />
                                        <span>Apps Liberados</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setEditUserTab('modoProva')}
                                        className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                          editUserTab === 'modoProva'
                                            ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] shadow-sm' : 'bg-white text-[#002554] shadow-xs')
                                            : 'opacity-70 hover:opacity-100 hover:bg-white/50'
                                        }`}
                                      >
                                        <GraduationCap size={14} />
                                        <span>Modo Prova</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setEditUserTab('modoSala')}
                                        className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                          editUserTab === 'modoSala'
                                            ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] shadow-sm' : 'bg-white text-[#002554] shadow-xs')
                                            : 'opacity-70 hover:opacity-100 hover:bg-white/50'
                                        }`}
                                      >
                                        <BookOpen size={14} />
                                        <span>Sala de Aula</span>
                                      </button>
                                    </div>

                                    <div className="flex items-center space-x-2 text-[11px] font-bold">
                                      {editUserTab === 'standard' && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => setEditUserMenuAccess({ ...DEFAULT_MENU_ACCESS })}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                                          >
                                            Restaurar
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditUserMenuAccess(Object.fromEntries(APPS_LIBERADOS_IDS.map(id => [id, true])))}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                                          >
                                            Todos
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditUserMenuAccess(Object.fromEntries(APPS_LIBERADOS_IDS.map(id => [id, false])))}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                                          >
                                            Nenhum
                                          </button>
                                        </>
                                      )}
                                      {editUserTab === 'modoProva' && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => setEditUserModoProvaAccess(Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, ['editor', 'calculadora', 'desligar'].includes(id)])))}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 flex items-center space-x-1 rounded"
                                          >
                                            <Lock size={12} />
                                            <span>Padrão Seguro</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditUserModoProvaAccess(Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, true])))}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                                          >
                                            Todos
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditUserModoProvaAccess(Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, false])))}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                                          >
                                            Nenhum
                                          </button>
                                        </>
                                      )}
                                      {editUserTab === 'modoSala' && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => setEditUserModoSalaAccess({ ...DEFAULT_MODO_SALA_ACCESS })}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 flex items-center space-x-1 rounded"
                                          >
                                            <BookOpen size={12} />
                                            <span>Restaurar</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditUserModoSalaAccess(Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, true])))}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                                          >
                                            Todos
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditUserModoSalaAccess(Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, false])))}
                                            className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                                          >
                                            Nenhum
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <InfoTip isHighContrast={isHighContrast}>
{editUserTab === 'standard' && 'Estes aplicativos estarão disponíveis no menu principal do Liber em uso padrão.'}
                                    {editUserTab === 'modoProva' && 'Aplicativos autorizados quando este aluno estiver em Modo Prova.'}
                                    {editUserTab === 'modoSala' && 'Aplicativos didáticos liberados para este aluno durante as aulas regulares.'}
</InfoTip>

                                  {editUserTab === 'standard' && (
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,11.5rem),1fr))] gap-4 sm:gap-5 md:gap-6 p-2.5 border rounded-xl border-inherit bg-slate-50/50 dark:bg-slate-900/30">
                                      {APPS_LIBERADOS_IDS.map(menuId => {
                                        const isChecked = editUserMenuAccess[menuId] ?? true
                                        return (
                                          <AppToggleButton
                                            key={menuId}
                                            appId={menuId}
                                            label={getRootOptionLabel(menuId)}
                                            isActive={isChecked}
                                            onToggle={() => setEditUserMenuAccess(prev => ({ ...prev, [menuId]: !prev[menuId] }))}
                                            isHighContrast={isHighContrast}
                                            variant="default"
                                          />
                                        )
                                      })}
                                    </div>
                                  )}

                                  {editUserTab === 'modoProva' && (
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,11.5rem),1fr))] gap-4 sm:gap-5 md:gap-6 p-2.5 border rounded-xl border-inherit bg-amber-50/30 dark:bg-amber-950/10">
                                      {ROOT_MENU_ITEM_IDS.filter(id => id !== 'modoProvaRoot' && id !== 'modoSalaRoot' && id !== 'settingsEntry').map(menuId => {
                                        const isChecked = editUserModoProvaAccess[menuId] ?? DEFAULT_MODO_PROVA_ACCESS[menuId] ?? false
                                        return (
                                          <AppToggleButton
                                            key={menuId}
                                            appId={menuId}
                                            label={getRootOptionLabel(menuId)}
                                            isActive={isChecked}
                                            onToggle={() => setEditUserModoProvaAccess(prev => ({ ...prev, [menuId]: !(prev[menuId] ?? DEFAULT_MODO_PROVA_ACCESS[menuId] ?? false) }))}
                                            isHighContrast={isHighContrast}
                                            variant="prova"
                                          />
                                        )
                                      })}
                                    </div>
                                  )}

                                  {editUserTab === 'modoSala' && (
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,11.5rem),1fr))] gap-4 sm:gap-5 md:gap-6 p-2.5 border rounded-xl border-inherit bg-emerald-50/30 dark:bg-emerald-950/10">
                                      {ROOT_MENU_ITEM_IDS.filter(id => id !== 'modoProvaRoot' && id !== 'modoSalaRoot' && id !== 'settingsEntry').map(menuId => {
                                        const isChecked = editUserModoSalaAccess[menuId] ?? DEFAULT_MODO_SALA_ACCESS[menuId] ?? true
                                        return (
                                          <AppToggleButton
                                            key={menuId}
                                            appId={menuId}
                                            label={getRootOptionLabel(menuId)}
                                            isActive={isChecked}
                                            onToggle={() => setEditUserModoSalaAccess(prev => ({ ...prev, [menuId]: !(prev[menuId] ?? DEFAULT_MODO_SALA_ACCESS[menuId] ?? true) }))}
                                            isHighContrast={isHighContrast}
                                            variant="sala"
                                          />
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>

                                <div className="pt-4 flex items-center space-x-3 flex-nowrap portrait:flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUsers(prev => prev.map(u => {
                                        if (u.id === selectedUserToEdit.id) {
                                          return {
                                            ...u,
                                            name: editName.trim() || u.name,
                                            password: editPassword.trim() || u.password,
                                            role: editRole,
                                            menuAccess: { ...editUserMenuAccess },
                                            modoProvaAccess: { ...editUserModoProvaAccess },
                                            modoSalaAccess: { ...editUserModoSalaAccess }
                                          }
                                        }
                                        return u
                                      }))
                                      setPopupMessage(`Usuário "${editName}" atualizado com sucesso!`)
                                      setUserManagementView('list')
                                    }}
                                    className={`px-6 py-2.5 font-bold text-xs ${themeStyles.primaryBtn}`}
                                  >
                                    Salvar Alterações
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUsers(prev => prev.map(u => u.id === selectedUserToEdit.id ? { ...u, password: DEFAULT_PASSWORD } : u))
                                      setPopupMessage(`Senha de "${selectedUserToEdit.name}" redefinida para ${DEFAULT_PASSWORD}.`)
                                    }}
                                    className="px-3.5 py-2.5 font-bold text-xs border border-inherit hover:opacity-80"
                                  >
                                    Redefinir Senha ({DEFAULT_PASSWORD})
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setUserManagementView('list')}
                                    className="px-4 py-2.5 font-bold text-xs border border-inherit hover:opacity-80"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                          </div>
                        )}
                      </div>

                    {/* 2. PAINEL DE APLICATIVOS DO PERFIL ATIVO (Apps Liberados, Modo Prova, Modo Sala) */}
                    {!selectedCustomUserId && (
                      <div id="section-apps" className={`p-5 sm:p-7 border ${themeStyles.card} [--section-accent:#2563eb] space-y-4 scroll-mt-6`}>
                        {/* Barra Superior de Abas */}
                        <div className="flex flex-col landscape:flex-row landscape:items-center sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-inherit">
                          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex-nowrap portrait:flex-wrap gap-1 shadow-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setProfileConfigTab('standard')
                                setActiveNavSection('appsLiberados')
                              }}
                              className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${profileConfigTab === 'standard'
                                ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] shadow-sm' : 'bg-white text-[#002554] shadow-xs')
                                : 'opacity-70 hover:opacity-100 hover:bg-white/50'
                                }`}
                            >
                              <LayoutGrid size={15} />
                              <span>Apps Liberados</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setProfileConfigTab('modoProva')
                                setActiveNavSection('modoProva')
                              }}
                              className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${profileConfigTab === 'modoProva'
                                ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] shadow-sm' : 'bg-white text-[#002554] shadow-xs')
                                : 'opacity-70 hover:opacity-100 hover:bg-white/50'
                                }`}
                            >
                              <GraduationCap size={15} />
                              <span>Modo Prova</span>
                              <span
                                className={`w-2 h-2 rounded-full inline-block ${isModoProvaActive ? 'bg-amber-500 shadow-amber-500/50 shadow-sm animate-pulse' : 'bg-slate-300 dark:bg-slate-600'
                                  }`}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setProfileConfigTab('modoSala')
                                setActiveNavSection('modoSala')
                              }}
                              className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${profileConfigTab === 'modoSala'
                                ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] shadow-sm' : 'bg-white text-[#002554] shadow-xs')
                                : 'opacity-70 hover:opacity-100 hover:bg-white/50'
                                }`}
                            >
                              <BookOpen size={15} />
                              <span>Sala de Aula</span>
                              <span
                                className={`w-2 h-2 rounded-full inline-block ${isModoSalaActive ? 'bg-emerald-500 shadow-emerald-500/50 shadow-sm animate-pulse' : 'bg-slate-300 dark:bg-slate-600'
                                  }`}
                              />
                            </button>
                          </div>

                          {/* Perfil Badge */}
                          <div className="flex items-center space-x-2 text-xs shrink-0 whitespace-nowrap">
                            <span className="opacity-60 font-medium">Perfil:</span>
                            <span className={`font-bold px-3 py-1 rounded-full shadow-xs ${isHighContrast ? 'bg-[#0000FF] text-[#FFFF00]' : 'bg-[#002554]/10 text-[#002554] border border-[#002554]/20'}`}>
                              {currentProfileName}
                            </span>
                          </div>
                        </div>

                        {/* CONTEÚDO DA ABA 1: APPS LIBERADOS (PADRÃO) */}
                        {profileConfigTab === 'standard' && (
                          <div className="space-y-4 pt-1">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold opacity-80">
                                    Apps liberados ({currentProfileName})
                                  </h4>
                                  <InfoTip isHighContrast={isHighContrast}>Estes aplicativos estarão disponíveis no menu principal do Liber em uso padrão.</InfoTip>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 shrink-0 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const standard = DEFAULT_PROFILE_APPS[activeProfile] || DEFAULT_MENU_ACCESS
                                    setProfileApps(prev => ({ ...prev, [activeProfile]: { ...standard } }))
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold border border-inherit hover:opacity-80 bg-slate-100/60 dark:bg-slate-800/60 transition-all rounded"
                                >
                                  Restaurar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const all = Object.fromEntries(APPS_LIBERADOS_IDS.map(id => [id, true]))
                                    setProfileApps(prev => ({ ...prev, [activeProfile]: all }))
                                  }}
                                  className="px-2.5 py-1.5 text-xs font-bold border border-inherit hover:opacity-80 transition-opacity rounded"
                                >
                                  Todos
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,11.5rem),1fr))] gap-5 sm:gap-6 md:gap-7 lg:gap-8">
                              {APPS_LIBERADOS_IDS.map(menuId => {
                                const isAllowed = profileApps[activeProfile]?.[menuId] ?? true
                                return (
                                  <AppToggleButton
                                    key={menuId}
                                    appId={menuId}
                                    label={getRootOptionLabel(menuId)}
                                    isActive={isAllowed}
                                    onToggle={() => toggleAppForProfile(menuId)}
                                    isHighContrast={isHighContrast}
                                    variant="default"
                                  />
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* CONTEÚDO DA ABA 2: MODO PROVA */}
                        {profileConfigTab === 'modoProva' && (
                          <div className="space-y-4 pt-1">
                            <div className="flex items-center justify-between gap-3 pb-3 border-b border-inherit flex-wrap">
                              <div className="flex items-center space-x-3">
                                <span className="text-xs font-bold opacity-80">Status do Modo Prova:</span>
                                <button
                                  type="button"
                                  onClick={() => toggleProfileModoProvaStatus(activeProfile)}
                                  aria-label="Alternar Modo Prova"
                                  title={isModoProvaActive ? `Modo Prova Ativado - Clique para desativar` : `Modo Prova Desativado - Clique para ativar`}
                                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isModoProvaActive
                                    ? (isHighContrast ? 'bg-[#0000FF]' : 'bg-emerald-600')
                                    : 'bg-slate-300 dark:bg-slate-700'
                                    }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${isModoProvaActive ? 'translate-x-5' : 'translate-x-0'
                                      }`}
                                  />
                                </button>
                                <span className={`text-xs font-semibold ${isModoProvaActive ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-60'}`}>
                                  {isModoProvaActive ? 'Ativado' : 'Desativado'}
                                </span>
                              </div>

                              {/* Toggles de Conexão */}
                              <div className="flex items-center gap-2 flex-nowrap portrait:flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = profileModoProva[activeProfile]?.wifi ?? 'Desligado'
                                    setProfileModoProvaWifi(activeProfile, current === 'Ativado' ? 'Desligado' : 'Ativado')
                                  }}
                                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-bold border rounded transition-all ${(profileModoProva[activeProfile]?.wifi ?? 'Desligado') === 'Ativado'
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                    : 'border-rose-200 bg-rose-50/70 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                    }`}
                                >
                                  <Wifi size={14} />
                                  <span>Wi-Fi: {(profileModoProva[activeProfile]?.wifi ?? 'Desligado') === 'Ativado' ? 'Liberado' : 'Bloqueado'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = profileModoProva[activeProfile]?.bluetooth ?? 'Desligado'
                                    setProfileModoProvaBt(activeProfile, current === 'Ativado' ? 'Desligado' : 'Ativado')
                                  }}
                                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-bold border rounded transition-all ${(profileModoProva[activeProfile]?.bluetooth ?? 'Desligado') === 'Ativado'
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                    : 'border-rose-200 bg-rose-50/70 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                    }`}
                                >
                                  <Bluetooth size={14} />
                                  <span>Bluetooth: {(profileModoProva[activeProfile]?.bluetooth ?? 'Desligado') === 'Ativado' ? 'Liberado' : 'Bloqueado'}</span>
                                </button>
                              </div>

                              {/* Ações de Prova */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const standard = Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, ['editor', 'calculadora', 'desligar'].includes(id)]))
                                    setProfileModoProva(prev => ({
                                      ...prev,
                                      [activeProfile]: {
                                        ...(prev[activeProfile] || DEFAULT_PROFILE_MODO_PROVA[activeProfile]),
                                        apps: standard
                                      }
                                    }))
                                    setPopupMessage('Padrão seguro de prova aplicado.')
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold border border-inherit hover:opacity-80 bg-slate-100/60 dark:bg-slate-800/60 transition-all flex items-center space-x-1.5 rounded"
                                >
                                  <Lock size={13} />
                                  <span>Padrão Seguro</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const all = Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, true]))
                                    setProfileModoProva(prev => ({
                                      ...prev,
                                      [activeProfile]: {
                                        ...(prev[activeProfile] || DEFAULT_PROFILE_MODO_PROVA[activeProfile]),
                                        apps: all
                                      }
                                    }))
                                  }}
                                  className="px-2.5 py-1.5 text-xs font-bold border border-inherit hover:opacity-80 transition-opacity rounded"
                                >
                                  Todos
                                </button>
                              </div>
                            </div>

                            {/* Grade de Apps da Prova */}
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,11.5rem),1fr))] gap-5 sm:gap-6 md:gap-7 lg:gap-8 pt-1">
                              {ROOT_MENU_ITEM_IDS.filter(id => id !== 'modoProvaRoot' && id !== 'modoSalaRoot' && id !== 'settingsEntry').map(menuId => {
                                const isAllowed = profileModoProva[activeProfile]?.apps?.[menuId] ?? DEFAULT_PROFILE_MODO_PROVA[activeProfile]?.apps?.[menuId] ?? false
                                return (
                                  <AppToggleButton
                                    key={menuId}
                                    appId={menuId}
                                    label={getRootOptionLabel(menuId)}
                                    isActive={isAllowed}
                                    onToggle={() => toggleAppForProfileModoProva(activeProfile, menuId)}
                                    isHighContrast={isHighContrast}
                                    variant="prova"
                                  />
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* CONTEÚDO DA ABA 3: MODO SALA DE AULA */}
                        {profileConfigTab === 'modoSala' && (
                          <div className="space-y-4 pt-1">
                            <div className="flex items-center justify-between gap-3 pb-3 border-b border-inherit flex-wrap">
                              <div className="flex items-center space-x-3">
                                <span className="text-xs font-bold opacity-80">Status do Modo Sala:</span>
                                <button
                                  type="button"
                                  onClick={() => toggleProfileModoSalaStatus(activeProfile)}
                                  aria-label="Alternar Modo Sala de Aula"
                                  title={isModoSalaActive ? `Modo Sala Ativado - Clique para desativar` : `Modo Sala Desativado - Clique para ativar`}
                                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isModoSalaActive
                                    ? (isHighContrast ? 'bg-[#0000FF]' : 'bg-emerald-600')
                                    : 'bg-slate-300 dark:bg-slate-700'
                                    }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${isModoSalaActive ? 'translate-x-5' : 'translate-x-0'
                                      }`}
                                  />
                                </button>
                                <span className={`text-xs font-semibold ${isModoSalaActive ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-60'}`}>
                                  {isModoSalaActive ? 'Ativado' : 'Desativado'}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const standard = DEFAULT_PROFILE_MODO_SALA[activeProfile]?.apps || DEFAULT_MODO_SALA_ACCESS
                                    setProfileModoSala(prev => ({
                                      ...prev,
                                      [activeProfile]: {
                                        ...(prev[activeProfile] || DEFAULT_PROFILE_MODO_SALA[activeProfile]),
                                        apps: { ...standard }
                                      }
                                    }))
                                    setPopupMessage('Padrão didático do perfil restaurado.')
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold border border-inherit hover:opacity-80 bg-slate-100/60 dark:bg-slate-800/60 transition-all flex items-center space-x-1.5 rounded"
                                >
                                  <BookOpen size={13} />
                                  <span>Restaurar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const all = Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, true]))
                                    setProfileModoSala(prev => ({
                                      ...prev,
                                      [activeProfile]: {
                                        ...(prev[activeProfile] || DEFAULT_PROFILE_MODO_SALA[activeProfile]),
                                        apps: all
                                      }
                                    }))
                                  }}
                                  className="px-2.5 py-1.5 text-xs font-bold border border-inherit hover:opacity-80 transition-opacity rounded"
                                >
                                  Todos
                                </button>
                              </div>
                            </div>

                            {/* Grade de Apps da Sala */}
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,11.5rem),1fr))] gap-5 sm:gap-6 md:gap-7 lg:gap-8 pt-1">
                              {ROOT_MENU_ITEM_IDS.filter(id => id !== 'modoProvaRoot' && id !== 'modoSalaRoot' && id !== 'settingsEntry').map(menuId => {
                                const isAllowed = profileModoSala[activeProfile]?.apps?.[menuId] ?? DEFAULT_PROFILE_MODO_SALA[activeProfile]?.apps?.[menuId] ?? true
                                return (
                                  <AppToggleButton
                                    key={menuId}
                                    appId={menuId}
                                    label={getRootOptionLabel(menuId)}
                                    isActive={isAllowed}
                                    onToggle={() => toggleAppForProfileModoSala(activeProfile, menuId)}
                                    isHighContrast={isHighContrast}
                                    variant="sala"
                                  />
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>


              {/* 5. SEÇÃO DE CONFIGURAÇÕES GERAIS / PREFERÊNCIAS */}
              <section id="section-settings" className="scroll-mt-4">
                <div className={`p-5 sm:p-7 border ${themeStyles.card} [--section-accent:#002554]`}>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-inherit">Preferências Gerais do Sistema</h3>

                  <SettingsPanel
                    values={settingsValues}
                    onSet={setSetting}
                    onApply={applySettingsChanges}
                    notify={setPopupMessage}
                    isHighContrast={isHighContrast}
                    presetName={currentProfileName}
                    presetNote={PRESET_NOTES[activeProfile] ?? 'Perfil personalizado: usa os padrões do produto até você ajustar.'}
                    onResetPreset={resetPreset}
                    open={settingsOpen}
                    onToggle={toggleSettingsNode}
                    onSetAll={setAllSettingsOpen}
                    highlightId={settingsHighlightId}
                  />
                </div>
              </section>

              {/* 6. SEÇÃO MUDAR SENHA ADMINISTRATIVA */}
              <section id="section-admin-password" className="scroll-mt-6">
                <div className={`p-5 sm:p-7 border ${themeStyles.card} [--section-accent:#64748b] transition-all`}>
                  {/* Cabeçalho Acordeão de Mudar Senha */}
                  <div
                    onClick={() => setIsAdminPasswordExpanded(prev => !prev)}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                      isAdminPasswordExpanded ? 'pb-4 border-b border-inherit' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${
                        isHighContrast 
                          ? 'bg-[#0000FF] text-[#FFFF00]' 
                          : 'bg-[#002554]/10 text-[#002554] dark:bg-blue-500/20 dark:text-blue-300'
                      }`}>
                        <KeyRound size={20} />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-1">
                          <h3 className="text-base font-bold text-[#002554] dark:text-blue-300">
                            Mudar Senha Administrativa
                          </h3>
                          <InfoTip isHighContrast={isHighContrast}>Atualize a credencial mestra usada para desbloquear e configurar os recursos administrativos do Liber ADM.</InfoTip>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-wrap gap-1.5" onClick={e => e.stopPropagation()}>
                      {/* Botão de Toggle do Acordeão */}
                      <button
                        type="button"
                        onClick={() => setIsAdminPasswordExpanded(prev => !prev)}
                        className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold border rounded-xl transition-all ${
                          isHighContrast
                            ? 'border-[#0000FF] bg-[#FFFF00] text-[#0000FF] hover:bg-[#0000FF] hover:text-[#FFFF00]'
                            : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                        title={isAdminPasswordExpanded ? 'Recolher menu de senha' : 'Expandir menu de senha'}
                      >
                        <span className="text-xs">{isAdminPasswordExpanded ? 'Recolher' : 'Expandir'}</span>
                        {isAdminPasswordExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Conteúdo Expandido */}
                  {isAdminPasswordExpanded && (
                    <div className="pt-4">
                      <form
                        onSubmit={e => {
                          e.preventDefault()
                          handleUpdateAdminPassword()
                        }}
                        className="max-w-md space-y-3.5"
                      >
                        <div>
                          <label className="block text-xs font-bold uppercase opacity-80 mb-1">Senha Atual</label>
                          <div className="relative">
                            <input
                              type={showCurrentAdminPassword ? 'text' : 'password'}
                              value={currentAdminPasswordInput}
                              onChange={e => {
                                setCurrentAdminPasswordInput(e.target.value)
                                setAdminPasswordMsg(null)
                              }}
                              placeholder="Digite a senha administrativa atual"
                              className={`w-full px-3.5 py-2.5 ${currentAdminPasswordInput ? 'pr-10' : 'pr-3.5'} border border-inherit bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#002554]`}
                              required
                            />
                            {currentAdminPasswordInput.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setShowCurrentAdminPassword(prev => !prev)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-800 transition-colors"
                                title={showCurrentAdminPassword ? 'Ocultar senha' : 'Ver senha'}
                              >
                                {showCurrentAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase opacity-80 mb-1">Nova Senha</label>
                          <div className="relative">
                            <input
                              type={showNewAdminPassword ? 'text' : 'password'}
                              value={newAdminPasswordInput}
                              onChange={e => {
                                setNewAdminPasswordInput(e.target.value)
                                setAdminPasswordMsg(null)
                              }}
                              placeholder="Digite a nova senha"
                              className={`w-full px-3.5 py-2.5 ${newAdminPasswordInput ? 'pr-10' : 'pr-3.5'} border border-inherit bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#002554]`}
                              required
                            />
                            {newAdminPasswordInput.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setShowNewAdminPassword(prev => !prev)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-800 transition-colors"
                                title={showNewAdminPassword ? 'Ocultar senha' : 'Ver senha'}
                              >
                                {showNewAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase opacity-80 mb-1">Confirmar Nova Senha</label>
                          <div className="relative">
                            <input
                              type={showConfirmAdminPassword ? 'text' : 'password'}
                              value={confirmAdminPasswordInput}
                              onChange={e => {
                                setConfirmAdminPasswordInput(e.target.value)
                                setAdminPasswordMsg(null)
                              }}
                              placeholder="Repita a nova senha"
                              className={`w-full px-3.5 py-2.5 ${confirmAdminPasswordInput ? 'pr-10' : 'pr-3.5'} border border-inherit bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#002554]`}
                              required
                            />
                            {confirmAdminPasswordInput.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setShowConfirmAdminPassword(prev => !prev)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-800 transition-colors"
                                title={showConfirmAdminPassword ? 'Ocultar senha' : 'Ver senha'}
                              >
                                {showConfirmAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            )}
                          </div>
                        </div>

                        {adminPasswordMsg && (
                          <div className={`p-2.5 text-xs font-bold border ${adminPasswordMsg.isError
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                            {adminPasswordMsg.text}
                          </div>
                        )}

                        <div className="pt-2">
                          <button
                            type="submit"
                            className={`px-5 py-2.5 font-bold text-xs ${themeStyles.primaryBtn}`}
                          >
                            Salvar Nova Senha Administrativa
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </section>

              {/* 8. SEÇÃO REDEFINIR PADRÕES DE FÁBRICA (ÚLTIMA) */}
              <section id="section-factory-reset" className="scroll-mt-4">
                <div className={`p-5 sm:p-7 border ${themeStyles.card} [--section-accent:#e11d48] space-y-3`}>
                  <div className="flex items-center space-x-2 pb-2 border-b border-inherit">
                    <RotateCcw size={17} className="text-rose-600 flex-shrink-0" />
                    <h3 className="text-sm font-bold text-rose-700">Padrões de Fábrica</h3>
                  </div>

                  <p className="text-xs opacity-75">
                    Restaura o sistema, perfis e usuários para as configurações originais. <strong className="text-rose-600 dark:text-rose-400 font-bold">(Implica em perda de dados)</strong>
                  </p>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowFactoryResetModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all"
                    >
                      <RotateCcw size={14} />
                      <span>Redefinir</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </main>

          {/* Modal Dedicado para Criação de Novo Usuário / Aluno */}
          {showCreateUserModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
              <div className={`border-2 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl ${isHighContrast
                ? 'bg-[#FFFF00] border-4 border-[#0000FF] text-[#0000FF]'
                : 'bg-white border-[#002554] text-slate-800'
                }`}>
                {/* Header do Modal */}
                <div className={`p-4 sm:p-5 border-b flex items-center justify-between flex-shrink-0 ${isHighContrast ? 'border-[#0000FF] bg-[#0000FF] text-[#FFFF00]' : 'border-slate-200 bg-[#002554]/5'
                  }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 flex items-center justify-center font-bold ${isHighContrast ? 'bg-[#FFFF00] text-[#0000FF]' : 'bg-[#002554] text-white'
                      }`}>
                      <Users size={18} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold leading-tight">Cadastrar Novo Usuário / Aluno</h4>
                      <p className="text-[11px] opacity-75 mt-0.5">Defina o nome, permissão e aplicativos permitidos</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCreateUserModal(false)}
                    className="p-1.5 hover:opacity-75 transition-opacity"
                    title="Fechar"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Corpo do Modal */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
                  <div>
                    <label className="block text-xs font-bold uppercase opacity-80 mb-1">
                      Nome do Usuário / Aluno *
                    </label>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={e => setNewUserName(e.target.value)}
                      placeholder="Ex: Lucas Gabriel, Maria Eduarda..."
                      autoFocus
                      className={`w-full px-3.5 py-2.5 border text-sm font-semibold focus:outline-none ${isHighContrast
                        ? 'border-[#0000FF] bg-[#FFFF00] text-[#0000FF] focus:ring-2 focus:ring-[#0000FF]'
                        : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#002554] focus:border-[#002554]'
                        }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold uppercase opacity-80 mb-1">
                        Senha de Acesso
                      </label>
                      <div className="relative">
                        <input
                          type={showNewUserPassword ? 'text' : 'password'}
                          value={newUserPassword}
                          onChange={e => setNewUserPassword(e.target.value)}
                          placeholder={`Padrão: ${DEFAULT_PASSWORD}`}
                          className={`w-full px-3.5 py-2.5 ${newUserPassword ? 'pr-10' : 'pr-3.5'} border text-sm focus:outline-none ${isHighContrast
                            ? 'border-[#0000FF] bg-[#FFFF00] text-[#0000FF] focus:ring-2 focus:ring-[#0000FF]'
                            : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#002554]'
                            }`}
                        />
                        {newUserPassword.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowNewUserPassword(prev => !prev)}
                            className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 transition-colors ${
                              isHighContrast ? 'text-[#0000FF] hover:opacity-75' : 'text-slate-500 hover:text-slate-800'
                            }`}
                            title={showNewUserPassword ? 'Ocultar senha' : 'Ver senha'}
                          >
                            {showNewUserPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase opacity-80 mb-1">
                        Perfil de Permissão
                      </label>
                      <select
                        value={newUserRole}
                        onChange={e => setNewUserRole(e.target.value)}
                        className={`w-full px-3.5 py-2.5 border text-sm font-semibold focus:outline-none ${isHighContrast
                          ? 'border-[#0000FF] bg-[#FFFF00] text-[#0000FF] focus:ring-2 focus:ring-[#0000FF]'
                          : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#002554]'
                          }`}
                      >
                        <option value="Usuário">Usuário (Aluno)</option>
                        <option value="Administrativo">Administrativo (Professor)</option>
                        {currentUser?.role === 'Suporte' && <option value="Suporte">Suporte Técnico</option>}
                      </select>
                    </div>
                  </div>

                  {/* Bloco de Ações Rápidas */}
                  <div className={`p-3.5 sm:p-4 rounded-2xl border space-y-3 ${
                    isHighContrast ? 'border-[#0000FF] bg-[#FFFF00]' : 'border-slate-200/90 bg-slate-50/80 dark:bg-slate-900/40 shadow-xs'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded-lg ${isHighContrast ? 'bg-[#0000FF] text-[#FFFF00]' : 'bg-[#002554]/10 text-[#002554] dark:bg-blue-500/20 dark:text-blue-300'}`}>
                          <Sliders size={15} />
                        </div>
                        <h5 className="text-xs font-bold uppercase tracking-wider">Ações Rápidas</h5>
                      </div>
                      <InfoTip isHighContrast={isHighContrast}>Atalhos de conectividade e predefinição rápida por perfil de acessibilidade.</InfoTip>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      {/* Botão Wi-Fi */}
                      <button
                        type="button"
                        onClick={() => setNewUserWifi(prev => prev === 'Ativado' ? 'Desligado' : 'Ativado')}
                        className={`flex items-center space-x-2 px-3 py-2 text-xs font-bold border rounded-xl transition-all ${
                          newUserWifi === 'Ativado'
                            ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] border-[#0000FF]' : 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-500/60 shadow-xs')
                            : (isHighContrast ? 'bg-[#FFFF00] text-[#0000FF] border-[#0000FF] opacity-60' : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400')
                        }`}
                        title={`Clique para alternar Wi-Fi (${newUserWifi === 'Ativado' ? 'Liberado' : 'Bloqueado'})`}
                      >
                        {newUserWifi === 'Ativado' ? <Wifi size={15} /> : <WifiOff size={15} />}
                        <span>Wi-Fi: {newUserWifi === 'Ativado' ? 'Liberado' : 'Bloqueado'}</span>
                      </button>

                      {/* Botão Bluetooth */}
                      <button
                        type="button"
                        onClick={() => setNewUserBluetooth(prev => prev === 'Ativado' ? 'Desligado' : 'Ativado')}
                        className={`flex items-center space-x-2 px-3 py-2 text-xs font-bold border rounded-xl transition-all ${
                          newUserBluetooth === 'Ativado'
                            ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] border-[#0000FF]' : 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-500/60 shadow-xs')
                            : (isHighContrast ? 'bg-[#FFFF00] text-[#0000FF] border-[#0000FF] opacity-60' : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400')
                        }`}
                        title={`Clique para alternar Bluetooth (${newUserBluetooth === 'Ativado' ? 'Liberado' : 'Bloqueado'})`}
                      >
                        {newUserBluetooth === 'Ativado' ? <Bluetooth size={15} /> : <BluetoothOff size={15} />}
                        <span>Bluetooth: {newUserBluetooth === 'Ativado' ? 'Liberado' : 'Bloqueado'}</span>
                      </button>

                      <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

                      {/* Presets Rápidos por Perfil */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold opacity-70 mr-1">Carregar Perfil:</span>
                        {DISABILITY_PROFILES.filter(p => p.id !== 'custom').map(prof => (
                          <button
                            key={prof.id}
                            type="button"
                            onClick={() => {
                              const apps = DEFAULT_PROFILE_APPS[prof.id] || DEFAULT_MENU_ACCESS
                              const provaApps = DEFAULT_PROFILE_MODO_PROVA[prof.id]?.apps || DEFAULT_MODO_PROVA_ACCESS
                              const salaApps = DEFAULT_PROFILE_MODO_SALA[prof.id]?.apps || DEFAULT_MODO_SALA_ACCESS
                              setNewUserMenuAccess({ ...apps })
                              setNewUserModoProvaAccess({ ...provaApps })
                              setNewUserModoSalaAccess({ ...salaApps })
                              setPopupMessage(`Configurações rápidas do perfil "${prof.name}" carregadas!`)
                            }}
                            className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-bold border rounded-xl transition-all ${
                              isHighContrast
                                ? 'border-[#0000FF] bg-white text-[#0000FF] hover:bg-[#0000FF] hover:text-[#FFFF00]'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-xs'
                            }`}
                            title={`Aplicar configuração padrão de aplicativos do perfil ${prof.name}`}
                          >
                            <img src={prof.icon} alt="" className="w-4 h-4 object-contain" onError={e => e.currentTarget.style.display = 'none'} />
                            <span>{prof.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-inherit space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      {/* Abas idênticas aos perfis */}
                      <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex-nowrap portrait:flex-wrap gap-1 shadow-xs">
                        <button
                          type="button"
                          onClick={() => setNewUserTab('standard')}
                          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            newUserTab === 'standard'
                              ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] shadow-sm' : 'bg-white text-[#002554] shadow-xs')
                              : 'opacity-70 hover:opacity-100 hover:bg-white/50'
                          }`}
                        >
                          <LayoutGrid size={14} />
                          <span>Apps Liberados</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNewUserTab('modoProva')}
                          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            newUserTab === 'modoProva'
                              ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] shadow-sm' : 'bg-white text-[#002554] shadow-xs')
                              : 'opacity-70 hover:opacity-100 hover:bg-white/50'
                          }`}
                        >
                          <GraduationCap size={14} />
                          <span>Modo Prova</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNewUserTab('modoSala')}
                          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            newUserTab === 'modoSala'
                              ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] shadow-sm' : 'bg-white text-[#002554] shadow-xs')
                              : 'opacity-70 hover:opacity-100 hover:bg-white/50'
                          }`}
                        >
                          <BookOpen size={14} />
                          <span>Sala de Aula</span>
                        </button>
                      </div>

                      {/* Botões de Ação Rápida */}
                      <div className="flex items-center space-x-2 text-[11px] font-bold">
                        {newUserTab === 'standard' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setNewUserMenuAccess({ ...DEFAULT_MENU_ACCESS })}
                              className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                            >
                              Restaurar
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewUserMenuAccess(Object.fromEntries(APPS_LIBERADOS_IDS.map(id => [id, true])))}
                              className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                            >
                              Todos
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewUserMenuAccess(Object.fromEntries(APPS_LIBERADOS_IDS.map(id => [id, false])))}
                              className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                            >
                              Nenhum
                            </button>
                          </>
                        )}
                        {newUserTab === 'modoProva' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setNewUserModoProvaAccess(Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, ['editor', 'calculadora', 'desligar'].includes(id)])))}
                              className="px-2.5 py-1 border border-inherit hover:opacity-80 flex items-center space-x-1 rounded"
                            >
                              <Lock size={12} />
                              <span>Padrão Seguro</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewUserModoProvaAccess(Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, true])))}
                              className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                            >
                              Todos
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewUserModoProvaAccess(Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, false])))}
                              className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                            >
                              Nenhum
                            </button>
                          </>
                        )}
                        {newUserTab === 'modoSala' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setNewUserModoSalaAccess({ ...DEFAULT_MODO_SALA_ACCESS })}
                              className="px-2.5 py-1 border border-inherit hover:opacity-80 flex items-center space-x-1 rounded"
                            >
                              <BookOpen size={12} />
                              <span>Restaurar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewUserModoSalaAccess(Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, true])))}
                              className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                            >
                              Todos
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewUserModoSalaAccess(Object.fromEntries(ROOT_MENU_ITEM_IDS.map(id => [id, false])))}
                              className="px-2.5 py-1 border border-inherit hover:opacity-80 rounded"
                            >
                              Nenhum
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <InfoTip isHighContrast={isHighContrast}>
{newUserTab === 'standard' && 'Estes aplicativos estarão disponíveis no menu principal do Liber em uso padrão.'}
                      {newUserTab === 'modoProva' && 'Aplicativos autorizados quando este aluno estiver em Modo Prova.'}
                      {newUserTab === 'modoSala' && 'Aplicativos didáticos liberados para este aluno durante as aulas regulares.'}
</InfoTip>

                    {/* Grade Aba 1: Apps Liberados */}
                    {newUserTab === 'standard' && (
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,11.5rem),1fr))] gap-4 sm:gap-5 md:gap-6 p-2.5 border rounded-xl border-inherit bg-slate-50/50 dark:bg-slate-900/30">
                        {APPS_LIBERADOS_IDS.map(menuId => {
                          const isChecked = newUserMenuAccess[menuId] ?? true
                          return (
                            <AppToggleButton
                              key={menuId}
                              appId={menuId}
                              label={getRootOptionLabel(menuId)}
                              isActive={isChecked}
                              onToggle={() => setNewUserMenuAccess(prev => ({ ...prev, [menuId]: !prev[menuId] }))}
                              isHighContrast={isHighContrast}
                              variant="default"
                            />
                          )
                        })}
                      </div>
                    )}

                    {/* Grade Aba 2: Modo Prova */}
                    {newUserTab === 'modoProva' && (
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,11.5rem),1fr))] gap-4 sm:gap-5 md:gap-6 p-2.5 border rounded-xl border-inherit bg-amber-50/30 dark:bg-amber-950/10">
                        {ROOT_MENU_ITEM_IDS.filter(id => id !== 'modoProvaRoot' && id !== 'modoSalaRoot' && id !== 'settingsEntry').map(menuId => {
                          const isChecked = newUserModoProvaAccess[menuId] ?? DEFAULT_MODO_PROVA_ACCESS[menuId] ?? false
                          return (
                            <AppToggleButton
                              key={menuId}
                              appId={menuId}
                              label={getRootOptionLabel(menuId)}
                              isActive={isChecked}
                              onToggle={() => setNewUserModoProvaAccess(prev => ({ ...prev, [menuId]: !(prev[menuId] ?? DEFAULT_MODO_PROVA_ACCESS[menuId] ?? false) }))}
                              isHighContrast={isHighContrast}
                              variant="prova"
                            />
                          )
                        })}
                      </div>
                    )}

                    {/* Grade Aba 3: Modo Sala de Aula */}
                    {newUserTab === 'modoSala' && (
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,11.5rem),1fr))] gap-4 sm:gap-5 md:gap-6 p-2.5 border rounded-xl border-inherit bg-emerald-50/30 dark:bg-emerald-950/10">
                        {ROOT_MENU_ITEM_IDS.filter(id => id !== 'modoProvaRoot' && id !== 'modoSalaRoot' && id !== 'settingsEntry').map(menuId => {
                          const isChecked = newUserModoSalaAccess[menuId] ?? DEFAULT_MODO_SALA_ACCESS[menuId] ?? true
                          return (
                            <AppToggleButton
                              key={menuId}
                              appId={menuId}
                              label={getRootOptionLabel(menuId)}
                              isActive={isChecked}
                              onToggle={() => setNewUserModoSalaAccess(prev => ({ ...prev, [menuId]: !(prev[menuId] ?? DEFAULT_MODO_SALA_ACCESS[menuId] ?? true) }))}
                              isHighContrast={isHighContrast}
                              variant="sala"
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer do Modal */}
                <div className={`p-4 sm:px-6 border-t flex items-center justify-end space-x-3 flex-shrink-0 ${isHighContrast ? 'border-[#0000FF] bg-[#FFFF00]' : 'border-slate-200 bg-slate-50'
                  }`}>
                  <button
                    type="button"
                    onClick={() => setShowCreateUserModal(false)}
                    className="px-4 py-2 text-xs font-bold border border-slate-300 hover:bg-slate-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewUser}
                    className={`px-5 py-2 text-xs font-bold shadow-sm transition-all ${themeStyles.primaryBtn}`}
                  >
                    Cadastrar Usuário
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirmação ao sair do Modo ADM */}
          {showExitModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
              onKeyDown={e => { if (e.key === 'Escape') setShowExitModal(false) }}
              onClick={() => setShowExitModal(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="exit-modal-title"
                onClick={e => e.stopPropagation()}
                className={`w-full max-w-md space-y-5 p-6 sm:p-7 shadow-2xl ${isHighContrast ? 'border-4 border-[#0000FF] bg-[#FFFF00] text-[#0000FF]' : 'rounded-3xl bg-white text-slate-800'}`}
              >
                <div>
                  <h4 id="exit-modal-title" className="text-lg font-extrabold">Sair do Modo ADM</h4>
                  <p className="mt-1.5 text-sm leading-relaxed opacity-80">
                    Você quer apenas sair do menu Modo ADM ou também deslogar do usuário{currentUser?.name ? ` ${currentUser.name}` : ''}?
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    autoFocus
                    onClick={exitAdminMode}
                    className={`w-full px-4 py-3 text-sm font-bold transition-colors ${isHighContrast ? 'bg-[#0000FF] text-[#FFFF00]' : 'rounded-xl bg-[#002554] text-white hover:bg-[#001c40]'}`}
                  >
                    Apenas sair do Modo ADM
                  </button>
                  <button
                    type="button"
                    onClick={logoutAndExit}
                    className={`w-full px-4 py-3 text-sm font-bold transition-colors ${isHighContrast ? 'border-2 border-[#0000FF]' : 'rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
                  >
                    Deslogar do usuário
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExitModal(false)}
                    className={`w-full px-4 py-2.5 text-sm font-semibold transition-colors ${isHighContrast ? 'underline' : 'rounded-xl text-slate-600 hover:bg-slate-100'}`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Confirmação para Redefinir Padrões de Fábrica */}
          {showFactoryResetModal && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border-2 border-rose-600 max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-800 dark:text-slate-100">
                <div className="flex items-center space-x-3 text-rose-600 pb-3 border-b border-rose-200 dark:border-rose-900">
                  <AlertTriangle size={24} className="flex-shrink-0" />
                  <h4 className="text-base font-bold">Implica em perda de informações</h4>
                </div>

                <p className="text-xs opacity-85 leading-relaxed">
                  Esta ação apagará permanentemente todas as personalizações de perfis, aplicativos liberados, alunos cadastrados e configurações de sala/prova, restaurando o Liber ADM para a senha e configurações originais da Tecassistiva (senha padrão: <strong>{DEFAULT_PASSWORD}</strong>).
                </p>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-inherit">
                  <button
                    type="button"
                    onClick={() => setShowFactoryResetModal(false)}
                    className="px-4 py-2 text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleFactoryReset}
                    className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
                  >
                    Confirmar Redefinição
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    )
  }

  return (
    <div
      style={deviceColorStyle}
      onContextMenu={e => {
        if (stack.length > 1 && !popupMessage) {
          e.preventDefault()
          goBackDevice()
        }
      }}
      className="w-screen h-screen bg-[color:var(--dev-bg)] font-sans font-bold text-[color:var(--dev-fg)] overflow-hidden"
    >
      <main className="h-full flex flex-col gap-2">
        {['createUserRole', 'editUserRole'].includes(current.id) && (
          <div className="mb-4 text-2xl font-bold border-b-2 border-[color-mix(in_srgb,var(--dev-fg)_30%,transparent)] pb-2">Defina o Perfil:</div>
        )}

        {['createUserMenus', 'editUserMenus'].includes(current.id) && (
          <div className={`mb-4 text-2xl font-bold border-b-2 border-[color-mix(in_srgb,var(--dev-fg)_30%,transparent)] pb-2 px-2 rounded-sm ${current.index === 0 ? 'bg-[color:var(--dev-fg)] text-[color:var(--dev-bg)]' : ''
            }`}>Configurar Apps Ativos:</div>
        )}

        {current.id !== 'reset' && current.id !== 'deleteUserConfirm' && options.length > 0 && (
          <nav ref={navRef} className="flex-1 flex flex-col gap-0.5 overflow-auto no-scrollbar" aria-label={headerText}>
            {options.filter(opt => opt.id !== 'header_apps').map((opt) => {
              const active = opt.id === options[current.index]?.id
              return (
                <div
                  ref={active ? activeOptionRef : null}
                  key={opt.id}
                  role="button"
                  aria-current={active ? 'true' : undefined}
                  onMouseEnter={() => selectOptionById(opt.id)}
                  onClick={() => {
                    selectOptionById(opt.id)
                    executeOption(opt)
                  }}
                  className={`w-full cursor-pointer px-4 py-1.5 rounded-sm flex items-center justify-between ${active ? 'bg-[color:var(--dev-fg)] text-[color:var(--dev-bg)]' : 'bg-transparent text-[color:var(--dev-fg)]'
                    }`}
                >
                  <div className="overflow-hidden whitespace-nowrap truncate text-lg leading-snug">{opt.choices && opt.choiceKey ? `${opt.label}: ${getChoiceValue(opt.choiceKey) ?? opt.choices[0]}` : opt.label}</div>
                  <div className="ml-3 text-xl">{/* icon placeholder */}</div>
                </div>
              )
            })}
          </nav>
        )}

        {current.id === 'createUserName' && (
          <div className="rounded-sm p-4">
            <div className="mb-4 text-2xl">Digite o Nome</div>
            <input
              ref={createUserNameRef}
              aria-label="Nome do novo usuário"
              value={newUserName}
              onChange={e => setNewUserName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.stopPropagation()
                  handleScreenEnter()
                }
              }}
              className="mt-2 w-full rounded-sm border-2 border-white/70 bg-black px-4 py-3 text-xl text-white"
              type="text"
              autoFocus
              placeholder="Digite o nome do novo usuário"
            />
          </div>
        )}





        {current.id === 'createUserPassword' && (
          <div className="rounded-sm p-4">
            <div className="mb-4 text-2xl">Digite a Senha</div>
            <input
              ref={createUserPasswordRef}
              aria-label="Senha do novo usuário"
              value={newUserPassword}
              onChange={e => setNewUserPassword(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.stopPropagation()
                  handleScreenEnter()
                }
              }}
              className="mt-2 w-full rounded-sm border-2 border-white/70 bg-black px-4 py-3 text-xl text-white"
              type="password"
              autoFocus
              placeholder="Digite a senha do novo usuário"
            />
          </div>
        )}

        {current.id === 'createUserConfirm' && (
          <div className="rounded-sm p-4">
            <button
              onClick={createUser}
              className="w-full rounded-sm bg-[color:var(--dev-fg)] px-6 py-4 text-xl text-[color:var(--dev-bg)]"
            >
              Confirmar Criação
            </button>
          </div>
        )}



        {current.id === 'editUserName' && (
          <div className="rounded-sm p-4">
            <div className="mb-4 text-2xl">Editar Nome</div>
            <input
              ref={editUserNameRef}
              aria-label="Nome do usuário"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.stopPropagation()
                  handleScreenEnter()
                }
              }}
              className="mt-2 w-full rounded-sm border-2 border-white/70 bg-black px-4 py-3 text-xl text-white"
              type="text"
              autoFocus
            />
          </div>
        )}

        {current.id.startsWith('cfgt_') && (() => {
          const textItem = findTextSetting(current.id.slice('cfgt_'.length))
          return (
            <div className="rounded-sm p-4">
              <div className="mb-4 text-2xl">{textItem?.label}</div>
              <input
                aria-label={textItem?.label}
                value={settingsTextInput}
                onChange={e => setSettingsTextInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.stopPropagation()
                    handleScreenEnter()
                  }
                }}
                className="mt-2 w-full rounded-sm border-2 border-white/70 bg-black px-4 py-3 text-xl text-white"
                type={textItem?.secret ? 'password' : 'text'}
                autoComplete="off"
                spellCheck={false}
                autoFocus
                placeholder={textItem?.placeholder}
              />
            </div>
          )
        })()}

        {current.id === 'logoutPassword' && (
          <div className="rounded-sm p-4">
            <div className="mb-4 text-2xl">Confirmar Logout</div>
            <input
              aria-label="Senha para deslogar"
              value={logoutPasswordInput}
              onChange={e => setLogoutPasswordInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.stopPropagation()
                  handleScreenEnter()
                }
              }}
              className="mt-2 w-full rounded-sm border-2 border-white/70 bg-black px-4 py-3 text-xl text-white"
              type="password"
              autoFocus
              placeholder="Digite sua senha para confirmar"
            />
          </div>
        )}

        {current.id === 'editUserCurrentPassword' && (
          <div className="rounded-sm p-4">
            <div className="mb-4 text-2xl">Senha Atual</div>
            <input
              aria-label="Senha atual do usuário"
              value={editCurrentPassword}
              onChange={e => setEditCurrentPassword(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.stopPropagation()
                  handleScreenEnter()
                }
              }}
              className="mt-2 w-full rounded-sm border-2 border-white/70 bg-black px-4 py-3 text-xl text-white"
              type="password"
              autoFocus
              placeholder="Digite a senha atual"
            />
          </div>
        )}

        {current.id === 'editUserPassword' && (
          <div className="rounded-sm p-4">
            <div className="mb-4 text-2xl">Nova Senha</div>
            <input
              ref={editUserPasswordRef}
              aria-label="Senha do usuário"
              value={editPassword}
              onChange={e => setEditPassword(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.stopPropagation()
                  handleScreenEnter()
                }
              }}
              className="mt-2 w-full rounded-sm border-2 border-white/70 bg-black px-4 py-3 text-xl text-white"
              type="password"
              autoFocus
              placeholder="Nova senha do usuário"
            />
          </div>
        )}







        {current.id === 'deleteUserConfirm' && (
          <div className="flex-1 flex items-center justify-center p-4 relative z-50">
            <div className="w-full max-w-md rounded-lg border-4 border-[color:var(--dev-fg)] bg-[color:var(--dev-bg)] p-6 text-center text-[color:var(--dev-fg)] shadow-2xl">
              <div className="mb-6 text-3xl font-bold">
                Confirma exclusão do usuário '{users.find(user => user.id === deleteUserId)?.name}'?
              </div>
              <div className="flex flex-col gap-3">
                {options.filter(opt => opt.id !== 'dec_msg').map((opt) => {
                  const active = opt.id === options[current.index]?.id
                  return (
                    <div
                      key={opt.id}
                      className={`w-full px-4 py-4 rounded-sm flex items-center justify-center text-2xl font-bold ${active ? 'bg-[color:var(--dev-fg)] text-[color:var(--dev-bg)]' : 'bg-transparent border-2 border-[color:var(--dev-fg)] text-[color:var(--dev-fg)]'
                        }`}
                    >
                      {opt.label}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}






        {current.id === 'resetPasswordConfirm' && (
          <div className="rounded-sm p-4">
            <div className="mb-4 text-2xl">Confirmar Redefinição</div>
            <div className="mb-4 text-black">Usuário: {users.find(user => user.id === resetUserId)?.name ?? '---'}</div>
            <button
              onClick={resetPassword}
              className="w-full rounded-sm bg-[color:var(--dev-fg)] px-6 py-4 text-xl text-[color:var(--dev-bg)]"
            >
              Redefinir para {DEFAULT_PASSWORD}
            </button>
          </div>
        )}

        {message && current.id !== 'reset' && (
          <div className="text-sm px-4 py-3 rounded-sm text-[color:var(--dev-fg)]">{message}</div>
        )}

        {popupMessage && (
          <div className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/60" onClick={() => setPopupMessage('')}>
            <div className="w-11/12 max-w-3xl rounded-2xl border-8 border-[color:var(--dev-fg)] bg-[color:var(--dev-bg)] p-12 text-center text-[color:var(--dev-fg)] shadow-2xl">
              <div className="text-4xl font-bold leading-snug">{popupMessage}</div>
              <div className="mt-8 text-2xl font-semibold text-[color:var(--dev-fg)] opacity-80">Pressione Enter, Esc ou clique para fechar.</div>
            </div>
          </div>
        )}

        {current.id === 'reset' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-4/5 max-w-xl text-black p-8 text-center">
              {!wiped ? (
                <>
                  <h2 className="text-3xl mb-4">Reset de Fábrica</h2>
                  <p className="mb-6">Pressione Enter para confirmar a restauração de fábrica.</p>
                  <p className="opacity-75">Pressione Backspace ou Escape para cancelar.</p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl mb-4">Restauração Completa</h2>
                  <p className="mb-6">O dispositivo foi restaurado para as configurações de fábrica.</p>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
