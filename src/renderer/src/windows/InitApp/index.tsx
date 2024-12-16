export default function InitApp() {
  return (
    <div className="bg-black opacity-90 h-full flex flex-col">
      <p className="font-bold text-xs text-blue-500 text-end mr-2 mt-1 blinking-text">
        Loading. . .
      </p>
      <div className="flex flex-1 justify-around items-center mt-6">
        <div className="text-gray-500 font-bold text-6xl tracking-[5px] leading-none">BSoft</div>
        <div className="text-[#c67107]">
          <p className="font-semibold text-2xl">BSoftBet </p>
          <p className="text-xl  mb-4">Vietnam </p>
          <p className="leading-none">Version 1.24.4.25 </p>
          <p className="leading-none">copyright © 2024 </p>
        </div>
      </div>
    </div>
  )
}
