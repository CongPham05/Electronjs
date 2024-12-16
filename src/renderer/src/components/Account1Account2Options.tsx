import { AlertError } from '@renderer/components/AlertError'
import { Confirmation } from '@renderer/components/Confirmation'
import ExclamationTriangle from '@renderer/icons/exclamation-triangle'
import QuestionMarkCircle from '@renderer/icons/question-mark-circle'
import { createCombinations } from '@renderer/lib/createCombinations'
import { sortPlatform } from '@renderer/lib/sortPlatform'
import { AccountPairType, AccountType } from '@shared/types'
import clsx from 'clsx'
import { memo, useCallback, useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

const Account1Account2OptionsComponent = ({
  listAccountPair,
  setListAccountPair,
  setSelectAccountPair,
  handleRemoveAccountPair,
  checkClearInvalidAccount
}) => {
  const [listAccount, setListAccount] = useState<AccountType[]>([])
  const [account1, setAccount1] = useState<AccountType>()
  const [account2, setAccount2] = useState<AccountType>()

  const [title, setTitle] = useState('')
  const [messageError, setMessageError] = useState('')
  const [showAlertError, setShowAlertError] = useState(false)
  const [showAlertMsg, setShowAlertMsg] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.electron.ipcRenderer.invoke('GetAccount1Account2')
      setListAccount(data)
    }
    fetchData()
  }, [])

  const [actionYes, setActionYes] = useState<() => void>(() => {})

  const handleClickAccount1 = (account: AccountType) => {
    setAccount1(account)
  }
  const handleClickAccount2 = (account: AccountType) => {
    setAccount2(account)
  }
  const handleAddClick = async () => {
    setTitle('Error')

    if (!account1 || !account2) {
      setMessageError('No item selected')
      setShowAlertError(true)
      return
    }

    const arrayPair = [account1, account2]

    arrayPair.sort((obj1, obj2) =>
      obj1.platformName === obj2.platformName
        ? obj1.id - obj2.id
        : obj1.platformName.localeCompare(obj2.platformName)
    )

    const isPairExist = listAccountPair.some(
      (pair) =>
        (pair.id_account1 === arrayPair[0].id && pair.id_account2 === arrayPair[1].id) ||
        (pair.id_account1 === arrayPair[1].id && pair.id_account2 === arrayPair[0].id)
    )

    if (isPairExist) {
      setMessageError(`This account pair already exists`)
      setShowAlertError(true)
      return
    }

    const dataAccountPair = {
      id_account1: arrayPair[0].id,
      account1_loginID: arrayPair[0].loginID,
      account1_platForm: arrayPair[0].platformName,
      account1_BetAmount: 100,
      account1_SelectBet: 'BetAll',
      account1_CheckOdd: 0,
      account1_CheckOdd_From: '0.01',
      account1_CheckOdd_To: '-0.01',

      id_account2: arrayPair[1].id,
      account2_loginID: arrayPair[1].loginID,
      account2_platForm: arrayPair[1].platformName,
      account2_BetAmount: 100,
      account2_SelectBet: 'BetAll',
      account2_CheckOdd: 0,
      account2_CheckOdd_From: '0.01',
      account2_CheckOdd_To: '-0.01',

      combinationPlatform: sortPlatform(arrayPair[0], arrayPair[1])
    }

    setListAccountPair((prevState) => [...prevState, dataAccountPair])
    setSelectAccountPair(dataAccountPair)
  }

  const removeAccountPair = () => {
    if (!listAccountPair.length) {
      setMessageError('No item selected')
      setShowAlertError(true)
      return
    }
    showConfirmation('Confirmation', 'Delete selected combinations?', actionRemoveAccountPair)
  }

  const handleAddAll = () => {
    if (!listAccount.length) {
      setMessageError('No item selected')
      setShowAlertError(true)
      return
    }

    showConfirmation('Confirmation', 'Add all combinations?', actionAddAllAccountPair)
  }
  const actionAddAllAccountPair = () => {
    setListAccountPair([])
    const dataAddAllAccountPair = createCombinations(listAccount)
    setListAccountPair(dataAddAllAccountPair)
    setSelectAccountPair(dataAddAllAccountPair[0])
    setShowAlertMsg(false)
  }

  const actionRemoveAccountPair = () => {
    setShowAlertMsg(false)
    handleRemoveAccountPair()
  }

  const removeAllAccountPair = () => {
    if (!listAccountPair.length) {
      setMessageError('No item selected')
      setShowAlertError(true)
      return
    }

    showConfirmation('Confirmation', 'Delete all combinations?', actionRemoveAllAccountPair)
  }
  const actionRemoveAllAccountPair = () => {
    setListAccountPair([])
    setSelectAccountPair(null)
    setShowAlertMsg(false)
  }

  const addSelectionAccountPair = () => {
    window.electron.ipcRenderer.send('ShowAddSelectionAccountPair')
  }

  const showConfirmation = useCallback(
    (title: string, message: string, actionYesCallback: () => void) => {
      setTitle(title)
      setMessageError(message)
      setShowAlertMsg(true)
      setActionYes(() => actionYesCallback)
    },
    []
  )

  const handleClearInvalidAccount = () => {
    showConfirmation(
      'Confirmation',
      'Confirm to clear invalid account(s)?',
      actionClearInvalidAccount
    )
  }
  const actionClearInvalidAccount = () => {
    setShowAlertMsg(false)

    const validAccounts = listAccount.filter(
      (account) => account.bet === 1 && account.statusDelete === 0
    )
    setListAccount(validAccounts)
    const validAccountIds = validAccounts.map((item) => item.id)

    const filteredAccountPairs = listAccountPair.filter(
      (item: AccountPairType) =>
        validAccountIds.includes(item.id_account1) && validAccountIds.includes(item.id_account2)
    )
    setListAccountPair(filteredAccountPairs)
    checkClearInvalidAccount()
  }
  return (
    <div className="flex-1 flex py-3.5 px-2 overflow-hidden">
      <div className="flex ">
        <div className="flex flex-col ">
          <div>Account1</div>
          <div className="flex-1 border border-gray-500 w-96 bg-white py-1 custom-scrollbar overflow-y-auto">
            {listAccount.map((account) => (
              <p
                key={account.id}
                className={twMerge(
                  'py-0.5 cursor-pointer hover:bg-blue-500 hover:text-white pl-2 transition duration-300',
                  clsx({
                    'border-blue-500 bg-blue-500 text-white': account1?.id === account.id
                  })
                )}
                onClick={() => handleClickAccount1(account)}
              >
                {account.platformName}
                {'-'}
                {account?.loginID}
              </p>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <div>Account2</div>
          <div className="flex-1 border border-gray-500 w-96 bg-white py-1 custom-scrollbar overflow-y-auto">
            {listAccount.map((account) => (
              <p
                key={account.id}
                className={twMerge(
                  'py-0.5 cursor-pointer hover:bg-blue-500 hover:text-white pl-2 transition duration-300',
                  clsx({
                    'border-blue-500 bg-blue-500 text-white': account2?.id === account.id
                  })
                )}
                onClick={() => handleClickAccount2(account)}
              >
                {account.platformName}
                {'-'}
                {account.loginID}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 py-5 pl-6">
        <button
          className="outline-none border border-zinc-400 w-44 font-bold text-[#0000FF] rounded p-[1px] bg-white hover:border-blue-400"
          onClick={handleAddClick}
        >
          Add {'>'}
        </button>
        <button
          className=" outline-none border border-zinc-400 w-44 font-bold text-[#FF0000] rounded p-[1px] bg-white hover:border-blue-400"
          onClick={removeAccountPair}
        >
          {'<<'} Remove
        </button>

        <button
          className="outline-none border border-zinc-400 w-44 font-bold text-[#0000FF] rounded p-[1px] bg-white hover:border-blue-400"
          onClick={handleAddAll}
        >
          Add All {'>>'}
        </button>
        <button
          className="outline-none border border-zinc-400 w-44 font-bold text-[#FF0000] rounded p-[1px] bg-white hover:border-blue-400"
          onClick={removeAllAccountPair}
        >
          {'<<'} Remove All
        </button>
        <button
          className="outline-none border border-zinc-400 w-44 font-bold text-[#0000FF] rounded p-[1px] bg-white hover:border-blue-400"
          onClick={addSelectionAccountPair}
        >
          Add Selection {'>>>'}
        </button>

        <button className="outline-none border border-zinc-400 w-44 font-bold text-black  rounded p-[1px] bg-white  hover:border-blue-400   flex justify-center ">
          <div className="bg-[#fab8b8] m-[1px] w-full" onClick={handleClearInvalidAccount}>
            Clear Invalid Account
          </div>
        </button>
      </div>
      <AlertError
        showAlertDialog={showAlertError}
        setShowAlertDialog={setShowAlertError}
        title={title}
        messageError={messageError}
        ReactElement={<ExclamationTriangle className="size-11 text-[#FF8C00]   mr-1" />}
      />
      <Confirmation
        title={title}
        messageError={messageError}
        showAlertDialog={showAlertMsg}
        setShowAlertDialog={setShowAlertMsg}
        actionYes={actionYes}
        ReactElement={<QuestionMarkCircle className="text-blue-500  mr-1" />}
      />
    </div>
  )
}

export const Account1Account2Options = memo(Account1Account2OptionsComponent)
