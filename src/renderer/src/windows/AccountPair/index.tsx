import { Button } from '@/components/ui/button'
import { Combination } from '@renderer/components/Combination'
import { SettingCombination } from '@renderer/components/SettingCombination'
import { Account1Account2Options } from '@renderer/components/Account1Account2Options'
import { SettingQuickAccountPair } from '@renderer/components/SettingQuickAccountPair'
import { useEffect, useState } from 'react'
import { AccountPairType } from '@shared/types'

let isClearInvalidAccount = false
export const AccountPair = () => {
  const [listAccountPair, setListAccountPair] = useState<AccountPairType[]>([])
  const [selectAccountPair, setSelectAccountPair] = useState<AccountPairType>(listAccountPair[0])

  useEffect(() => {
    const fetchListAccountPair = async () => {
      const data = (await window.electron.ipcRenderer.invoke(
        'GetListAccountPair'
      )) as AccountPairType[]
      setListAccountPair(data)
      setSelectAccountPair(data[0])
    }
    fetchListAccountPair()
  }, [])

  useEffect(() => {
    const handleData = (_, data: AccountPairType[]) => {
      const result = [
        ...listAccountPair,
        ...data.filter(
          (itemA) =>
            !listAccountPair.some(
              (itemB) =>
                (itemB.id_account1 === itemA.id_account1 ||
                  itemB.id_account2 === itemA.id_account1) &&
                (itemB.id_account2 === itemA.id_account2 || itemB.id_account1 === itemA.id_account2)
            )
        )
      ]
      setListAccountPair(result)
      setSelectAccountPair(listAccountPair[0])
    }

    window.electron.ipcRenderer.on('GetListAccountPairUpdate', handleData)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('GetListAccountPairUpdate')
    }
  }, [listAccountPair])

  const handleClickAccountPair = (account: AccountPairType) => {
    setSelectAccountPair(account)
  }

  const handleChange_amount = (accountBetAmount: string, value: string) => {
    let normalizedValue = Number(value) || 0
    if (normalizedValue > 99999) {
      normalizedValue = 99999
    }

    if (selectAccountPair) {
      const dataUpdate = {
        ...selectAccountPair,
        account1_BetAmount:
          accountBetAmount == 'account1_BetAmount' ? value : selectAccountPair.account1_BetAmount,
        account2_BetAmount:
          accountBetAmount == 'account2_BetAmount' ? value : selectAccountPair.account2_BetAmount
      }

      setSelectAccountPair(dataUpdate)

      const updatedArray = listAccountPair.map((item) => {
        if (
          item.id_account1 === selectAccountPair.id_account1 &&
          item.id_account2 === selectAccountPair.id_account2
        ) {
          return {
            ...item,
            account1_BetAmount:
              accountBetAmount == 'account1_BetAmount' ? normalizedValue : item.account1_BetAmount,
            account2_BetAmount:
              accountBetAmount == 'account2_BetAmount' ? normalizedValue : item.account2_BetAmount
          }
        }
        return item
      })

      setListAccountPair(updatedArray)
    }
  }

  const handleChange_selectBet = (account: 'account1' | 'account2') => (value: string) => {
    if (selectAccountPair) {
      const dataUpdate = {
        ...selectAccountPair,
        account1_SelectBet: account == 'account1' ? value : selectAccountPair.account1_SelectBet,
        account2_SelectBet: account == 'account2' ? value : selectAccountPair.account2_SelectBet
      }
      setSelectAccountPair(dataUpdate)
      const updatedArray = listAccountPair.map((item) => {
        if (
          item.id_account1 === selectAccountPair.id_account1 &&
          item.id_account2 === selectAccountPair.id_account2
        ) {
          return {
            ...item,
            account1_SelectBet:
              account == 'account1' ? value : selectAccountPair.account1_SelectBet,
            account2_SelectBet: account == 'account2' ? value : selectAccountPair.account2_SelectBet
          }
        }
        return item
      })

      setListAccountPair(updatedArray)
    }
  }
  const handleChange_checkBox = (account: string, value: boolean) => {
    if (selectAccountPair) {
      const dataUpdate = {
        ...selectAccountPair,
        account1_CheckOdd: account == 'account1' ? +value : selectAccountPair.account1_CheckOdd,
        account2_CheckOdd: account == 'account2' ? +value : selectAccountPair.account2_CheckOdd
      }
      setSelectAccountPair(dataUpdate)
      const updatedArray = listAccountPair.map((item) => {
        if (
          item.id_account1 === selectAccountPair.id_account1 &&
          item.id_account2 === selectAccountPair.id_account2
        ) {
          return {
            ...item,
            account1_CheckOdd: account == 'account1' ? +value : selectAccountPair.account1_CheckOdd,
            account2_CheckOdd: account == 'account2' ? +value : selectAccountPair.account2_CheckOdd
          }
        }
        return item
      })

      setListAccountPair(updatedArray)
    }
  }

  const handleChange_OddFrom = (account: string, value: string) => {
    let normalizedValue = Number(value) || -1.0
    if (normalizedValue > 1) {
      normalizedValue = 1.0
    }

    if (selectAccountPair) {
      const dataUpdate = {
        ...selectAccountPair,
        account1_CheckOdd_From:
          account == 'account1' ? value : selectAccountPair.account1_CheckOdd_From,
        account2_CheckOdd_From:
          account == 'account2' ? value : selectAccountPair.account2_CheckOdd_From
      }

      setSelectAccountPair(dataUpdate)

      const updatedArray = listAccountPair.map((item) => {
        if (
          item.id_account1 === selectAccountPair.id_account1 &&
          item.id_account2 === selectAccountPair.id_account2
        ) {
          return {
            ...item,
            account1_CheckOdd_From:
              account == 'account1' ? normalizedValue : item.account1_CheckOdd_From,
            account2_CheckOdd_From:
              account == 'account2' ? normalizedValue : item.account2_CheckOdd_From
          }
        }
        return item
      })

      setListAccountPair(updatedArray)
    }
  }
  const handleChange_OddTo = (account: string, value: string) => {
    let normalizedValue = Number(value) || -1.0
    if (normalizedValue > 1) {
      normalizedValue = 1.0
    }

    if (selectAccountPair) {
      const dataUpdate = {
        ...selectAccountPair,
        account1_CheckOdd_To:
          account == 'account1' ? value : selectAccountPair.account1_CheckOdd_To,
        account2_CheckOdd_To: account == 'account2' ? value : selectAccountPair.account2_CheckOdd_To
      }

      setSelectAccountPair(dataUpdate)

      const updatedArray = listAccountPair.map((item) => {
        if (
          item.id_account1 === selectAccountPair.id_account1 &&
          item.id_account2 === selectAccountPair.id_account2
        ) {
          return {
            ...item,
            account1_CheckOdd_To:
              account == 'account1' ? normalizedValue : item.account1_CheckOdd_To,
            account2_CheckOdd_To:
              account == 'account2' ? normalizedValue : item.account2_CheckOdd_To
          }
        }
        return item
      })

      setListAccountPair(updatedArray)
    }
  }

  const removeAccountPair = () => {
    const filterAccountPair = listAccountPair.filter(
      (accountPair) => accountPair !== selectAccountPair
    )

    setListAccountPair(filterAccountPair)
    setSelectAccountPair(filterAccountPair[0])
  }

  const checkClearInvalidAccount = () => {
    isClearInvalidAccount = true
  }
  const saveExit = () => {
    if (isClearInvalidAccount) {
      window.electron.ipcRenderer.send(
        'CloseAccountPairWindow_ClearInvalidAccount',
        listAccountPair
      )
      return
    }
    window.electron.ipcRenderer.send('CloseAccountPairWindow', listAccountPair)
  }

  return (
    <div className="bg-layout-color relative h-full pt-4 pb-16 px-2.5 flex  ">
      <div className=" h-full w-full border border-zinc-300 flex pb-2">
        <div className="flex flex-col ">
          <Account1Account2Options
            listAccountPair={listAccountPair}
            setListAccountPair={setListAccountPair}
            setSelectAccountPair={setSelectAccountPair}
            handleRemoveAccountPair={removeAccountPair}
            checkClearInvalidAccount={checkClearInvalidAccount}
          />
          <SettingCombination
            selectAccountPair={selectAccountPair}
            handleChange_amount={handleChange_amount}
            handleChange_selectBet={handleChange_selectBet}
            handleChange_checkBox={handleChange_checkBox}
            handleChange_OddFrom={handleChange_OddFrom}
            handleChange_OddTo={handleChange_OddTo}
          />
        </div>
        <div className="flex flex-col w-full pb-2">
          <Combination
            listAccountPair={listAccountPair}
            selectAccountPair={selectAccountPair}
            handleClickAccountPair={handleClickAccountPair}
          />
          <SettingQuickAccountPair
            listAccountPair={listAccountPair}
            setListAccountPair={setListAccountPair}
            setSelectAccountPair={setSelectAccountPair}
          />
        </div>
      </div>

      <div className="absolute bottom-5 right-5">
        <Button
          variant="outline"
          className=" border  border-solid  border-gray-400 hover:border-blue-500 py-0 px-8 leading-none h-7 font-bold w-36"
          onClick={saveExit}
        >
          Save & Exit
        </Button>
      </div>
    </div>
  )
}
