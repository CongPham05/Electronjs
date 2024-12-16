import { Label } from '@renderer/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group'
import BoxLabel from '@renderer/layouts/BoxLabel'
import { SettingPerMatchLimitType } from '@shared/types'
import React, { useCallback } from 'react'

interface Props {
  showDisable: boolean
  setShowDisable: React.Dispatch<React.SetStateAction<boolean>>
  listPlatform: SettingPerMatchLimitType[]
  setListPlatform: React.Dispatch<React.SetStateAction<SettingPerMatchLimitType[]>>
  selectedPlatform: SettingPerMatchLimitType
  setSelectedPlatform: React.Dispatch<React.SetStateAction<SettingPerMatchLimitType>>
}

const TopSportsBookPerMatchLimitSettingWindow = ({
  showDisable,
  setShowDisable,
  listPlatform,
  setListPlatform,
  selectedPlatform,
  setSelectedPlatform
}: Props) => {
  const updatePlatform = useCallback(
    (update: Partial<SettingPerMatchLimitType>) => {
      setListPlatform((prevList) =>
        prevList.map((platform) =>
          platform.id === selectedPlatform.id ? { ...platform, ...update } : platform
        )
      )
      setSelectedPlatform((prev) => ({ ...prev, ...update }))
    },
    [selectedPlatform, setListPlatform, setSelectedPlatform]
  )

  const handleCheckboxChange = useCallback(() => setShowDisable((prev) => !prev), [setShowDisable])

  const handleRadioGroupChangeLimitMethod = useCallback(
    (value: string) => updatePlatform({ limitMethod: value }),
    [updatePlatform]
  )

  const handleRadioGroupChangeLimitType = useCallback(
    (value: string) => updatePlatform({ limitType: value }),
    [updatePlatform]
  )

  const handleLivePreGameChange = useCallback(() => {
    updatePlatform({ livePreGame: selectedPlatform.livePreGame === 0 ? 1 : 0 })
  }, [selectedPlatform, updatePlatform])

  const handleInputChange = useCallback(
    (field: 'totalAmount' | 'totalCount') => (e: React.ChangeEvent<HTMLInputElement>) =>
      updatePlatform({ [field]: e.target.value }),
    [updatePlatform]
  )

  const handlePlatformClick = useCallback(
    (platform: SettingPerMatchLimitType) => setSelectedPlatform(platform),
    [setSelectedPlatform]
  )

  return (
    <div className=" border  bg-layout-color px-[2px] pt-4 h-[300px] pb-3">
      <BoxLabel label="Per Match Limit Setting" className="w-full">
        <div className="h-full  flex flex-col gap-2">
          <div className="flex items-center mx-1 cursor-pointer ml-3 mt-4 mb-1">
            <input
              id="bordered-checkbox-1"
              type="checkbox"
              checked={showDisable}
              name="bordered-checkbox"
              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 cursor-pointer mr-1"
              onChange={handleCheckboxChange}
            />
            <label htmlFor="bordered-checkbox-1" className="ms-1 text-sm font-bold cursor-pointer">
              Enabled
            </label>
          </div>
          <div className="flex-1 flex relative overflow-hidden">
            <div className="border border-gray-500 w-60 bg-white overflow-auto custom-scrollbar ">
              {listPlatform.map((platform: SettingPerMatchLimitType) => {
                return (
                  <p
                    key={platform.id}
                    className={`pl-1 hover:bg-blue-500 hover:text-white cursor-pointer ${
                      selectedPlatform.id === platform.id ? 'bg-blue-500 text-white' : ''
                    }`}
                    onClick={() => handlePlatformClick(platform)}
                  >
                    {platform.namePlatform}
                  </p>
                )
              })}
            </div>
            <div className="flex-1 pt-2 ">
              <BoxLabel label="Per Match Limit" className="w-[460px]">
                <div className="h-full flex flex-col px-2 pt-4 gap-4">
                  <div className="flex gap-2">
                    <div className="w-28">Limit Method</div>
                    <div>
                      <RadioGroup
                        className="flex justify-center"
                        value={selectedPlatform.limitMethod}
                        onValueChange={handleRadioGroupChangeLimitMethod}
                      >
                        <div className="flex flex-col gap-5">
                          <div className="flex">
                            <div className="w-48 flex items-center space-x-2">
                              <RadioGroupItem value="TeamName" id="TeamName" className="bg-white" />
                              <Label htmlFor="TeamName" className="font-normal">
                                Team Name
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="TeamNameHandicap"
                                id="TeamNameHandicap"
                                className="bg-white"
                              />
                              <Label htmlFor="TeamNameHandicap" className=" font-normal">
                                Team Name + Handicap
                              </Label>
                            </div>
                          </div>
                          <div className="flex ">
                            <div className="w-48 flex items-center space-x-2">
                              <RadioGroupItem
                                value="NameBetTypeLimit"
                                id="NameBetTypeLimit"
                                className="bg-white"
                              />
                              <Label htmlFor="NameBetTypeLimit" className="font-normal">
                                Name BetType Limit
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="NameTargetLimit"
                                id="NameTargetLimit"
                                className="bg-white"
                              />
                              <Label htmlFor="NameTargetLimit" className="  font-normal">
                                Name & Target Limit
                              </Label>
                            </div>
                          </div>
                        </div>
                      </RadioGroup>
                      <div className="flex items-center  cursor-pointer  mt-4 mb-1">
                        <input
                          id="LivePreGame"
                          type="checkbox"
                          checked={Boolean(selectedPlatform.livePreGame)}
                          name="LivePreGame"
                          onChange={handleLivePreGameChange}
                          className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 cursor-pointer mr-1"
                        />
                        <label htmlFor="LivePreGame" className="ms-1 text-sm cursor-pointer ">
                          Live /Pre-Game
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="text-[#0000FF]">
                    <p>*Name & BetType Limit: Name + (HDP / OU / 1X2)</p>
                    <p>*Name & Target Limit: Name + (FTHome / FTAway / FHOver / FHUnder...)</p>
                  </div>
                  <div className="flex gap-2 ">
                    <div className="w-28">Limit Type</div>
                    <div className="flex-1">
                      <RadioGroup
                        className="flex"
                        value={selectedPlatform.limitType}
                        onValueChange={handleRadioGroupChangeLimitType}
                      >
                        <div className=" flex flex-col gap-4">
                          <div className=" flex items-center  ">
                            <div className=" flex items-center space-x-2 w-48">
                              <RadioGroupItem
                                value="TotalAmount"
                                id="TotalAmount"
                                className="bg-white  "
                              />
                              <Label htmlFor="TotalAmount" className="font-normal">
                                Limit By Total Amount $
                              </Label>
                            </div>

                            <input
                              className="block border border-gray-400 w-28 outline-none"
                              type="number"
                              id="InputLimitByTotalAmount"
                              value={selectedPlatform.totalAmount}
                              step={100}
                              onChange={handleInputChange('totalAmount')}
                              disabled={selectedPlatform.limitType !== 'TotalAmount'}
                            />
                          </div>
                          <div className="flex items-center ">
                            <div className="flex items-center space-x-2 w-48">
                              <RadioGroupItem
                                value="TotalCount"
                                id="TotalCount"
                                className="bg-white"
                              />
                              <Label htmlFor="TotalCount" className="font-normal">
                                Limit By Total Count
                              </Label>
                            </div>

                            <input
                              className="block border border-gray-400 w-28 outline-none"
                              type="number"
                              id="InputLimitByTotalCount"
                              value={selectedPlatform.totalCount}
                              onChange={handleInputChange('totalCount')}
                              disabled={selectedPlatform.limitType !== 'TotalCount'}
                            />
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </BoxLabel>
            </div>

            {!showDisable && (
              <div
                className="absolute top-[-11px] left-[-2px] right-0 bottom-0 bg-layout-color  opacity-80 z-50 pointer-events-auto"
                style={{ width: '676px', height: '252px' }}
              />
            )}
          </div>
        </div>
      </BoxLabel>
    </div>
  )
}

export default React.memo(TopSportsBookPerMatchLimitSettingWindow)
