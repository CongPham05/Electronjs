import { useState, useEffect } from 'react'

export default function Progressbar({ isRunning, closeProgressbar }) {
  const [progress, setProgress] = useState(0)
  let intervalId: NodeJS.Timeout | undefined

  useEffect(() => {
    if (progress < 100 && isRunning) {
      intervalId = setInterval(() => {
        setProgress((prev) => prev + 2)
      }, 50)
    }

    if (progress >= 100) {
      closeProgressbar()
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [progress, isRunning])

  return (
    <div className="absolute top-0 left-0 flex flex-col h-full w-full bg-black opacity-80 justify-center items-center gap-2">
      <p className="font-bold text-lg">Loading</p>
      <div className="overflow-hidden w-[180px] h-[18px] bg-zinc-800">
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#c67107',
            transition: 'width 0.5s'
          }}
        ></div>
      </div>
      <div className="font-bold text-lg text-[#eee]">{progress}%</div>
    </div>
  )
}
