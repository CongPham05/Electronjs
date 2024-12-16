export type PlatformType = {
  id: number
  uuid: string
  url: string
  name: string
}

export type DataPlaceBet = {
  id: number

  platform: string

  idLeague: number
  nameLeague: string
  idEvent: number
  nameHome: string
  nameAway: string
  number: number
  altLineId: number
  hdp_point: number
  home_over: number
  away_under: number
  typeOdd: string
  league: string
  home: string
  away: string
  specialOdd: number | null
  betType: number
  HDP: string | number
  bet: string
  odd: number

  profit: number

  idAccount: number
  betAmount: string | number
  selectBet: string
  checkOdd: number
  checkOdd_From: string | number
  checkOdd_To: string | number

  company: string
  coverage: string
  gameType: string
  time: string
  info: string
  receiptID: string
  receiptStatus: string
}

export type AccountType = {
  id: number

  loginID: string
  password: string

  platformName: string
  loginURL: string

  credit: string
  textLog: string

  proxyIP: string
  proxyPort: string
  proxyUsername: string
  proxyPassword: string

  typeCrawl: string

  bet: number
  refresh: number
  autoLogin: number
  lockURL: number

  statusLogin: string | null
  statusPair: number
  status: string
  statusDelete: number

  cookie: string
  host: string
  socketUrl: string
}

export interface DataPlatformType extends SportsBookType {
  accounts: AccountType[]
}

export type SportsBookType = {
  id: number
  name: string
  platform: string
  url: string
  delayNormal: string
  delaySameGame: string
  suggestedClient: string
  delayLoginSec_from: string
  delayLoginSec_to: string
  VIPAccountLogout: number
}

export type SettingType = {
  id: number
  profitMin: number
  profitMax: number
  gameType: string
  enablePerMatchLimitSetting: number
  ipAddress: string
  port: string
  username: string
  password: string
}

export type SettingPerMatchLimitType = {
  id: number
  namePlatform: string
  limitMethod: string
  livePreGame: number

  limitType: string
  totalAmount: string
  totalCount: string
}

export type SettingBetListType = {
  id: number
  clear: number
}
export type SettingWaitingListType = {
  id: number
  clear: number
}
export type SettingContraListType = {
  id: number
  clear: number
}
export type SettingSuccessListType = {
  id: number
  clear: number
}

export type DataCrawlType = {
  id: number

  platform: string

  idLeague: number
  nameLeague: string

  idEvent: number
  nameHome: string
  nameAway: string

  number: number
  altLineId: number
  hdp_point: number
  home_over: number
  away_under: number
  typeOdd: string

  league: string | null
  home: string | null
  away: string | null

  specialOdd: number | null
  betType: number

  HDP: number
}

export type NameTeamType = {
  id: number
  nameTeam: string
  nameLeague: string
  platform: string
  idPlatform: number
  team: string
  league: string
}

export type NameLeagueType = {
  id: number
  nameLeague: string
  platform: string
  idPlatform: number
  league: string
}

export type SettingAccountPairType = {
  id?: number

  id_account1: number
  account1_BetAmount: number | string
  account1_SelectBet: string
  account1_CheckOdd: number
  account1_CheckOdd_From: string
  account1_CheckOdd_To: string

  id_account2: number
  account2_BetAmount: number | string
  account2_SelectBet: string
  account2_CheckOdd: number
  account2_CheckOdd_From: string
  account2_CheckOdd_To: string

  combinationPlatform: string
}

export type AccountPairType = {
  id?: number

  id_account1: number
  account1_BetAmount: string | number
  account1_SelectBet: string
  account1_loginID: string
  account1_platForm: string
  account1_CheckOdd: number
  account1_CheckOdd_From: string | number
  account1_CheckOdd_To: string | number

  id_account2: number
  account2_BetAmount: string | number
  account2_SelectBet: string
  account2_loginID: string
  account2_platForm: string
  account2_CheckOdd: number
  account2_CheckOdd_From: string | number
  account2_CheckOdd_To: string | number

  combinationPlatform: string
}

export type BetListType = {
  id: number
  dataPair: string
}

export type DataBetType = {
  id: number
  dataPair: string
}

export type WaitingListType = {
  id: number
  uuid: string
  dataPair: string
}
