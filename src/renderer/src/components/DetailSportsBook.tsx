import PlusCircle from '@renderer/icons/plus-circle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

import ChevronDown from '@renderer/icons/chevron-down'
import Xmark from '@renderer/icons/x-mark'
import { DataPlatformType, SportsBookType } from '@shared/types'
import QuestionMarkCircle from '@renderer/icons/question-mark-circle'
import { useEffect, useState } from 'react'
import React from 'react'
import AccountPlatform from '@renderer/components/AccountPlatform'

interface DetailSportsBookProps {
  sportsBook: DataPlatformType
}

const DetailSportsBook: React.FC<DetailSportsBookProps> = ({ sportsBook }) => {
  const [inputs, setInputs] = useState({
    delayNormal: sportsBook.delayNormal,
    delaySameGame: sportsBook.delaySameGame
  })

  const [delayLogin, setDelayLogin] = useState(null)

  useEffect(() => {
    const DelayLogin = (_, { platform, delayLogin }) => {
      if (sportsBook.platform == platform) {
        setDelayLogin(delayLogin === 0 ? null : delayLogin)
      }
    }

    window.electron.ipcRenderer.on('DelayLogin', DelayLogin)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('DelayLogin')
    }
  }, [])

  const handleInputChange = (key: keyof typeof inputs, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [key]: value.replace(/[^0-9]/g, '')
    }))
  }

  const handleInputBlur = (key: keyof typeof inputs) => {
    setInputs((prev) => {
      const currentValue = prev[key]
      if (currentValue === '') {
        return {
          ...prev,
          [key]: sportsBook[key]
        }
      }
      return prev
    })

    if (inputs[key] !== '' && inputs[key] !== sportsBook[key]) {
      window.electron.ipcRenderer.send('UpdateDelaySec_Platform', {
        platform: sportsBook.platform,
        dataUpdate: { [key]: inputs[key] }
      })
    }
  }

  const handleAddAccount = (sportsBook: DataPlatformType) => {
    window.electron.ipcRenderer.send('AddAccountPlatForm', {
      platformName: sportsBook.platform,
      loginURL: sportsBook.url
    })
  }

  const removePlatform = (namePlatform: string) => {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.includes(namePlatform)) {
        sessionStorage.removeItem(key)
        i--
      }
    }
    window.electron.ipcRenderer.send('RemovePlatform', namePlatform)
  }

  const accountList = (sportsBook: SportsBookType) => {
    window.electron.ipcRenderer.send('ShowAccountList', sportsBook.platform)
  }
  const handleLoginAll_Platform = () => {
    window.electron.ipcRenderer.send('LoginAll_Platform', sportsBook.platform)
  }

  const handleLogoutAll_Platform = () => {
    window.electron.ipcRenderer.send('LogoutAll_Platform', sportsBook.platform)
  }

  const handleDelayeLoginAll_Platform = () => {
    window.electron.ipcRenderer.send('DelayLoginAll_Platform', sportsBook.platform)
  }

  const handleDelayeLoginSetting_Platform = () => {
    window.electron.ipcRenderer.send('DelayLoginSetting_Platform', sportsBook.platform)
  }

  const handleQuickProxySetting_Platform = () => {
    window.electron.ipcRenderer.send('QuickProxySetting_Platform', sportsBook.platform)
  }
  const handleVIPAccountCheckerSetting__Platform = () => {
    window.electron.ipcRenderer.send('VIPAccountCheckerSetting__Platform', sportsBook.platform)
  }

  return (
    <div className="mb-4">
      <div className="flex font-bold text-lg pl-4 py-[1px] rounded-t-md items-center  bg-gradient-to-b from-white to-layout-color">
        <div className="h-full flex-1 flex items-center ">
          <p className="w-[239px] pr-14">{sportsBook.platform}</p>
          <div className="h-5 border-l-[1px] border-gray-500 flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger
                className=" focus:outline-none border border-transparent cursor-pointer hover:border-blue-500 hover:bg-blue-100 transition duration-300 mx-1 px-1  ]
                 data-[state=open]:bg-blue-200 data-[state=open]:border data-[state=open]:border-blue-300"
              >
                <div className="flex">
                  <p className="text-blue-700 text-base">Menu</p>
                  <ChevronDown className="pl-1 size-2.5 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="ml-[164px] w-64 border border-gray-400 shadow-lg rounded-none p-[1px] ">
                <DropdownMenuItem
                  className="text-blue-700  focus:text-blue-700  font-bold cursor-pointer border border-white  focus:border-blue-500 focus:bg-blue-100 "
                  onClick={handleLoginAll_Platform}
                >
                  Login All
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500 font-bold cursor-pointer border border-white  focus:border-blue-500 focus:bg-blue-100"
                  onClick={handleLogoutAll_Platform}
                >
                  Logout All
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-blue-700 font-bold cursor-pointer focus:text-blue-700  border border-white  focus:border-blue-500 focus:bg-blue-100"
                  onClick={handleDelayeLoginAll_Platform}
                >
                  Delayed Login All
                </DropdownMenuItem>
                <DropdownMenuItem
                  className=" font-bold cursor-pointer border border-white  focus:border-blue-500 focus:bg-blue-100"
                  onClick={handleDelayeLoginSetting_Platform}
                >
                  Delayed Login Setting
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className=" font-bold cursor-pointer border border-white  focus:border-blue-500 focus:bg-blue-100"
                  onClick={() => accountList(sportsBook)}
                >
                  Account List
                </DropdownMenuItem>
                <DropdownMenuItem
                  className=" font-bold cursor-pointer border border-white  focus:border-blue-500 focus:bg-blue-100"
                  onClick={handleVIPAccountCheckerSetting__Platform}
                >
                  VIP Account Checker Setting
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className=" font-bold cursor-pointer border border-white  focus:border-blue-500 focus:bg-blue-100"
                  onClick={handleQuickProxySetting_Platform}
                >
                  Quick Proxy Setting
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className=" border-l-[1px] border-gray-500 h-5 flex items-center">
            <p className="ml-2 text-xs"> Delay Sec: </p>
          </div>

          <div className="flex items-center">
            <p className="text-sm ml-2 font-medium mr-1">Normal:</p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={inputs.delayNormal}
              onChange={(e) => handleInputChange('delayNormal', e.target.value)}
              onBlur={() => handleInputBlur('delayNormal')}
              className="border border-gray-400 w-6 h-6 outline-none text-sm font-medium"
            />
          </div>
          <div className="flex items-center">
            <p className="text-sm ml-2 font-medium mr-1">Same Game:</p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={inputs.delaySameGame}
              onChange={(e) => handleInputChange('delaySameGame', e.target.value)}
              onBlur={() => handleInputBlur('delaySameGame')}
              className="border border-gray-400 w-6 h-6 outline-none text-sm font-medium"
            />
          </div>
          <div className="flex items-center font-medium text-sm ml-2">
            <p>Suggested Client:</p>
            <p className="text-red-500 ml-1 font-bold">{sportsBook.suggestedClient}</p>
          </div>
          <div className=" border-l-[1px] border-gray-500 h-5 flex items-center ml-2">
            {delayLogin && (
              <div className="flex items-center font-medium text-xs text-[#0000FF] ml-2">
                <p>Login next account in {delayLogin} sec</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex ">
          <AlertDialog>
            <AlertDialogTrigger>
              <div className=" border border-transparent hover:border hover:border-blue-500 hover:bg-blue-100 p-[2px] transition duration-300">
                <Xmark className="text-red-500 cursor-pointer  stroke-2 stroke-current " />
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent className="gap-0 p-0 w-96 h-[150px]  border-gray-400 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
              <AlertDialogHeader>
                <AlertDialogTitle className=" flex justify-between p-2 bg-blue-50 text-sm rounded-t-lg">
                  Confirmation
                </AlertDialogTitle>
                <AlertDialogDescription className=" flex justify-center items-center flex-1 py-1 ">
                  <QuestionMarkCircle className="text-blue-500  mr-1" />
                  <span className="text-black text-sm font-medium">
                    Are you sure you want to close [{sportsBook.platform}]?
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="rounded-b-lg p-0 bg-gray-100  flex items-center justify-between px-12">
                <AlertDialogCancel
                  className="h-6 w-20 bg-white text-black font-semibold rounded border border-gray-400 hover:border-blue-400 hover:bg-white"
                  onClick={() => removePlatform(sportsBook.platform)}
                >
                  Yes
                </AlertDialogCancel>
                <AlertDialogCancel className="h-6 w-20 bg-white text-black font-semibold rounded border border-gray-400 hover:border-blue-400 hover:bg-white ">
                  No
                </AlertDialogCancel>
                <AlertDialogCancel className="h-6 w-20 bg-white text-black font-semibold rounded border border-gray-400 hover:border-blue-400 hover:bg-white">
                  Cancel
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="border-solid border-[1px] border-zinc-500 py-1">
        {sportsBook.accounts &&
          sportsBook.accounts.length > 0 &&
          sportsBook.accounts.map((account, index) => (
            <AccountPlatform key={account.id} account={account} index={index} />
          ))}

        <div onClick={() => handleAddAccount(sportsBook)} className="w-8">
          <PlusCircle className="text-green-500 size-8 cursor-pointer hover:text-green-600 " />
        </div>
      </div>
    </div>
  )
}

export default React.memo(DetailSportsBook)
