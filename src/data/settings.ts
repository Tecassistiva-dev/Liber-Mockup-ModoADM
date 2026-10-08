import type { MenuLevel, Option } from '../types'

export type SettingItem =
  | { kind: 'choice'; key: string; label: string; values: string[]; defaultValue?: string; swatch?: boolean }
  | { kind: 'number'; key: string; label: string; min: number; max: number; defaultValue: number }
  | { kind: 'scale'; key: string; label: string; values: string[]; defaultValue: string }
  | { kind: 'text'; key: string; label: string; placeholder?: string; secret?: boolean; validate?: 'ipv4'; defaultValue: string }
  | { kind: 'action'; id: string; label: string; message: string }
  | { kind: 'confirm'; id: string; label: string; question: string }
  | { kind: 'status'; id: string; label: string; text: string }
  | { kind: 'wifi'; id: 'wifi'; label: string }
  | { kind: 'deviceList'; id: 'btScan' | 'btPaired'; label: string }
  | { kind: 'placeholder'; id: string; label: string }
  | { kind: 'group'; id: string; label: string; note?: string; hideInPanel?: boolean; items: SettingItem[] }

const ON_OFF = ['Ligado', 'Desligado']

// ---------- redes e dispositivos fictícios ----------

export const WIFI_NETWORKS = ['Casa_5G', 'Escritorio_Tecassistiva', 'Escola_Alunos', 'Visitantes']
export const BLUETOOTH_FOUND_DEVICES = ['Fone Bluetooth', 'Teclado sem fio', 'Caixa de som', 'Impressora Braille']

// ---------- escalas ----------

const fmtX = (n: number) => `${String(n).replace('.', ',')}x`

// Velocidade de Áudio: 0,5x a 4x, de 0,1 em 0,1
const SPEED_VALUES = Array.from({ length: 36 }, (_, i) => fmtX((5 + i) / 10))

// Tonalidade do Áudio: 50 a 150, de 10 em 10
const PITCH_VALUES = Array.from({ length: 11 }, (_, i) => String(50 + i * 10))

// Tamanho da Fonte: 0,25x até 2x; 0,5x até 3x; 1x até 6x; 2x até 16x; 4x até 60x
const FONT_SCALE_VALUES = (() => {
  const out: number[] = []
  const add = (from: number, to: number, step: number) => {
    for (let v = from; v <= to + 1e-9; v += step) out.push(Math.round(v * 100) / 100)
  }
  add(1, 2, 0.25)
  add(2.5, 3, 0.5)
  add(4, 6, 1)
  add(8, 16, 2)
  add(20, 60, 4)
  return out.map(fmtX)
})()

const LANGUAGES = ['Português (PT)', 'Português (BR)', 'Inglês (US)', 'Inglês (UK)']
const VOICES = ['Francisca', 'Antonio', 'Thalita', 'Luciana', 'Felipe', 'Google Português do Brasil']

// Árvore do menu Configurações do Liber, fonte única do menu do dispositivo e do painel ADM.
// Itens "placeholder" são os que ainda não têm opções definidas: já existem na árvore, mas ficam vazios.
const ph = (id: string, label: string): SettingItem => ({ kind: 'placeholder', id, label })

export const SETTINGS_TREE: SettingItem[] = [
  {
    kind: 'group', id: 'audioLeitura', label: 'Áudio e Leitura', items: [
      {
        kind: 'group', id: 'audioGeral', label: 'Geral', items: [
          { kind: 'number', key: 'volume', label: 'Volume do áudio', min: 0, max: 15, defaultValue: 7 },
          { kind: 'scale', key: 'velocidadeAudio', label: 'Velocidade do áudio', values: SPEED_VALUES, defaultValue: '1x' },
          { kind: 'scale', key: 'tonalidadeAudio', label: 'Tonalidade do áudio', values: PITCH_VALUES, defaultValue: '100' },
          { kind: 'choice', key: 'modoAudio', label: 'Modo de áudio', values: ['Mutado', 'Silencioso', 'Normal'], defaultValue: 'Normal' }
        ]
      },
      {
        kind: 'group', id: 'vozesIdiomas', label: 'Vozes e Idiomas', items: [
          { kind: 'choice', key: 'idiomaLeitura', label: 'Idioma de leitura', values: LANGUAGES, defaultValue: 'Português (BR)' },
          { kind: 'choice', key: 'idiomaSistema', label: 'Idioma do sistema', values: LANGUAGES, defaultValue: 'Português (BR)' },
          { kind: 'choice', key: 'vozMenu', label: 'Voz de menu', values: VOICES },
          { kind: 'choice', key: 'vozLeitura', label: 'Voz de leitura', values: VOICES }
        ]
      },
      {
        kind: 'group', id: 'navegacaoRepeticao', label: 'Navegação e Repetição', items: [
          ph('controloNavegacao', 'Controlo de navegação'),
          ph('repeticaoTexto', 'Repetição de texto'),
          ph('numeroRepeticoes', 'Número de repetições'),
          ph('palavraGuia', 'Palavra guia')
        ]
      },
      {
        kind: 'group', id: 'leituraAvancada', label: 'Leitura Avançada', note: 'Fora do âmbito do MVP de Dezembro', items: [
          ph('leituraSilabada', 'Leitura silabada'),
          ph('complexidadePalavra', 'Complexidade da palavra'),
          ph('tempoSilabas', 'Tempo entre sílabas')
        ]
      },
      {
        kind: 'group', id: 'pausasLeitura', label: 'Pausas de leitura', items: [
          ph('pausaPalavras', 'Pausa entre palavras'),
          ph('tempoPalavras', 'Tempo entre palavras'),
          ph('pausaFrases', 'Pausa entre frases'),
          ph('tempoFrases', 'Tempo entre frases')
        ]
      }
    ]
  },
  {
    kind: 'group', id: 'visualExibicao', label: 'Visual e Exibição', items: [
      {
        kind: 'group', id: 'tipografiaEscala', label: 'Tipografia e Escala', items: [
          { kind: 'choice', key: 'fonte', label: 'Fonte de leitura', values: ['Roboto', 'Atkinson Hyperlegible', 'Open Sans'] },
          { kind: 'scale', key: 'tamanhoFonte', label: 'Tamanho de fonte de leitura', values: FONT_SCALE_VALUES, defaultValue: '1x' }
        ]
      },
      {
        kind: 'group', id: 'focoIsolamento', label: 'Foco e Isolamento', items: [
          ph('mascaraPadrao', 'Máscara padrão'),
          ph('aberturaCortina', 'Abertura da cortina'),
          ph('linhaReferencia', 'Linha de referência padrão'),
          ph('textoBloco', 'Texto em bloco'),
          ph('palavrasPorLinha', 'Palavras por linha'),
          ph('linhasNoBloco', 'Linhas no bloco')
        ]
      },
      {
        kind: 'group', id: 'coresContraste', label: 'Cores e Contraste', items: [
          {
            kind: 'choice', key: 'combinacaoCores', label: 'Combinação de cores', swatch: true, defaultValue: 'Azul sobre amarelo', values: [
              'Amarelo sobre azul', 'Amarelo sobre preto', 'Amarelo sobre verde', 'Azul sobre amarelo', 'Azul sobre branco',
              'Azul sobre preto', 'Branco sobre azul', 'Branco sobre preto', 'Branco sobre verde', 'Branco sobre vermelho',
              'Preto sobre amarelo', 'Preto sobre azul', 'Preto sobre branco', 'Preto sobre verde', 'Preto sobre vermelho',
              'Verde sobre amarelo', 'Verde sobre branco', 'Verde sobre preto', 'Vermelho sobre branco', 'Vermelho sobre preto'
            ]
          }
        ]
      },
      {
        kind: 'group', id: 'comportamentoLeitura', label: 'Comportamento de Leitura', items: [
          { kind: 'choice', key: 'menuRolagem', label: 'Tipo de rolagem de menu', values: ['Menu de rolagem normal', 'Menu de rolagem circular'] },
          { kind: 'choice', key: 'tipoLeitura', label: 'Tipo de leitura', values: ['Teleponto', 'Linha'] },
          ph('controloVelocidadeLeitura', 'Controlo de velocidade de leitura'),
          ph('espacamentoAmpliado', 'Espaçamento ampliado'),
          ph('destaquePalavra', 'Destaque na palavra lida'),
          ph('coresDestaque', 'Cores do destaque'),
          ph('corFundoDestaque', 'Cor de fundo do destaque'),
          ph('corTextoDestaque', 'Cor do texto do destaque')
        ]
      }
    ]
  },
  {
    kind: 'group', id: 'braille', label: 'Braille', items: [
      { kind: 'choice', key: 'brailleCursor', label: 'Cursor braille', values: ['Piscar', 'Fixo', 'Desligado'] },
      { kind: 'choice', key: 'brailleParar', label: 'Parar ao final da linha', values: ON_OFF },
      { kind: 'choice', key: 'brailleNaoQuebrar', label: 'Não quebrar palavras', values: ON_OFF },
      { kind: 'choice', key: 'modoBraille', label: 'Modo braille', values: ['6 pontos', '8 pontos'] },
      { kind: 'choice', key: 'tabelaBraille', label: 'Modo de tabela Braille', values: ['Literária', 'Informática'] }
    ]
  },
  {
    kind: 'group', id: 'conectividade', label: 'Conectividade e Dispositivos', items: [
      { kind: 'wifi', id: 'wifi', label: 'Wi-Fi' },
      {
        kind: 'group', id: 'bluetoothMenu', label: 'Bluetooth', items: [
          { kind: 'deviceList', id: 'btScan', label: 'Listar Dispositivos Bluetooth' },
          { kind: 'deviceList', id: 'btPaired', label: 'Listar Dispositivos Pareados' },
          { kind: 'choice', key: 'bluetooth', label: 'Bluetooth Ligado', values: ['Sim', 'Não'], defaultValue: 'Não' }
        ]
      },
      { kind: 'status', id: 'usb', label: 'Dispositivos USB', text: 'Nenhum dispositivo USB encontrado' },
      {
        kind: 'group', id: 'impressora', label: 'Impressora', items: [
          { kind: 'text', key: 'enderecoIp', label: 'Endereço IP', placeholder: '192.168.0.50', validate: 'ipv4', defaultValue: '192.168.0.50' }
        ]
      }
    ]
  },
  {
    kind: 'group', id: 'sistemaIa', label: 'Sistema e IA', items: [
      {
        kind: 'group', id: 'inteligenciaArtificial', label: 'Inteligência Artificial', items: [
          {
            kind: 'group', id: 'credenciais', label: 'Credenciais', items: [
              { kind: 'text', key: 'chaveApi', label: 'Chave da API', placeholder: 'Cole a chave da API', secret: true, defaultValue: '' },
              { kind: 'text', key: 'modeloIa', label: 'Modelo de IA', placeholder: 'Nome do modelo de IA', defaultValue: '' }
            ]
          }
        ]
      },
      ph('pastaSalvamento', 'Pasta padrão de salvamento'),
      { kind: 'status', id: 'infoSistema', label: 'Informações do sistema', text: 'Versão Atual 2.07.03' }
    ]
  },
  ph('ajuda', 'Ajuda'),
  ph('atalhos', 'Atalhos')
]

export const settingsNodeId = (item: SettingItem): string =>
  item.kind === 'choice' || item.kind === 'number' || item.kind === 'scale' || item.kind === 'text' ? item.key : item.id

// ---------- valores padrão (por perfil) ----------

export const SETTINGS_DEFAULTS: Record<string, string> = {
  // Estado de Wi-Fi e Bluetooth (rede conectada, dispositivo conectado e pareados)
  wifi: 'Ligado',
  wifiRede: '',
  bluetooth: 'Não',
  btDispositivo: '',
  btPareados: 'Fone Bluetooth'
}

const walkDefaults = (items: SettingItem[]) => items.forEach(item => {
  if (item.kind === 'choice') SETTINGS_DEFAULTS[item.key] = item.defaultValue ?? item.values[0]
  else if (item.kind === 'number') SETTINGS_DEFAULTS[item.key] = String(item.defaultValue)
  else if (item.kind === 'scale' || item.kind === 'text') SETTINGS_DEFAULTS[item.key] = item.defaultValue
  else if (item.kind === 'group') walkDefaults(item.items)
})
walkDefaults(SETTINGS_TREE)

export const SETTINGS_KEYS = new Set(Object.keys(SETTINGS_DEFAULTS))

export function getSettingsChoiceLabels(): Record<string, string> {
  const out: Record<string, string> = { wifi: 'Wi-Fi' }
  const walk = (items: SettingItem[]) => items.forEach(i => {
    if (i.kind === 'choice' || i.kind === 'number' || i.kind === 'scale' || i.kind === 'text') out[i.key] = i.label
    else if (i.kind === 'group') walk(i.items)
  })
  walk(SETTINGS_TREE)
  return out
}

// ---------- presets dos perfis de acessibilidade ----------
// Valores iniciais de cada perfil; o que o usuário alterar no painel sobrepõe o preset.
// Base: diretrizes de baixa visão (contraste alto), TDAH (menos estímulo, cores frias, sem elementos piscando)
// e TEA (fundo neutro, sem branco puro nem cores saturadas em área grande, sons moderados).
export const PROFILE_PRESETS: Record<string, Record<string, string>> = {
  universal: {
    combinacaoCores: 'Azul sobre amarelo',
    volume: '7',
    tamanhoFonte: '1x',
    menuRolagem: 'Menu de rolagem normal',
    brailleCursor: 'Piscar'
  },
  visual: {
    combinacaoCores: 'Amarelo sobre preto',
    volume: '10',
    tamanhoFonte: '8x',
    menuRolagem: 'Menu de rolagem circular',
    brailleCursor: 'Piscar'
  },
  cognitivo: {
    combinacaoCores: 'Branco sobre azul',
    volume: '6',
    tamanhoFonte: '1x',
    menuRolagem: 'Menu de rolagem normal',
    brailleCursor: 'Fixo'
  },
  neurodivergente: {
    combinacaoCores: 'Verde sobre preto',
    volume: '5',
    tamanhoFonte: '1x',
    menuRolagem: 'Menu de rolagem normal',
    brailleCursor: 'Fixo'
  }
}

export const PRESET_NOTES: Record<string, string> = {
  universal: 'Padrão do produto: azul sobre amarelo, volume 7 e fonte em 1x.',
  visual: 'Contraste máximo (amarelo sobre preto, 19,6:1), volume e fonte maiores (8x) e rolagem circular para percorrer o menu mais rápido.',
  cognitivo: 'Branco sobre azul (cor fria, sem vermelho ou amarelo saturados), cursor braille fixo (sem piscar), rolagem previsível e volume moderado.',
  neurodivergente: 'Verde sobre preto (fundo neutro, sem branco puro nem cor saturada em área grande), cursor fixo, rolagem previsível e volume mais baixo.'
}

export const PRESET_KEYS = Array.from(new Set(Object.values(PROFILE_PRESETS).flatMap(p => Object.keys(p))))

// ---------- importação e exportação (XML) ----------

type KeySpec = { values?: string[]; min?: number; max?: number; text?: boolean; validate?: 'ipv4' }

export const isValidIpv4 = (value: string) =>
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(value)

const KEY_SPECS: Record<string, KeySpec> = {
  wifi: { values: ['Ligado', 'Desligado'] }
}
const walkSpecs = (items: SettingItem[]) => items.forEach(i => {
  if (i.kind === 'choice') KEY_SPECS[i.key] = { values: i.values }
  else if (i.kind === 'number') KEY_SPECS[i.key] = { min: i.min, max: i.max }
  else if (i.kind === 'scale') KEY_SPECS[i.key] = { values: i.values }
  else if (i.kind === 'text' && !i.secret) KEY_SPECS[i.key] = { text: true, validate: i.validate } // segredos (chave da API) ficam fora
  else if (i.kind === 'group') walkSpecs(i.items)
})
walkSpecs(SETTINGS_TREE)

// Só o que é configuração entra no arquivo; conexões atuais, dispositivos pareados e a chave da API ficam de fora
export const EXPORTABLE_SETTING_KEYS = Object.keys(KEY_SPECS)

// Valores efetivos: padrão do produto < preset do perfil < ajustes feitos no painel
export function resolveSettings(presetId: string | undefined, overrides?: Record<string, string>): Record<string, string> {
  return { ...SETTINGS_DEFAULTS, ...(presetId ? PROFILE_PRESETS[presetId] ?? {} : {}), ...(overrides ?? {}) }
}

const escapeXml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function settingsToXml(values: Record<string, string>, indent: string): string {
  let xml = `${indent}<configuracoesGerais>\n`
  for (const key of EXPORTABLE_SETTING_KEYS) {
    if (values[key] !== undefined) xml += `${indent}  <config chave="${key}">${escapeXml(values[key])}</config>\n`
  }
  return xml + `${indent}</configuracoesGerais>\n`
}

// Lê <configuracoesGerais> e devolve só chaves conhecidas com valores válidos
export function parseSettingsXml(node: Element): Record<string, string> {
  const out: Record<string, string> = {}
  node.querySelectorAll('configuracoesGerais > config').forEach(cfg => {
    const key = cfg.getAttribute('chave')
    const value = cfg.textContent?.trim() ?? ''
    const spec = key ? KEY_SPECS[key] : undefined
    if (!key || !spec) return
    if (spec.values) {
      if (spec.values.includes(value)) out[key] = value
    } else if (spec.text) {
      const valid = value.length <= 120 && !/[\u0000-\u001f]/.test(value) && (spec.validate !== 'ipv4' || isValidIpv4(value))
      if (valid) out[key] = value
    } else if (spec.min !== undefined && spec.max !== undefined) {
      const n = Number(value)
      if (Number.isInteger(n) && n >= spec.min && n <= spec.max) out[key] = String(n)
    }
  })
  return out
}

// ---------- categorias e esboço em árvore (painel e barra lateral) ----------

// "single" = item solto no primeiro nível (Nível de uso, Guia Sensorial, Informações do Sistema)
export type SettingsCategory = { id: string; label: string; items: SettingItem[]; single: boolean; hideInPanel?: boolean }

export const SETTINGS_CATEGORIES: SettingsCategory[] = SETTINGS_TREE.map(item =>
  item.kind === 'group'
    ? { id: item.id, label: item.label, items: item.items, single: false, hideInPanel: item.hideInPanel }
    : { id: settingsNodeId(item), label: item.label, items: [item], single: true }
)

export type OutlineNode = { id: string; label: string; children?: OutlineNode[] }

const toOutline = (item: SettingItem): OutlineNode =>
  item.kind === 'group'
    ? { id: item.id, label: item.label, children: item.items.map(toOutline) }
    : { id: settingsNodeId(item), label: item.label }

export const SETTINGS_OUTLINE: OutlineNode[] = SETTINGS_CATEGORIES.map(c =>
  c.single ? { id: c.id, label: c.label } : { id: c.id, label: c.label, children: c.items.map(toOutline) }
)

// Ids dos contêineres que precisam estar abertos para mostrar o item
export function findSettingsAncestors(targetId: string): string[] {
  const walk = (nodes: OutlineNode[], trail: string[]): string[] | null => {
    for (const n of nodes) {
      if (n.id === targetId) return trail
      if (n.children) {
        const found = walk(n.children, [...trail, n.id])
        if (found) return found
      }
    }
    return null
  }
  return walk(SETTINGS_OUTLINE, []) ?? []
}

// Todo item abre e fecha (＋ / －): categorias, grupos e folhas, inclusive os blocos internos de Wi-Fi e de seleção de perfil
export const SETTINGS_CONTAINER_IDS: string[] = (() => {
  const ids: string[] = []
  const walk = (items: SettingItem[]) => items.forEach(i => {
    ids.push(settingsNodeId(i))
    if (i.kind === 'group') walk(i.items)
    else if (i.kind === 'wifi') ids.push('wifiEstado', 'wifiRedes')
  })
  walk(SETTINGS_TREE)
  return ids
})()

export function countOutlineLeaves(node: OutlineNode): number {
  return node.children ? node.children.reduce((sum, c) => sum + countOutlineLeaves(c), 0) : 1
}

// ---------- Wi-Fi e Bluetooth ----------

export const parsePaired = (values: Record<string, string>): string[] =>
  (values.btPareados ?? '').split('|').filter(Boolean)

export type ConnectionKind = 'wifi' | 'bluetooth'
export type ConnectionAction = 'connect' | 'pair' | 'toggle'

export function runConnectionAction(
  kind: ConnectionKind,
  action: ConnectionAction,
  name: string,
  values: Record<string, string>
): { changes: Record<string, string>; message: string } {
  if (kind === 'wifi') {
    if (values.wifi !== 'Ligado') return { changes: {}, message: 'Wi-Fi desligado. Ligue-o primeiro.' }
    if (values.wifiRede === name) return { changes: {}, message: `Já conectado à rede ${name}.` }
    return { changes: { wifiRede: name }, message: `Conectado com sucesso à rede ${name}.` }
  }

  if (values.bluetooth !== 'Sim') return { changes: {}, message: 'Bluetooth desligado. Ligue-o primeiro.' }
  const paired = parsePaired(values)

  if (action === 'pair') {
    const nextPaired = paired.includes(name) ? paired : [...paired, name]
    return { changes: { btPareados: nextPaired.join('|'), btDispositivo: name }, message: `Dispositivo ${name} pareado e conectado.` }
  }

  // alterna a conexão de um dispositivo já pareado
  if (values.btDispositivo === name) return { changes: { btDispositivo: '' }, message: `Desconectado do dispositivo ${name}.` }
  return { changes: { btDispositivo: name }, message: `Conectado com sucesso ao dispositivo ${name}.` }
}

// Efeitos colaterais ao mudar um valor (ex.: desligar o Wi-Fi derruba a conexão)
export function settingChanges(key: string, value: string): Record<string, string> {
  const changes: Record<string, string> = { [key]: value }
  if (key === 'wifi' && value === 'Desligado') changes.wifiRede = ''
  if (key === 'bluetooth' && value === 'Não') changes.btDispositivo = ''
  return changes
}

// ---------- cores do "Combinação de cores" ----------

const COLORS: Record<string, string> = {
  preto: '#000000',
  branco: '#FFFFFF',
  amarelo: '#FFFF00',
  azul: '#0000FF',
  verde: '#00A650',
  vermelho: '#E00000'
}

export function parseColorCombo(label: string): { fg: string; bg: string } {
  const [fg, bg] = label.toLowerCase().split(' sobre ')
  return { fg: COLORS[fg] ?? '#000000', bg: COLORS[bg] ?? '#FFFFFF' }
}

// ---------- menu do dispositivo (gerado a partir da árvore) ----------

export const SETTINGS_ACTION_PREFIX = 'cfg_act_'
export const SETTINGS_CONFIRM_PREFIX = 'cfg_confirm|'
export const SETTINGS_CONN_PREFIX = 'cfg_conn|'
export const SETTINGS_SET_PREFIX = 'cfg_set|'
export const SETTINGS_STATUS_PREFIX = 'cfg_status|'
export const SETTINGS_TEXT_PREFIX = 'cfg_text|'
export const SETTINGS_PLACEHOLDER_PREFIX = 'cfg_placeholder|'
export const SETTINGS_BACK_ID = 'cfg_back'
export const SETTINGS_NOOP_ID = 'cfg_noop'

function settingsHeader(label: string) {
  return '.' + label.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

const range = (min: number, max: number) => Array.from({ length: max - min + 1 }, (_, i) => String(min + i))

const choiceOptions = (key: string, label: string, values: string[], levels: MenuLevel[]): Option => {
  levels.push({
    id: `cfgc_${key}`,
    header: settingsHeader(label), title: label,
    options: values.map((value, i) => ({ id: `cfgc_${key}_${i}`, label: value, type: 'action', choiceKey: key }))
  })
  return { id: `cfgc_${key}`, label, type: 'submenu', submenuId: `cfgc_${key}`, choices: values, choiceKey: key }
}

const confirmLevel = (id: string, header: string, yesId: string, levels: MenuLevel[]): Option['submenuId'] => {
  levels.push({
    id,
    header,
    options: [
      { id: yesId, label: 'Sim', type: 'action' },
      { id: SETTINGS_BACK_ID, label: 'Não', type: 'action' }
    ]
  })
  return id
}

function buildSettings(items: SettingItem[], levels: MenuLevel[]): Option[] {
  const out: Option[] = []
  for (const item of items) {
    switch (item.kind) {
      case 'action':
        out.push({ id: `${SETTINGS_ACTION_PREFIX}${item.id}`, label: item.label, type: 'action' })
        break
      case 'status':
        out.push({ id: `${SETTINGS_STATUS_PREFIX}${item.id}`, label: item.label, type: 'action' })
        break
      case 'choice':
        out.push(choiceOptions(item.key, item.label, item.values, levels))
        break
      case 'scale':
        out.push(choiceOptions(item.key, item.label, item.values, levels))
        break
      case 'number':
        out.push(choiceOptions(item.key, item.label, range(item.min, item.max), levels))
        break
      case 'text':
        // tela de digitação (campo editável) tratada no App
        levels.push({ id: `cfgt_${item.key}`, header: settingsHeader(item.label), title: item.label, options: [] })
        out.push({ id: `${SETTINGS_TEXT_PREFIX}${item.key}`, label: item.label, type: 'action' })
        break
      case 'confirm': {
        const id = confirmLevel(`cfgm_${item.id}`, settingsHeader(item.question), `${SETTINGS_CONFIRM_PREFIX}${item.id}`, levels)
        out.push({ id: `cfgm_${item.id}_entry`, label: item.label, type: 'submenu', submenuId: id })
        break
      }
      case 'wifi':
        // opções montadas na hora (Ligar, Desligar e, se ligado, as redes)
        levels.push({ id: 'cfgd_wifi', header: settingsHeader(item.label), title: item.label, options: [] })
        out.push({ id: 'cfgd_wifi_entry', label: item.label, type: 'submenu', submenuId: 'cfgd_wifi' })
        break
      case 'placeholder':
        out.push({ id: `${SETTINGS_PLACEHOLDER_PREFIX}${item.id}`, label: item.label, type: 'action' })
        break
      case 'deviceList':
        levels.push({ id: `cfgd_${item.id}`, header: settingsHeader(item.label), title: item.label, options: [] })
        out.push(item.id === 'btScan'
          ? { id: `${SETTINGS_CONN_PREFIX}bluetooth|scan|`, label: item.label, type: 'action' }
          : { id: `cfgd_${item.id}_entry`, label: item.label, type: 'submenu', submenuId: `cfgd_${item.id}` })
        break
      case 'group': {
        const level: MenuLevel = { id: `cfgg_${item.id}`, header: settingsHeader(item.label), title: item.label, options: [] }
        levels.push(level)
        level.options = buildSettings(item.items, levels)
        out.push({ id: `cfgg_${item.id}_entry`, label: item.label, type: 'submenu', submenuId: level.id })
        break
      }
    }
  }
  return out
}

export const SETTINGS_LEVELS: MenuLevel[] = []
export const SETTINGS_OPTIONS: Option[] = buildSettings(SETTINGS_TREE, SETTINGS_LEVELS)

// Opções que dependem do estado atual (Wi-Fi, dispositivos Bluetooth)
export function getDynamicSettingsOptions(
  levelId: string,
  values: Record<string, string>,
  ctx: { btSearching: boolean; activeProfileId: string; activeUserId: string | null; users: { id: string; name: string }[] }
): Option[] | null {
  const mark = (on: boolean) => (on ? ' ✓' : '')

  if (levelId === 'cfgd_wifi') {
    const on = values.wifi === 'Ligado'
    return [
      { id: `${SETTINGS_SET_PREFIX}wifi|Ligado`, label: `Ligar${mark(on)}`, type: 'action' },
      { id: `${SETTINGS_SET_PREFIX}wifi|Desligado`, label: `Desligar${mark(!on)}`, type: 'action' },
      ...(on
        ? WIFI_NETWORKS.map(name => ({
          id: `${SETTINGS_CONN_PREFIX}wifi|connect|${name}`,
          label: `${name}${mark(values.wifiRede === name)}`,
          type: 'action' as const
        }))
        : [])
    ]
  }

  if (levelId === 'cfgd_btScan') {
    if (ctx.btSearching) return [{ id: SETTINGS_NOOP_ID, label: 'A procurar dispositivos Bluetooth...', type: 'action' }]
    if (values.bluetooth !== 'Sim') return [{ id: SETTINGS_NOOP_ID, label: 'Bluetooth desligado', type: 'action' }]
    return BLUETOOTH_FOUND_DEVICES.map(name => ({ id: `${SETTINGS_CONN_PREFIX}bluetooth|pair|${name}`, label: name, type: 'action' as const }))
  }

  if (levelId === 'cfgd_btPaired') {
    const paired = parsePaired(values)
    if (paired.length === 0) return [{ id: SETTINGS_NOOP_ID, label: 'Nenhum dispositivo pareado', type: 'action' }]
    return paired.map(name => ({
      id: `${SETTINGS_CONN_PREFIX}bluetooth|toggle|${name}`,
      label: `${name}${mark(values.btDispositivo === name)}`,
      type: 'action' as const
    }))
  }

  return null
}

export function findSettingsAction(id: string): { label: string; message: string } | undefined {
  let found: { label: string; message: string } | undefined
  const walk = (items: SettingItem[]) => items.forEach(i => {
    if (i.kind === 'action' && i.id === id) found = { label: i.label, message: i.message }
    else if (i.kind === 'group') walk(i.items)
  })
  walk(SETTINGS_TREE)
  return found
}

export function findSettingsStatus(id: string): { label: string; text: string } | undefined {
  let found: { label: string; text: string } | undefined
  const walk = (items: SettingItem[]) => items.forEach(i => {
    if (i.kind === 'status' && i.id === id) found = { label: i.label, text: i.text }
    else if (i.kind === 'group') walk(i.items)
  })
  walk(SETTINGS_TREE)
  return found
}

export function findTextSetting(key: string): Extract<SettingItem, { kind: 'text' }> | undefined {
  let found: Extract<SettingItem, { kind: 'text' }> | undefined
  const walk = (items: SettingItem[]) => items.forEach(i => {
    if (i.kind === 'text' && i.key === key) found = i
    else if (i.kind === 'group') walk(i.items)
  })
  walk(SETTINGS_TREE)
  return found
}
