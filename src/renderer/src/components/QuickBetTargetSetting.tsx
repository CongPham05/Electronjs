import { Modal } from '@renderer/components/Modal'
import { Button } from '@renderer/components/ui/button'
import { Label } from '@renderer/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group'
import BoxLabel from '@renderer/layouts/BoxLabel'
import { AccountPairType } from '@shared/types'
import { Dispatch, SetStateAction, useState } from 'react'

export const QuickBetTargetSetting = ({
  setShowQuickBetTargetSetting,
  listAccountPair,
  setListAccountPair,
  setSelectAccountPair
}: {
  setShowQuickBetTargetSetting: Dispatch<SetStateAction<boolean>>
  listAccountPair: AccountPairType[]
  setListAccountPair: Dispatch<SetStateAction<AccountPairType[]>>
  setSelectAccountPair: Dispatch<SetStateAction<AccountPairType>>
}) => {
  const [updatedAccountPairs] = useState<AccountPairType[]>(listAccountPair)

  const [checkedStates, setCheckedStates] = useState(updatedAccountPairs.map(() => false))
  const [isAllChecked, setIsAllChecked] = useState(false)

  const [showModalTargetA, setShowModalTargetA] = useState(false)
  const [showModalTargetB, setShowModalTargetB] = useState(false)

  const [targetASetting, setTargetASetting] = useState<string | undefined>(undefined)
  const [targetBSetting, setTargetBSetting] = useState<string | undefined>(undefined)

  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    targetSetter: Dispatch<SetStateAction<boolean>>
  ) => {
    targetSetter(event.target.checked)
  }

  const handleSelectAll = () => {
    const newCheckedState = !isAllChecked
    setIsAllChecked(newCheckedState)
    setCheckedStates(updatedAccountPairs.map(() => newCheckedState))
  }

  const handleCheckboxChangeCombination = (index) => {
    const updatedStates = [...checkedStates]
    updatedStates[index] = !checkedStates[index]
    setCheckedStates(updatedStates)
    setIsAllChecked(updatedStates.every((state) => state))
  }

  const handleOkClick = () => {
    const checkedAccountPairs = updatedAccountPairs.filter((_, index) => checkedStates[index])
    if (!checkedAccountPairs.length) {
      setShowQuickBetTargetSetting(false)
    }

    if (!targetASetting && !targetBSetting) {
      setShowQuickBetTargetSetting(false)
    }

    const updatedA = updatedAccountPairs.map((itemA) => {
      const match = checkedAccountPairs.find(
        (itemB) =>
          itemB.id_account1 === itemA.id_account1 && itemB.id_account2 === itemA.id_account2
      )

      if (match) {
        return {
          ...itemA,
          account1_SelectBet: targetASetting ?? match.account1_SelectBet,
          account2_SelectBet: targetBSetting ?? match.account2_SelectBet
        }
      }

      return itemA
    })

    setListAccountPair(updatedA)
    setSelectAccountPair(updatedA[0])
  }

  return (
    <Modal
      title="Account Combination Bet Target Setting"
      onClose={() => setShowQuickBetTargetSetting(false)}
    >
      <div className="h-[520px] pt-2 flex flex-col bg-layout-color rounded-b-xl ">
        <div className=" flex ">
          <div className="flex flex-col w-[350px]">
            <p className="pl-2">Account Combination Pair</p>
            <div className="h-[431px] border border-gray-400 bg-white  overflow-auto custom-scrollbar">
              {updatedAccountPairs.map((accountPair, index) => {
                return (
                  <div key={index} className="flex ml-2 gap-2 items-center">
                    <input
                      id={`${accountPair.account1_loginID}_${accountPair.account2_loginID}`}
                      type="checkbox"
                      checked={checkedStates[index]}
                      onChange={() => handleCheckboxChangeCombination(index)}
                    />
                    <label
                      htmlFor={`${accountPair.account1_loginID}_${accountPair.account2_loginID}`}
                    >
                      {accountPair.account1_platForm}-{accountPair.account1_loginID}_
                      {accountPair.account2_platForm}-{accountPair.account2_loginID}
                    </label>
                  </div>
                )
              })}
            </div>
            <div className="flex ml-2 gap-2 mt-1">
              <input
                id="checkAll"
                type="checkbox"
                checked={isAllChecked}
                onChange={handleSelectAll}
              />
              <label htmlFor="checkAll">Select all </label>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-[1px] pt-4">
            <BoxLabel label="Settings" className="w-[800px]">
              <div className="flex border  h-full">
                <div className=" flex-1  ">
                  <div className=" pt-3 py-14 pl-3 flex ml-2 gap-2 mt-1 cursor-pointer">
                    <input
                      id="betTargetA"
                      type="checkbox"
                      className=" cursor-pointer"
                      checked={showModalTargetA}
                      onChange={(e) => handleCheckboxChange(e, setShowModalTargetA)}
                    />
                    <label htmlFor="betTargetA" className=" cursor-pointer">
                      Bet Target A
                    </label>
                  </div>
                  <div className="px-3 h-24">
                    <BoxLabel label="General Setting" className="w-full">
                      <div className="py-8">
                        <RadioGroup
                          className="flex justify-center"
                          value={targetASetting}
                          onValueChange={(value) => setTargetASetting(value)}
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex gap-20">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="BetAll" id="BetAllA" className="bg-white" />
                                <Label htmlFor="BetAllA" className="cursor-pointer">
                                  Bet All
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="NoBet" id="NoBetA" className="bg-white" />
                                <Label htmlFor="NoBetA" className="cursor-pointer">
                                  No Bet
                                </Label>
                              </div>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    </BoxLabel>
                  </div>
                </div>
                <div className=" flex-1  ">
                  <div className=" pt-3 py-14 pl-3 flex ml-2 gap-2 mt-1 cursor-pointer">
                    <input
                      id="betTargetB"
                      type="checkbox"
                      className="cursor-pointer"
                      checked={showModalTargetB}
                      onChange={(e) => handleCheckboxChange(e, setShowModalTargetB)}
                    />
                    <label htmlFor="betTargetB" className="cursor-pointer">
                      Bet Target B
                    </label>
                  </div>
                  <div className="px-3 h-24">
                    <BoxLabel label="General Setting" className="w-full">
                      <div className="py-8">
                        <RadioGroup
                          className="flex justify-center"
                          value={targetBSetting}
                          onValueChange={(value) => setTargetBSetting(value)}
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex gap-20">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="BetAll" id="BetAllB" className="bg-white" />
                                <Label htmlFor="BetAllB" className="cursor-pointer">
                                  Bet All
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="NoBet" id="NoBetB" className="bg-white" />
                                <Label htmlFor="NoBetB" className="cursor-pointer">
                                  No Bet
                                </Label>
                              </div>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    </BoxLabel>
                  </div>
                </div>
              </div>
            </BoxLabel>
          </div>
        </div>
        <div className="flex justify-end ">
          <Button
            variant="outline"
            className="bg-white border border-solid border-gray-400 hover:border-blue-500 mr-3  my-3 px-8 leading-none h-6 w-28"
            onClick={handleOkClick}
          >
            OK
          </Button>
        </div>

        {!showModalTargetA && (
          <div
            className="absolute right-[463px] top-[222px] bg-layout-color  opacity-50 z-50 pointer-events-auto"
            style={{ width: '394px', height: '101px' }}
          />
        )}

        {!showModalTargetB && (
          <div
            className="absolute right-[60px] top-[222px] bg-layout-color opacity-50 z-50 pointer-events-auto"
            style={{ width: '394px', height: '101px' }}
          />
        )}
      </div>
    </Modal>
  )
}
