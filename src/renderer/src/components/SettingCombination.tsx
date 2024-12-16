import { memo } from 'react'
import BoxLabel from '@renderer/layouts/BoxLabel'
import { Label } from '@renderer/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group'
import { Checkbox } from '@renderer/components/ui/checkbox'

const SettingCombinationComponent = ({
  selectAccountPair,
  handleChange_amount,
  handleChange_selectBet,
  handleChange_checkBox,
  handleChange_OddFrom,
  handleChange_OddTo
}) => {
  return (
    <div className="h-[488px] px-1 mb-[-5px] relative z-10">
      <BoxLabel label="Bet Setting" className="w-[860px]">
        <div className="flex ">
          <div className=" flex-1">
            <h1 className="text-xl font-bold py-2.5 text-center">
              {selectAccountPair ? selectAccountPair.account1_platForm : '(SportsBook)'}
            </h1>
            <div className=" mb-3">
              <div className="flex  justify-between px-10">
                <p>Bet Amount: $</p>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="quantity1"
                  name="quantity1"
                  step="1"
                  min={0}
                  value={selectAccountPair?.account1_BetAmount ?? 100}
                  onChange={(e) => {
                    let value = e.target.value
                    value = value.replace(/[^0-9]/g, '')
                    if (value.length <= 10) {
                      handleChange_amount('account1_BetAmount', value)
                    }
                  }}
                  className="pl-1 w-20 outline-none bg-white rounded-none border border-gray-500 focus:ring-0"
                />
                <div className="flex justify-center items-center">
                  <Checkbox
                    id="1"
                    className="bg-white data-[state=checked]:bg-white data-[state=checked]:text-zinc-900 "
                    // checked={checked}
                    // onCheckedChange={onChange}
                  />
                  <label htmlFor="1" className="pl-1.5 cursor-pointer">
                    Ignore HDP Better Odds
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-between pl-10 pr-28">
              <div className="flex justify-center items-center">
                <Checkbox
                  id="11"
                  className="bg-white data-[state=checked]:bg-white data-[state=checked]:text-zinc-900 "
                  checked={Boolean(selectAccountPair?.account1_CheckOdd)}
                  onCheckedChange={(e) => handleChange_checkBox('account1', e)}
                />
                <label htmlFor="11" className="pl-1.5 cursor-pointer">
                  Check Odds
                </label>
              </div>
              <div className="flex items-center">
                <p className="mr-4">Malay</p>
                <input
                  disabled={!selectAccountPair?.account1_CheckOdd}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="quantity1"
                  name="quantity1"
                  step="0.01"
                  value={selectAccountPair?.account1_CheckOdd_From ?? '0.01'}
                  onChange={(e) => {
                    let value = e.target.value
                    value = value.replace(/[^0-9.]/g, '')
                    if ((value.match(/\./g) || []).length > 1) {
                      return
                    }

                    if (value.length <= 10) {
                      handleChange_OddFrom('account1', value)
                    }
                  }}
                  className="pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-layout-color disabled:pointer-events-none"
                />
                <p className="mx-2">to</p>
                <input
                  disabled={!selectAccountPair?.account1_CheckOdd}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="quantity11"
                  name="quantity11"
                  step="0.01"
                  min={'-1.000'}
                  max={'1.000'}
                  value={selectAccountPair?.account1_CheckOdd_To ?? '-0.01'}
                  onChange={(e) => {
                    let value = e.target.value
                    value = value.replace(/[^0-9.]/g, '')
                    if ((value.match(/\./g) || []).length > 1) {
                      return
                    }
                    if (value.length <= 10) {
                      handleChange_OddTo('account1', value)
                    }
                  }}
                  className="pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-layout-color disabled:pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="text-xl font-bold py-2.5 text-center text-red-500 ">VS</div>
          <div className="flex-1">
            <h1 className="text-xl font-bold py-2.5  text-center">
              {selectAccountPair ? selectAccountPair.account2_platForm : '(SportsBook)'}
            </h1>
            <div className="mb-3">
              <div className="flex items-center justify-center gap-6">
                <p>Bet Amount: $</p>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="quantity2"
                  name="quantity2"
                  min={0}
                  step="1"
                  value={selectAccountPair?.account2_BetAmount ?? 100}
                  onChange={(e) => {
                    let value = e.target.value
                    value = value.replace(/[^0-9]/g, '')
                    if (value.length <= 10) {
                      handleChange_amount('account2_BetAmount', value)
                    }
                  }}
                  className="pl-1 w-20 outline-none bg-white rounded-none border border-gray-500 focus:ring-0"
                />
                <div className="flex justify-center items-center">
                  <Checkbox
                    id="2"
                    className="bg-white data-[state=checked]:bg-white data-[state=checked]:text-zinc-900 "
                  />
                  <label htmlFor="2" className="pl-1.5 cursor-pointer">
                    Ignore HDP Better Odds
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-between pl-10 pr-28">
              <div className="flex justify-center items-center">
                <Checkbox
                  id="22"
                  className="bg-white data-[state=checked]:bg-white data-[state=checked]:text-zinc-900 "
                  checked={Boolean(selectAccountPair?.account2_CheckOdd)}
                  onCheckedChange={(e) => handleChange_checkBox('account2', e)}
                />
                <label htmlFor="22" className="pl-1.5 cursor-pointer">
                  Check Odds
                </label>
              </div>
              <div className="flex items-center">
                <p className="mr-4">Malay</p>
                <input
                  disabled={!selectAccountPair?.account2_CheckOdd}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="quantity1"
                  name="quantity1"
                  step="0.01"
                  min={'-1.000'}
                  max={'1.000'}
                  value={selectAccountPair?.account2_CheckOdd_From ?? '0.01'}
                  onChange={(e) => {
                    let value = e.target.value
                    value = value.replace(/[^0-9.]/g, '')
                    if ((value.match(/\./g) || []).length > 1) {
                      return
                    }
                    if (value.length <= 10) {
                      handleChange_OddFrom('account2', value)
                    }
                  }}
                  className=" pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-layout-color disabled:pointer-events-none"
                />
                <p className="mx-2">to</p>
                <input
                  disabled={!selectAccountPair?.account2_CheckOdd}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="quantity1"
                  name="quantity1"
                  step="0.01"
                  min={'-1.000'}
                  max={'1.000'}
                  value={selectAccountPair?.account2_CheckOdd_To ?? '-0.01'}
                  onChange={(e) => {
                    let value = e.target.value
                    value = value.replace(/[^0-9.]/g, '')
                    if ((value.match(/\./g) || []).length > 1) {
                      return
                    }
                    if (value.length <= 10) {
                      handleChange_OddTo('account2', value)
                    }
                  }}
                  className="pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-layout-color disabled:pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="pt-10 flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="w-[800px]">
              <h1 className="text-lg font-bold py-2.5 text-center">
                {selectAccountPair
                  ? selectAccountPair.account1_platForm + '-' + selectAccountPair.account1_loginID
                  : '(SelectSportBook)'}
              </h1>
              <div className="pl-3">
                <BoxLabel label="General Setting" className="h-full w-full">
                  <div className="py-8">
                    <RadioGroup
                      className="flex justify-center"
                      value={selectAccountPair?.account1_SelectBet || 'BetAll'}
                      onValueChange={handleChange_selectBet('account1')}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-20">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="BetAll" id="BetAll1" className="bg-white" />
                            <Label htmlFor="BetAll1">Bet All</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="NoBet" id="NoBet1" className="bg-white" />
                            <Label htmlFor="NoBet1">No Bet</Label>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="SelectBet1"
                              id="SelectBet1"
                              className="bg-white "
                              disabled
                            />
                            <Label htmlFor="SelectBet1" className="text-gray-500">
                              Select Bet
                            </Label>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </BoxLabel>
              </div>
            </div>
            <div className="w-[800px]">
              <h1 className="text-lg font-bold py-2.5 text-center">
                {selectAccountPair
                  ? selectAccountPair.account2_platForm + '-' + selectAccountPair.account2_loginID
                  : '(SelectSportBook)'}
              </h1>
              <div className="pr-3">
                <BoxLabel label="General Setting" className="h-60 w-full">
                  <div className="py-8">
                    <RadioGroup
                      className="flex justify-center"
                      value={selectAccountPair?.account2_SelectBet || 'BetAll'}
                      onValueChange={handleChange_selectBet('account2')}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-20">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="BetAll" id="BetAll2" className="bg-white" />
                            <Label htmlFor="BetAll2">Bet All</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="NoBet" id="NoBet2" className="bg-white" />
                            <Label htmlFor="NoBet2">No Bet</Label>
                          </div>
                        </div>
                        <div className="cursor-not-allowed">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="SelectBet2"
                              id="SelectBet2"
                              className="bg-white"
                              disabled
                            />
                            <Label htmlFor="SelectBet2" className="text-gray-500">
                              Select Bet
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
        </div>
      </BoxLabel>
      {!selectAccountPair && (
        <div
          className="absolute top-[-11px] left-0 right-0 bottom-0 bg-layout-color opacity-80 z-50 pointer-events-auto"
          style={{ width: '873px', height: '505px' }}
        />
      )}
    </div>
  )
}

export const SettingCombination = memo(SettingCombinationComponent)
