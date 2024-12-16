import QuestionMarkCircle from '@renderer/icons/question-mark-circle'

export default function ConfirmLogout() {
  const closeConfirm = () => {
    window.electron.ipcRenderer.send('CloseConfirmLogout')
  }

  const quitApp = () => {
    window.electron.ipcRenderer.send('QuitApp')
  }

  return (
    <div className=" flex flex-col h-full  border border-gray-300 bg-white rounded-lg ">
      <div className="flex-1 flex flex-col ">
        <div className="flex items-center justify-between p-1  bg-blue-50 text-sm rounded-t-lg ">
          <div className="font-medium ml-2"> Confirmation</div>
        </div>
        <div className=" flex flex-1 font-medium  justify-start items-center ml-4">
          <QuestionMarkCircle className="text-blue-500  mr-1" />
          <div>Quit B-FastBet?</div>
        </div>
      </div>
      <div className="h-12 bg-gray-100  rounded-b-lg  ">
        <div className="h-full flex items-center justify-between px-8 ">
          <button
            className=" rounded-md h-[20px] w-20 border bg-white border-gray-300 font-medium  hover:border-blue-500 transition duration-500 "
            onClick={quitApp}
          >
            Yes
          </button>
          <button
            className="rounded-md h-[20px] w-20 border bg-white border-gray-300 font-medium  hover:border-blue-500 transition duration-500"
            onClick={closeConfirm}
          >
            No
          </button>
          <button
            className="rounded-md h-[20px] w-20 border bg-white border-gray-300 font-medium  hover:border-blue-500 transition duration-500"
            onClick={closeConfirm}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
