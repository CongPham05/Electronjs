import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import Xcircle from '@renderer/icons/x-circle'
import { Checkbox } from '@/components/ui/checkbox'
import { AccountType } from '@shared/types'
import QuestionMarkCircle from '@renderer/icons/question-mark-circle'
import ExclamationTriangle from '@renderer/icons/exclamation-triangle'

interface AccountPlatformProps {
  account: AccountType
  index: number
}

const CheckboxField: React.FC<{
  id: string
  label: string
  checked: boolean
  onChange: () => void
}> = ({ id, label, checked, onChange }) => (
  <div className={twMerge('flex items-center pr-3', checked ? 'bg-[#b0e0e6]' : 'bg-[#f0f8ff]')}>
    <Checkbox
      id={id}
      className="bg-white data-[state=checked]:bg-white data-[state=checked]:text-zinc-900 "
      checked={checked}
      onCheckedChange={onChange}
    />
    <label htmlFor={id} className="pl-1.5 cursor-pointer">
      {label}
    </label>
  </div>
)

const AccountPlatform: React.FC<AccountPlatformProps> = ({ account, index }) => {
  const [buttonText, setButtonText] = useState(account.status)
  const [log, setLog] = useState<string | null>(account.textLog)
  const [betCredit, setBetCredit] = useState<string>(account.credit)
  const [checkBet, setCheckBet] = useState<boolean>(Boolean(account.bet))
  const [checkRefresh, setRefresh] = useState<boolean>(Boolean(account.refresh))
  const [checkAutoLogin, setAutoLogin] = useState<boolean>(Boolean(account.autoLogin))
  const [checkLockURL, setLockURL] = useState<boolean>(Boolean(account.lockURL))

  const [statusLogin, setStatusLogin] = useState<string | null>(account.statusLogin)

  const previousValues = useRef({
    buttonText: account.status,
    log: account.textLog,
    betCredit: account.credit,
    checkBet: Boolean(account.bet),
    checkRefresh: Boolean(account.refresh),
    checkAutoLogin: Boolean(account.autoLogin),
    checkLockURL: Boolean(account.lockURL),
    statusLogin: account.statusLogin
  })

  useEffect(() => {
    const handleDataLog = (_: unknown, data: AccountType) => {
      if (data.id !== account.id) return

      const { status, textLog, credit, bet, refresh, autoLogin, lockURL, statusLogin } = data

      if (previousValues.current.buttonText !== status) {
        setButtonText(status)
        previousValues.current.buttonText = status
      }
      if (previousValues.current.log !== textLog) {
        setLog(textLog)
        previousValues.current.log = textLog
      }
      if (previousValues.current.betCredit !== credit) {
        setBetCredit(credit)
        previousValues.current.betCredit = credit
      }
      if (previousValues.current.statusLogin !== statusLogin) {
        setStatusLogin(statusLogin)
        previousValues.current.statusLogin = statusLogin
      }
      if (previousValues.current.checkBet !== Boolean(bet)) {
        setCheckBet(Boolean(bet))
        previousValues.current.checkBet = Boolean(bet)
      }
      if (previousValues.current.checkRefresh !== Boolean(refresh)) {
        setRefresh(Boolean(refresh))
        previousValues.current.checkRefresh = Boolean(refresh)
      }
      if (previousValues.current.checkAutoLogin !== Boolean(autoLogin)) {
        setAutoLogin(Boolean(autoLogin))
        previousValues.current.checkAutoLogin = Boolean(autoLogin)
      }
      if (previousValues.current.checkLockURL !== Boolean(lockURL)) {
        setLockURL(Boolean(lockURL))
        previousValues.current.checkLockURL = Boolean(lockURL)
      }
    }

    window.electron.ipcRenderer.on('DataUpdateAccount', handleDataLog)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('DataUpdateAccount')
    }
  }, [])

  const deleteAccount = useCallback(() => {
    window.electron.ipcRenderer.send('DeleteAccount', account)
  }, [account])

  const handleCheckboxChange = useCallback(
    (field: string, setState: React.Dispatch<React.SetStateAction<boolean>>) => {
      setState((prev) => {
        const newValue = !prev
        window.electron.ipcRenderer.send('UpdateAccount', {
          accountId: account.id,
          field,
          value: newValue ? 1 : 0
        })
        return newValue
      })
    },
    [account]
  )

  const handleAction = () => {
    if (buttonText === 'Login') {
      window.electron.ipcRenderer.send('LoginAccount', account)

      setButtonText('In-Progress')
      setLog('Waiting for login...')
    }
    if (buttonText === 'Logout' || buttonText === 'Exit') {
      window.electron.ipcRenderer.send('LogoutAccount', account)
      setButtonText('Login')
      setLog(null)
    }
  }

  const buttonClass = useMemo(() => {
    switch (buttonText) {
      case 'Logout':
      case 'Exit':
        return 'underline text-[#FF0000] hover:cursor-pointer'
      case 'In-Progress':
        return 'text-[#FF8C00]'
      default:
        return 'underline text-[#0000FF] hover:cursor-pointer '
    }
  }, [buttonText])

  const handleAccountLoginForm = (account: AccountType) => {
    window.electron.ipcRenderer.send('AccountLoginForm', account)
  }

  const getButtonClass = useCallback(() => {
    if (
      ((buttonText === 'Logout' || buttonText === 'Exit') && statusLogin === 'Fail') ||
      (buttonText === 'In-Progress' && log?.includes('ERROR'))
    ) {
      return 'bg-red-400'
    }

    if (['In-Progress', 'Logout'].includes(buttonText)) {
      return 'bg-green-400'
    }

    return 'bg-[#a9a9a9]'
  }, [buttonText, statusLogin, log])

  return (
    <div className="flex items-center">
      <div className="flex items-center w-64">
        <AlertDialog>
          <AlertDialogTrigger>
            <Xcircle className="text-red-500 size-8 cursor-pointer hover:text-red-600 " />
          </AlertDialogTrigger>
          <AlertDialogContent className="gap-0 p-0 w-80 h-[150px]  border-gray-400 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
            <AlertDialogHeader>
              <AlertDialogTitle className=" flex justify-between p-2 bg-blue-50 text-sm rounded-t-lg  ">
                Confirmation
              </AlertDialogTitle>
              <AlertDialogDescription className=" flex justify-center items-center flex-1 py-1 ">
                <QuestionMarkCircle className="text-blue-500  mr-1" />
                <span className="text-black text-sm font-medium">Confirm delete this item?</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="rounded-b-lg p-0 bg-gray-100  flex items-center justify-between px-6">
              <AlertDialogCancel
                onClick={deleteAccount}
                className="h-6 w-20 bg-white text-black font-semibold rounded border border-gray-400 hover:border-blue-400 hover:bg-white"
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
        <div className="ml-1 mr-2">{index + 1}</div>
        <div className="flex">
          {!account.statusPair && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <ExclamationTriangle
                    className={twMerge(
                      'size-5  mr-1',
                      !account.loginID || !account.password
                        ? 'text-red-500 hover:text-[#FF0000]'
                        : 'text-[#FFA500] hover:text-[#FF8C00]'
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-white text-blue-600 border border-gray-300 rounded-md ml-20 mb-[-8px] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
                  {!account.loginID || !account.password ? (
                    <div>
                      <p className="text-gray-700 font-bold ">Cannot login to this account</p>
                      <p className="text-gray-700  ">
                        Account: Not setup enough username or password
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 font-bold ">
                        Cannot bet on this account - Account pair not set up
                      </p>
                      <p className="text-gray-700  ">
                        Account: {account.platformName}-{account.loginID} is not set up for betting
                      </p>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <div
            className={twMerge(
              'underline',
              !account.statusPair || !account.loginID || !account.password
                ? ' text-[#FF0000]'
                : ' text-[#0000FF]'
            )}
            onClick={() => {
              handleAccountLoginForm(account)
            }}
          >{`${account.platformName}-${account.loginID ?? ''}`}</div>
        </div>
      </div>
      <p className="border border-gray-500 w-[194px] h-6 bg-white pl-1 mr-2">{account.loginURL}</p>
      <button
        onClick={account.loginID && account.password ? handleAction : undefined}
        className={twMerge(
          'mr-4 font-bold w-20',
          account.loginID && account.password ? buttonClass : 'text-gray-600'
        )}
      >
        {buttonText}
      </button>

      <div className="flex h-6 justify-center items-center">
        <div className="flex w-20">
          <div className="">Cr:</div>
          <p className=" ml-2 h-full">
            {buttonText === 'Login' || buttonText === 'In-Progress' ? 0 : betCredit}
          </p>
        </div>

        <div className="flex  h-full ">
          <CheckboxField
            key="checkbox_bet"
            id={`${account.id}_checkbox_bet`}
            label="Bet"
            checked={checkBet}
            onChange={() => handleCheckboxChange('bet', setCheckBet)}
          />
          <CheckboxField
            key="checkbox_refresh"
            id={`${account.id}_checkbox_refresh`}
            label="Refresh"
            checked={checkRefresh}
            onChange={() => handleCheckboxChange('refresh', setRefresh)}
          />
          <CheckboxField
            key="checkbox_autoLogin"
            id={`${account.id}_checkbox_autoLogin`}
            label="AutoLogin"
            checked={checkAutoLogin}
            onChange={() => handleCheckboxChange('autoLogin', setAutoLogin)}
          />
          <CheckboxField
            key="checkbox_lockURL"
            id={`${account.id}_checkbox_lockURL`}
            label="LockURL"
            checked={checkLockURL}
            onChange={() => handleCheckboxChange('lockURL', setLockURL)}
          />
        </div>
      </div>
      <div
        className={twMerge(
          'flex-1 h-6 flex items-center justify-start overflow-hidden text-ellipsis mr-5',
          getButtonClass()
        )}
      >
        {['In-Progress', 'Logout', 'Exit'].includes(buttonText) && (
          <p className="px-2 whitespace-nowrap overflow-hidden text-ellipsis">{log}</p>
        )}
      </div>
    </div>
  )
}

export default React.memo(AccountPlatform)
