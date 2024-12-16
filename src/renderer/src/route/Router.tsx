import { Routes, Route, HashRouter } from 'react-router-dom'
import { Path } from '@renderer/route/Path'
import { AccountPair } from '@renderer/windows/AccountPair'
import Main from '@renderer/windows/Main'
import Setting from '@renderer/windows/Setting'
import Login from '@renderer/windows/Login'
import InitApp from '@renderer/windows/InitApp'
import ListSportBook from '@renderer/windows/ListPlatform'
import { ListAccountByPlatform } from '@renderer/windows/ListAccountByPlatform'
import ConfirmLogout from '@renderer/windows/ConfirmLogOut'
import AddSelectedAccountPair from '@renderer/windows/AddSelectedAccountPair'
import ProxyServerSetting from '@renderer/windows/ProxyServerSetting'
import DelayedLoginSetting from '@renderer/windows/DelayedLoginSetting'
import { AccountLoginForm } from '@renderer/windows/AccountLoginForm'
import VIPAccountCheckerSetting from '@renderer/windows/VIPAccountCheckerSetting'
import ProxyServerSettingsGeneral from '@renderer/windows/ProxyServerSettingsGeneral'
import SportsBookPerMatchLimitSetting from '@renderer/windows/SportsBookPerMatchLimitSetting'

function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path={Path.main} element={<Main />} />
        <Route path={Path.setting} element={<Setting />} />
        <Route path={Path.accountPair} element={<AccountPair />} />
        <Route path={Path.login} element={<Login />} />
        <Route path={Path.initApp} element={<InitApp />} />
        <Route path={Path.listSportBook} element={<ListSportBook />} />
        <Route path={Path.accountList} element={<ListAccountByPlatform />} />
        <Route path={Path.confirmLogout} element={<ConfirmLogout />} />
        <Route path={Path.addSelectedAccountPair} element={<AddSelectedAccountPair />} />
        <Route path={Path.proxyServerSetting} element={<ProxyServerSetting />} />
        <Route path={Path.delayedLoginSetting} element={<DelayedLoginSetting />} />
        <Route path={Path.accountLoginForm} element={<AccountLoginForm />} />
        <Route path={Path.VIPAccountCheckerSetting} element={<VIPAccountCheckerSetting />} />
        <Route path={Path.proxyServerSettingsGeneral} element={<ProxyServerSettingsGeneral />} />
        <Route
          path={Path.sportsBookPerMatchLimitSetting}
          element={<SportsBookPerMatchLimitSetting />}
        />
      </Routes>
    </HashRouter>
  )
}

export default Router
