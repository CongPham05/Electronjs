import { Modal } from '@renderer/components/Modal'
import { Button } from '@renderer/components/ui/button'
import { AccountPairType } from '@shared/types'
import { Dispatch, SetStateAction, useCallback, useState } from 'react'

type PlatFormType = {
  platForm: string
  checkOdd: number
  checkOdd_From: string
  checkOdd_To: string
}

export const QuickOddsRangeSetting = ({
  setShowQuickOddsRangeSetting,
  listAccountPair,
  setListAccountPair,
  setSelectAccountPair
}: {
  setShowQuickOddsRangeSetting: Dispatch<SetStateAction<boolean>>
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
      checkOdd: +false,
      checkOdd_From: '0.01',
      checkOdd_To: '-0.01'
    }))
  })

  const handleInputChange = (
    index: number,
    field: keyof AccountPairType,
    value: string | boolean
  ) => {
    const updatedList = [...updatedAccountPairs]
    updatedList[index] = {
      ...updatedList[index],
      [field]: +value
    }
    setUpdatedAccountPairs(updatedList)
  }

  const handlePlatformInputChange = (index: number, field: string, value: string | boolean) => {
    const updatedList = [...updatedPlatform]
    updatedList[index] = {
      ...updatedList[index],
      [field]: +value
    }
    setUpdatedPlatform(updatedList)
  }

  const handleUpdate = useCallback(() => {
    setUpdatedAccountPairs((prev) =>
      prev.map((item) => {
        const updatedItem = { ...item }

        updatedPlatform.forEach((platform) => {
          if (item.account1_platForm === platform.platForm) {
            updatedItem.account1_CheckOdd = platform.checkOdd
            updatedItem.account1_CheckOdd_From = platform.checkOdd_From
            updatedItem.account1_CheckOdd_To = platform.checkOdd_To
          }

          if (item.account2_platForm === platform.platForm) {
            updatedItem.account2_CheckOdd = platform.checkOdd
            updatedItem.account2_CheckOdd_From = platform.checkOdd_From
            updatedItem.account2_CheckOdd_To = platform.checkOdd_To
          }
        })

        return updatedItem
      })
    )
  }, [updatedPlatform])

  const handleSave = () => {
    setListAccountPair(updatedAccountPairs)
    setSelectAccountPair(updatedAccountPairs[0])
    setShowQuickOddsRangeSetting(false)
  }

  return (
    <Modal
      title="Account Combination Odds Range Setting (Malay Odds)"
      onClose={() => setShowQuickOddsRangeSetting(false)}
    >
      <div className="h-[520px] pt-2 flex flex-col  ">
        <div className=" h-full flex ">
          <div className="flex flex-col w-2/3">
            <p className="pl-2">Combination List</p>
            <div className=" border border-gray-800 h-[461px] overflow-auto custom-scrollbar  ">
              <table className="text-xs text-left bg-white mt-0">
                <thead>
                  <tr>
                    <th>No</th>
                    <th className="w-40">Account A</th>
                    <th>Check</th>
                    <th className="w-20 ">From</th>
                    <th className=" w-20">To</th>
                    <th className="w-40">Account B</th>
                    <th>Check</th>
                    <th className="w-20 ">From</th>
                    <th className="w-20 ">To</th>
                  </tr>
                </thead>
                <tbody>
                  {updatedAccountPairs.map((accountPair, index) => {
                    return (
                      <tr key={index}>
                        <td className="pl-2">
                          <span>{index + 1}</span>
                        </td>
                        <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          <div className="flex items-center">
                            {accountPair.account1_platForm}_{accountPair.account1_loginID}
                          </div>
                        </td>
                        <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          <input
                            type="checkbox"
                            checked={Boolean(accountPair.account1_CheckOdd) || false}
                            onChange={(e) =>
                              handleInputChange(index, 'account1_CheckOdd', e.target.checked)
                            }
                          />
                        </td>
                        <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            id="quantity1"
                            name="quantity1"
                            step="0.01"
                            min={'-1.000'}
                            max={'1.000'}
                            value={accountPair.account1_CheckOdd_From}
                            onChange={(e) => {
                              let value = e.target.value
                              value = value.replace(/[^0-9.]/g, '')
                              if ((value.match(/\./g) || []).length > 1) {
                                return
                              }
                              if (value.length <= 10) {
                                handleInputChange(index, 'account1_CheckOdd_From', e.target.value)
                              }
                            }}
                            className="pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-[#E0E0E0] disabled:pointer-events-none"
                          />
                        </td>
                        <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            id="quantity1"
                            name="quantity1"
                            step="0.01"
                            min={'-1.000'}
                            max={'1.000'}
                            value={accountPair.account1_CheckOdd_To}
                            onChange={(e) => {
                              let value = e.target.value
                              value = value.replace(/[^0-9.]/g, '')
                              if ((value.match(/\./g) || []).length > 1) {
                                return
                              }
                              if (value.length <= 10) {
                                handleInputChange(index, 'account1_CheckOdd_To', e.target.value)
                              }
                            }}
                            className="pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-[#E0E0E0] disabled:pointer-events-none"
                          />
                        </td>
                        <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {accountPair.account2_platForm}_{accountPair.account2_loginID}
                        </td>
                        <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          <input
                            type="checkbox"
                            checked={Boolean(accountPair.account2_CheckOdd) || false}
                            onChange={(e) =>
                              handleInputChange(index, 'account2_CheckOdd', e.target.checked)
                            }
                          />
                        </td>
                        <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            id="quantity1"
                            name="quantity1"
                            step="0.01"
                            min={'-1.000'}
                            max={'1.000'}
                            value={accountPair.account2_CheckOdd_From}
                            onChange={(e) => {
                              let value = e.target.value
                              value = value.replace(/[^0-9.]/g, '')
                              if ((value.match(/\./g) || []).length > 1) {
                                return
                              }
                              if (value.length <= 10) {
                                handleInputChange(index, 'account2_CheckOdd_From', e.target.value)
                              }
                            }}
                            className="pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-[#E0E0E0] disabled:pointer-events-none"
                          />
                        </td>
                        <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            id="quantity1"
                            name="quantity1"
                            step="0.01"
                            min={'-1.000'}
                            max={'1.000'}
                            value={accountPair.account2_CheckOdd_To}
                            onChange={(e) => {
                              let value = e.target.value
                              value = value.replace(/[^0-9.]/g, '')
                              if ((value.match(/\./g) || []).length > 1) {
                                return
                              }
                              if (value.length <= 10) {
                                handleInputChange(index, 'account2_CheckOdd_To', e.target.value)
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
          <div className="flex-1 flex flex-col gap-[1px]">
            <div className="flex-1 flex flex-col">
              <p className="pl-2">Sportsbook Setting</p>
              <div className=" flex-1 border border-gray-800">
                <table className="text-xs text-left">
                  <thead>
                    <tr>
                      <th className="w-40">SportsBook</th>
                      <th>Check</th>
                      <th className="w-20 ">From</th>
                      <th className=" w-20">To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {updatedPlatform.map((platform, index) => {
                      return (
                        <tr key={index}>
                          <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            <div className="flex items-center">{platform.platForm}</div>
                          </td>
                          <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            <input
                              type="checkbox"
                              checked={Boolean(platform.checkOdd)}
                              onChange={(e) =>
                                handlePlatformInputChange(index, 'checkOdd', e.target.checked)
                              }
                            />
                          </td>
                          <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            <input
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              id="quantity1"
                              name="quantity1"
                              step="0.01"
                              min={'-1.000'}
                              max={'1.000'}
                              value={platform.checkOdd_From}
                              onChange={(e) => {
                                let value = e.target.value
                                value = value.replace(/[^0-9.]/g, '')
                                if ((value.match(/\./g) || []).length > 1) {
                                  return
                                }
                                if (value.length <= 10) {
                                  handlePlatformInputChange(index, 'checkOdd_From', e.target.value)
                                }
                              }}
                              className="pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-[#E0E0E0] disabled:pointer-events-none"
                            />
                          </td>
                          <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            <input
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              id="quantity1"
                              name="quantity1"
                              step="0.01"
                              min={'-1.000'}
                              max={'1.000'}
                              value={platform.checkOdd_To}
                              onChange={(e) => {
                                let value = e.target.value
                                value = value.replace(/[^0-9.]/g, '')
                                if ((value.match(/\./g) || []).length > 1) {
                                  return
                                }
                                if (value.length <= 10) {
                                  handlePlatformInputChange(index, 'checkOdd_To', e.target.value)
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
              className=" cursor-pointer border border-gray-400 flex justify-center rounded-md text-[#0000FF] hover:border-blue-500 font-bold text-sm mx-1 py-[2px]"
              onClick={handleUpdate}
            >
              Update
            </div>
          </div>
        </div>
        <div className="flex justify-end ">
          <Button
            variant="outline"
            className="bg-white border border-solid border-gray-400 hover:border-blue-500 mr-1  my-2 px-8 leading-none h-6 w-24"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}
