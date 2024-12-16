import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { BetList } from '@renderer/components/BetList'
import { ContraList } from '@renderer/components/ContraList'
import { SportsBook } from '@renderer/components/SportsBook'
import { SuccessList } from '@renderer/components/SuccessList'
import { WaitingList } from '@renderer/components/WaitingList'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'

export default function Main() {
  const { t, i18n } = useTranslation('main')

  const handleGeneralSetting = () => {
    window.electron.ipcRenderer.send('ShowSettingWindow')
  }
  const handleGeneralAccountPair = () => {
    window.electron.ipcRenderer.send('ShowAccountPairWindow')
  }
  const handleSportsBookPerMatchLimitSetting = () => {
    window.electron.ipcRenderer.send('ShowSportsBookPerMatchLimitSettingWindow')
  }

  const handleProxyServerSetting = () => {
    window.electron.ipcRenderer.send('ShowProxyServerSetting')
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="bg-layout-color flex flex-col h-full">
      <div className="flex">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-full focus:outline-none border border-transparent cursor-pointer hover:bg-blue-200 hover:border hover:border-blue-300 transition duration-300 px-2 mx-[2px]
             data-[state=open]:bg-blue-200 data-[state=open]:border data-[state=open]:border-blue-300"
          >
            <div className="flex items-center">
              <p className="text-[#800080] font-bold "> {t('ProgramSetting')}</p>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="rounded-none w-72 ml-[2px]  border border-gray-400 shadow-lg p-[1px]">
            <DropdownMenuItem
              className=" font-bold  cursor-pointer   border border-white  focus:border-blue-500 focus:bg-blue-100"
              onClick={handleGeneralSetting}
            >
              {t('GeneralSetting')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className=" font-bold  cursor-pointer   border border-white  focus:border-blue-500 focus:bg-blue-100"
              onClick={handleGeneralAccountPair}
            >
              {t('AccountPair')}
            </DropdownMenuItem>

            <DropdownMenuItem
              className=" font-bold border cursor-pointer  border-white  focus:border-blue-500 focus:bg-blue-100 "
              onClick={handleSportsBookPerMatchLimitSetting}
            >
              {t('SportsBookPerMatchLimitSetting')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className=" font-bold  cursor-pointer   border border-white  focus:border-blue-500 focus:bg-blue-100"
              onClick={handleProxyServerSetting}
            >
              {t('ProxyServerSetting')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <DropdownMenu>
          <DropdownMenuTrigger
            className="h-full focus:outline-none border border-transparent cursor-pointer hover:bg-blue-200 hover:border hover:border-blue-300 transition duration-300 px-2 mx-[2px] data-[state=open]:bg-blue-200 data-[state=open]:border
              data-[state=open]:border-blue-300"
          >
            <div className="flex items-center">
              <p className="text-[#a90000] font-bold "> {t('Language')}</p>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="rounded-none w-52 ml-[110px]  border border-gray-400 shadow-lg p-[1px]">
            <DropdownMenuItem
              className={` font-bold  cursor-pointer border border-white  focus:border-blue-500 focus:bg-blue-100  ${i18n.language === 'en' && 'bg-blue-200  border-blue-300'}`}
              onClick={() => changeLanguage('en')}
            >
              {t('English')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`font-bold  cursor-pointer border border-white  focus:border-blue-500 focus:bg-blue-100  ${i18n.language === 'vi' && 'bg-blue-200  border-blue-300'}`}
              onClick={() => changeLanguage('vi')}
            >
              {t('Vietnamese')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
      <Tabs defaultValue="SportsBook" className="flex-1 mb-20 ">
        <TabsList className="text-black bg-layout-color p-2 ">
          <TabsTrigger
            value="SportsBook"
            className=" border-[1.5px] border-layout-color rounded-none py-[1px] px-3 text-[11px] data-[state=active]:bg-layout-color  data-[state=active]:border-gray-500 data-[state=active]:border-r-gray-400 data-[state=active]:border-b-gray-400"
          >
            SportsBook
          </TabsTrigger>
          <div className="h-full border-l-[1px] border-gray-400 mx-3"></div>
          <TabsTrigger
            value="BetList"
            className=" border-[1.5px] border-layout-color rounded-none py-[1px] px-3 text-[11px] data-[state=active]:bg-layout-color  data-[state=active]:border-gray-500 data-[state=active]:border-r-gray-400 data-[state=active]:border-b-gray-400"
          >
            Bet List
          </TabsTrigger>
          <div className="h-full border-l-[1px] border-gray-400 mx-3"></div>
          <TabsTrigger
            value="WaitingList"
            className=" border-[1.5px] border-layout-color rounded-none py-[1px] px-3 text-[11px] data-[state=active]:bg-layout-color  data-[state=active]:border-gray-500 data-[state=active]:border-r-gray-400 data-[state=active]:border-b-gray-400"
          >
            Waiting List
          </TabsTrigger>
          <div className="h-full border-l-[1px] border-gray-400 mx-3"></div>
          <TabsTrigger
            value="ContraList"
            className=" border-[1.5px] border-layout-color rounded-none py-[1px] px-3 text-[11px] data-[state=active]:bg-layout-color  data-[state=active]:border-gray-500 data-[state=active]:border-r-gray-400 data-[state=active]:border-b-gray-400"
          >
            Contra List
          </TabsTrigger>
          <div className="h-full border-l-[1px] border-gray-400 mx-3"></div>
          <TabsTrigger
            value="SuccessList"
            className=" border-[1.5px] border-layout-color rounded-none py-[1px] px-3 text-[11px] data-[state=active]:bg-layout-color  data-[state=active]:border-gray-500 data-[state=active]:border-r-gray-400 data-[state=active]:border-b-gray-400"
          >
            Success List
          </TabsTrigger>
        </TabsList>
        <TabsContent value="SportsBook" className="h-full mt-0 ">
          <SportsBook />
        </TabsContent>
        <TabsContent value="BetList" className="mx-4 h-full mt-0  ">
          <BetList />
        </TabsContent>
        <TabsContent value="WaitingList" className="mx-4 h-full mt-0 ">
          <WaitingList />
        </TabsContent>
        <TabsContent value="ContraList" className="mx-4 h-full mt-0 ">
          <ContraList />
        </TabsContent>
        <TabsContent value="SuccessList" className="mx-4 h-full mt-0 ">
          <SuccessList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
