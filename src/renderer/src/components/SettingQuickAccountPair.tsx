import { QuickBetAmountSetting } from '@renderer/components/QuickBetAmountSetting'
import { QuickBetTargetSetting } from '@renderer/components/QuickBetTargetSetting'
import { QuickOddsRangeSetting } from '@renderer/components/QuickOddsRangeSetting'
import { memo, useState } from 'react'

const SettingQuickAccountPairComponent = ({
  listAccountPair,
  setListAccountPair,
  setSelectAccountPair
}) => {
  const [showQuickOddsRangeSetting, setShowQuickOddsRangeSetting] = useState(false)
  const [showQuickBetTargetSetting, setShowQuickBetTargetSetting] = useState(false)
  const [showQuickBetAmountSetting, setShowQuickBetAmountSetting] = useState(false)

  const quickOddsRangeSetting = () => {
    setShowQuickOddsRangeSetting(true)
  }
  const quickBetTargetSetting = () => {
    setShowQuickBetTargetSetting(true)
  }

  const quickBetAmountSetting = () => {
    setShowQuickBetAmountSetting(true)
  }

  return (
    <div className="flex flex-col justify-center items-center gap-2">
      <div
        className="text-[#0000FF] underline text-xs font-semibold"
        onClick={quickOddsRangeSetting}
      >
        Quick Odds Range Setting
      </div>
      <div
        className="text-[#0000FF] underline text-xs font-semibold"
        onClick={quickBetTargetSetting}
      >
        Quick Bet Target Setting
      </div>
      <div
        className="text-[#0000FF] underline text-xs font-semibold"
        onClick={quickBetAmountSetting}
      >
        Quick Amount Setting
      </div>
      <div className="text-[#0000FF] underline text-xs font-semibold   cursor-not-allowed">
        Quick Amount Rounder Setting
      </div>

      {showQuickOddsRangeSetting && (
        <QuickOddsRangeSetting
          setShowQuickOddsRangeSetting={setShowQuickOddsRangeSetting}
          listAccountPair={listAccountPair}
          setListAccountPair={setListAccountPair}
          setSelectAccountPair={setSelectAccountPair}
        />
      )}
      {showQuickBetTargetSetting && (
        <QuickBetTargetSetting
          setShowQuickBetTargetSetting={setShowQuickBetTargetSetting}
          listAccountPair={listAccountPair}
          setListAccountPair={setListAccountPair}
          setSelectAccountPair={setSelectAccountPair}
        />
      )}
      {showQuickBetAmountSetting && (
        <QuickBetAmountSetting
          setShowQuickBetAmountSetting={setShowQuickBetAmountSetting}
          listAccountPair={listAccountPair}
          setListAccountPair={setListAccountPair}
          setSelectAccountPair={setSelectAccountPair}
        />
      )}
    </div>
  )
}

export const SettingQuickAccountPair = memo(SettingQuickAccountPairComponent)
