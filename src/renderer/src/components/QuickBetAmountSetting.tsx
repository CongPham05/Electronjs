import { Modal } from '@renderer/components/Modal'
import { Button } from '@renderer/components/ui/button'
import { AccountPairType } from '@shared/types'
import { Dispatch, SetStateAction, useState } from 'react'

type PlatFormType = {
  platForm: string
  amount: string | number
}

export const QuickBetAmountSetting = ({
  setShowQuickBetAmountSetting,
  listAccountPair,
  setListAccountPair,
  setSelectAccountPair
}: {
  setShowQuickBetAmountSetting: Dispatch<SetStateAction<boolean>>
  listAccountPair: AccountPairType[]
  setListAccountPair: Dispatch<SetStateAction<AccountPairType[]>>
  setSelectAccountPair: Dispatch<SetStateAction<AccountPairType>>
}) => {
  const [updatedAccountPairs, setUpdatedAccountPairs] = useState<AccountPairType[]>(listAccountPair)
  const [updatedPlatform, setUpdatedPlatform] = useState<PlatFormType[]>(() => {
    const uniquePlatforms = Array.from(
      new Set(
        updatedAccountPairs.flatMap((item) => [item.account1_platForm, item.account2_platForm])
      )
    ).sort()

    return uniquePlatforms.map((platform) => ({
      platForm: platform,
      amount: '0'
    }))
  })

  const [checkAll, setCheckAll] = useState(true)
  const [checkboxStates, setCheckboxStates] = useState(updatedAccountPairs.map(() => true))
  const handleCheckAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setCheckAll(isChecked)
    setCheckboxStates(checkboxStates.map(() => isChecked))
  }

  const handleCheckboxChange = (index: number, isChecked: boolean) => {
    const updatedStates = [...checkboxStates]
    updatedStates[index] = isChecked
    setCheckboxStates(updatedStates)
    setCheckAll(updatedStates.every((state) => state))
  }

  const handleAccountAmountChange = (
    index: number,
    field: 'account1_BetAmount' | 'account2_BetAmount',
    value: string
  ) => {
    const updatedList = [...updatedAccountPairs]
    updatedList[index] = {
      ...updatedList[index],
      [field]: +value
    }
    setUpdatedAccountPairs(updatedList)
  }

  const handlePlatformAmountChange = (index: number, value: string) => {
    setUpdatedPlatform((prev) => {
      const updated = [...prev]
      updated[index].amount = value
      return updated
    })
  }

  const handleUpdate = () => {
    const checkedAccounts = updatedAccountPairs.filter((_, index) => checkboxStates[index])
    const checkPlatform = updatedPlatform.some((item) => item.amount !== '0')
    if (!checkedAccounts.length || !checkPlatform) return

    const updatedAccountPair = checkedAccounts.map((item) => {
      const updatedItem = { ...item }

      const account1Match = updatedPlatform.find(
        ({ platForm }) => platForm === updatedItem.account1_platForm
      )
      if (account1Match) {
        updatedItem.account1_BetAmount = Number(account1Match.amount)
      }

      const account2Match = updatedPlatform.find(
        ({ platForm }) => platForm === updatedItem.account2_platForm
      )
      if (account2Match) {
        updatedItem.account2_BetAmount = Number(account2Match.amount)
      }

      return updatedItem
    })

    const updatedArray = updatedAccountPairs.map((item) => {
      const match = updatedAccountPair.find(
        (bItem) => bItem.id_account1 === item.id_account1 && bItem.id_account2 === item.id_account2
      )

      if (match) {
        return {
          ...item,
          account1_BetAmount: match.account1_BetAmount,
          account2_BetAmount: match.account2_BetAmount,
          combinationPlatform: match.combinationPlatform
        }
      }

      return item
    })
    setUpdatedAccountPairs(updatedArray)
  }

  const handleSave = () => {
    setListAccountPair(updatedAccountPairs)
    setSelectAccountPair(updatedAccountPairs[0])
    setShowQuickBetAmountSetting(false)
  }
  return (
    <Modal
      title="Account Combination Odds Range Setting (Malay Odds)"
      onClose={() => setShowQuickBetAmountSetting(false)}
    >
      <div className="h-[600px] pt-2 flex flex-col  ">
        <div className=" relative h-full flex ">
          <div className="flex flex-col w-2/3">
            <p className="pl-2">Combination List</p>
            <div className=" border border-gray-800 h-[541px] overflow-auto custom-scrollbar  ">
              <table className="text-xs text-left bg-white">
                <thead>
                  <tr>
                    <th>Check</th>
                    <th>No</th>
                    <th className="w-52">Account A</th>
                    <th className="w-24">Amount A</th>
                    <th className="w-52">Account B</th>
                    <th className="w-24">Amount B</th>
                  </tr>
                </thead>
                <tbody>
                  {updatedAccountPairs.map((accountPair, index) => {
                    return (
                      <tr key={index}>
                        <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          <input
                            type="checkbox"
                            checked={checkboxStates[index]}
                            onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                          />
                        </td>
                        <td className="pl-2">
                          <span>{index + 1}</span>
                        </td>
                        <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          <div className="flex items-center">
                            {accountPair.account1_platForm}_{accountPair.account1_loginID}
                          </div>
                        </td>
                        <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            id="quantity1"
                            name="quantity1"
                            step="100"
                            min={'0'}
                            value={accountPair.account1_BetAmount}
                            onChange={(e) => {
                              let value = e.target.value
                              value = value.replace(/[^0-9.]/g, '')
                              if ((value.match(/\./g) || []).length > 1) {
                                return
                              }
                              if (value.length <= 10) {
                                handleAccountAmountChange(index, 'account1_BetAmount', value)
                              }
                            }}
                            className="pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-[#E0E0E0] disabled:pointer-events-none"
                          />
                        </td>

                        <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {accountPair.account2_platForm}_{accountPair.account2_loginID}
                        </td>

                        <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            id="quantity1"
                            name="quantity1"
                            step="100"
                            min={'0'}
                            value={accountPair.account2_BetAmount}
                            onChange={(e) => {
                              let value = e.target.value
                              value = value.replace(/[^0-9.]/g, '')
                              if ((value.match(/\./g) || []).length > 1) {
                                return
                              }
                              if (value.length <= 10) {
                                handleAccountAmountChange(index, 'account2_BetAmount', value)
                              }
                            }}
                            className="pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-[#E0E0E0] disabled:pointer-events-none"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="absolute bottom-[-24px] left-2 flex ml-2 gap-2 mt-1">
            <input
              type="checkbox"
              id="checkAll"
              checked={checkAll}
              onChange={handleCheckAllChange}
            />
            <label htmlFor="checkAll">Select all </label>
          </div>
          <div className="flex-1 flex flex-col gap-[1px]">
            <div className="flex-1 flex flex-col">
              <p className="pl-2">Sportsbook Setting</p>
              <div className=" flex-1 border border-gray-800">
                <table className="text-xs text-left">
                  <thead>
                    <tr>
                      <th className="w-52">SportsBook</th>
                      <th className="w-24 ">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {updatedPlatform.map((platform, index) => {
                      return (
                        <tr key={index}>
                          <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            <div className="flex items-center">{platform.platForm}</div>
                          </td>
                          <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            <input
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              id="quantity1"
                              name="quantity1"
                              step="100"
                              min={'0'}
                              value={platform.amount}
                              onChange={(e) => {
                                let value = e.target.value
                                value = value.replace(/[^0-9.]/g, '')
                                if ((value.match(/\./g) || []).length > 1) {
                                  return
                                }
                                if (value.length <= 10) {
                                  handlePlatformAmountChange(index, value)
                                }
                              }}
                              className="pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-[#E0E0E0] disabled:pointer-events-none"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div
              className=" cursor-pointer border border-gray-400 flex justify-center rounded-md text-[#0000FF] hover:border-blue-500 font-bold text-sm mx-1  py-[2px]"
              onClick={handleUpdate}
            >
              Update
            </div>
          </div>
        </div>
        <div className="flex justify-end ">
          <Button
            variant="outline"
            className="bg-white border border-solid border-gray-400 hover:border-blue-500 mr-2  my-2 px-8 leading-none h-6 w-24"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}
