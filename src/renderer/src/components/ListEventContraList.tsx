import { useEffect, useRef, useState } from 'react'
import {
  useReactTable,
  ColumnResizeMode,
  getCoreRowModel,
  flexRender,
  ColumnResizeDirection,
  RowData
} from '@tanstack/react-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { DataPlaceBet, WaitingListType } from '@shared/types'
import { cn } from '@renderer/lib/utils'
import { Checkbox } from '@renderer/components/ui/checkbox'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}

const defaultColumns = [
  {
    accessorKey: 'company',
    header: () => <span>Company</span>,
    footer: (props) => props.column.id,
    cell: ({ getValue }) => {
      const text = getValue()

      return (
        <span className={`px-2`} style={{ whiteSpace: 'nowrap' }}>
          {text}
        </span>
      )
    }
  },
  {
    accessorKey: 'coverage',
    header: () => <span>Coverage</span>,
    footer: (props) => props.column.id,
    size: 70
  },
  {
    accessorKey: 'gameType',
    header: () => <span>Game Type</span>,
    footer: (props) => props.column.id,
    size: 80
  },
  {
    accessorKey: 'score',
    header: () => <span>Score</span>,
    footer: (props) => props.column.id,
    size: 70,
    cell: ({ getValue }) => {
      return <span> {getValue() == null ? '-' : getValue()}</span>
    }
  },
  {
    accessorKey: 'nameLeague',
    header: () => <span>League</span>,
    footer: (props) => props.column.id,
    cell: ({ getValue }) => {
      const text = getValue()
      const textLength = text.length
      const fontSize = textLength < 50 ? 'text-sm' : textLength < 100 ? 'text-base' : 'text-lg'
      return (
        <span className={` px-2  ${fontSize}`} style={{ whiteSpace: 'nowrap' }}>
          {text}
        </span>
      )
    }
  },
  {
    accessorKey: 'nameHome',
    header: () => <span>Home</span>,
    footer: (props) => props.column.id,
    size: 120,
    cell: ({ row }) => {
      const hdp = row.original.hdp_point
      if (hdp < 0) {
        return (
          <div className="text-[#FF0000] px-2" style={{ whiteSpace: 'nowrap' }}>
            {row.original.nameHome}
          </div>
        )
      } else {
        return (
          <div className="text-[#0000FF] px-2" style={{ whiteSpace: 'nowrap' }}>
            {row.original.nameHome}
          </div>
        )
      }
    }
  },
  {
    accessorKey: 'nameAway',
    header: () => <span>Away</span>,
    footer: (props) => props.column.id,
    size: 120,
    cell: ({ row }) => {
      const hdp = row.original.hdp_point
      if (hdp < 0) {
        return (
          <div className="text-[#0000FF] px-2" style={{ whiteSpace: 'nowrap' }}>
            {row.original.nameAway}
          </div>
        )
      } else {
        return (
          <div className="text-[#FF0000] px-2" style={{ whiteSpace: 'nowrap' }}>
            {row.original.nameAway}
          </div>
        )
      }
    }
  },
  {
    accessorKey: 'bet',
    header: () => <span>Bet</span>,
    footer: (props) => props.column.id,
    size: 120,
    cell: ({ getValue }) => {
      return (
        <span className="text-green-500 px-2" style={{ whiteSpace: 'nowrap' }}>
          {' '}
          {getValue() as string}
        </span>
      )
    }
  },
  {
    accessorKey: 'HDP',
    header: () => <span>HDP</span>,
    footer: (props) => props.column.id,
    size: 60
  },
  {
    accessorKey: 'odd',
    header: () => <span>Odds</span>,
    footer: (props) => props.column.id,
    size: 60,
    cell: ({ getValue }) => {
      return (
        <span className={cn(getValue() > 0 ? 'text-[#0000FF]' : 'text-[#FF0000]')}>
          {getValue() as number}
        </span>
      )
    }
  },
  {
    accessorKey: 'betAmount',
    header: () => <span>Amount</span>,
    footer: (props) => props.column.id,
    size: 60,
    cell: ({ getValue }) => {
      return <span className="font-bold"> {getValue() as number}</span>
    }
  },
  {
    accessorKey: 'time',
    header: () => <span>Time</span>,
    footer: (props) => props.column.id,
    cell: ({ getValue }) => {
      return (
        <span className="px-2" style={{ whiteSpace: 'nowrap' }}>
          {getValue()}
        </span>
      )
    }
  },
  {
    accessorKey: 'info',
    header: () => <span>Info</span>,
    footer: (props) => props.column.id,
    cell: ({ getValue, column }) => {
      const text = getValue() as string
      const isError = text.includes('Error')
      const textClass = isError ? 'text-red-500 px-2' : 'text-blue-500 px-2'
      const columnWidth = column.getSize()

      return (
        <span
          className={`${textClass}`}
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: `${columnWidth}px`,
            display: 'inline-block'
          }}
          title={text}
        >
          {text}
        </span>
      )
    }
  },
  {
    accessorKey: 'profit',
    header: () => <span>Profit</span>,
    footer: (props) => props.column.id,
    size: 50,
    cell: ({ getValue }) => {
      return (
        <span className={cn(getValue() > 0 ? 'text-[#0000FF] px-1.5' : 'text-[#FF0000] px-1.5')}>
          {getValue() as number}
        </span>
      )
    }
  },
  {
    accessorKey: 'speed',
    header: () => <span>Speed</span>,
    footer: (props) => props.column.id,
    size: 50
  },
  {
    accessorKey: 'receiptID',
    header: () => <span>Receipt ID</span>,
    footer: (props) => props.column.id,
    size: 100,
    cell: ({ getValue }) => {
      return <span className="px-1.5"> {getValue()}</span>
    }
  },
  {
    accessorKey: 'receiptStatus',
    header: () => <span>Receipt Status</span>,
    footer: (props) => props.column.id,
    size: 100,
    cell: ({ getValue }) => {
      return (
        <span
          className={cn(getValue() !== 'Fail' ? 'text-[#0000FF] px-1.5' : 'text-[#FF0000] px-1.5')}
        >
          {getValue()}
        </span>
      )
    }
  }
]

export const ListEventContraList = () => {
  const [data, setData] = useState<DataPlaceBet[]>([])
  const [columns] = useState<typeof defaultColumns>(() => [...defaultColumns])
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange')
  const [columnResizeDirection] = useState<ColumnResizeDirection>('ltr')
  const [openDialog, setOpenDialog] = useState(false)
  const [ticket, setTicket] = useState<DataPlaceBet>()

  const [isClearChecked, setIsClearChecked] = useState(() => {
    const storedValue = sessionStorage.getItem('isClearChecked_ContraList')
    return storedValue !== null ? JSON.parse(storedValue) : true
  })
  const [isScrollChecked, setIsScrollChecked] = useState(() => {
    const storedValue = sessionStorage.getItem('isScrollChecked_ContraList')
    return storedValue !== null ? JSON.parse(storedValue) : true
  })

  const tableContainerRef = useRef<HTMLDivElement | null>(null)

  const handleScrollChange = (value: boolean) => {
    setIsScrollChecked(value)
    sessionStorage.setItem('isScrollChecked_ContraList', JSON.stringify(value))
  }

  useEffect(() => {
    if (isScrollChecked && tableContainerRef.current) {
      tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight
    }
  }, [data, isScrollChecked])

  const handleClearChange = (value: boolean) => {
    setIsClearChecked(value)
    sessionStorage.setItem('isClearChecked_ContraList', JSON.stringify(value))
    window.electron.ipcRenderer.send('DataClear_ContraList', +value)
  }

  const table = useReactTable({
    data,
    columns,
    columnResizeMode,
    columnResizeDirection,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...row,
                [columnId]: value
              }
            }
            return row
          })
        )
      },
      setHasError: (hasError: boolean) => {
        console.error('An error occurred:', hasError)
      }
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.electron.ipcRenderer.invoke('GetContraList')
      const dataConvert = data.flatMap((item: WaitingListType) => JSON.parse(item.dataPair))
      setData(dataConvert)
    }

    fetchData()
  }, [])

  useEffect(() => {
    const handleDataContraList = (_, data: WaitingListType) => {
      const dataEvent = JSON.parse(data.dataPair)
      setData((prevState) => {
        const maxLength = isClearChecked ? 100 : 200
        return prevState.length >= maxLength ? [...dataEvent] : [...prevState, ...dataEvent]
      })
    }

    window.electron.ipcRenderer.on('DataContraList', handleDataContraList)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('DataContraList')
    }
  }, [isClearChecked])

  const handleInfoTicket = (data: DataPlaceBet) => {
    setTicket(data)
    setOpenDialog(true)
  }
  const handleSaveReport = () => {
    const tableElement = document.querySelector('table')

    if (!tableElement) {
      alert('No table found!')
      return
    }

    const tableHTML = tableElement.outerHTML

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Report</title>
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
        }
        table, th, td {
          border: 1px solid black;
        }
        th, td {
          padding: 8px;
          text-align: left;
        }
      </style>
    </head>
    <body>
      ${tableHTML}
    </body>
    </html>
  `

    const blob = new Blob([htmlContent], { type: 'text/html' })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `ContraListReport${Date.now()}.html`
    link.click()

    URL.revokeObjectURL(link.href)
  }
  return (
    <div className="h-full px-2 flex flex-col">
      <div className="flex justify-end gap-2">
        <div className="flex items-center mr-1 mb-1">
          <Checkbox
            id={'clear'}
            checked={isClearChecked}
            onCheckedChange={handleClearChange}
            className="bg-white data-[state=checked]:bg-white data-[state=checked]:text-zinc-900 mr-2"
          />
          <label htmlFor="clear">Clear when {'>'} 100 Bets</label>
        </div>
        <div className="flex items-center mr-1 mb-1">
          <Checkbox
            id={'scroll'}
            checked={isScrollChecked}
            onCheckedChange={handleScrollChange}
            className="bg-white data-[state=checked]:bg-white data-[state=checked]:text-zinc-900 mr-2"
          />
          <label htmlFor="scroll">Scroll</label>
        </div>
        <p
          className="underline text-[#0000FF] text-sm p-1 cursor-pointer mx-2 hover:text-blue-800"
          onClick={handleSaveReport}
        >
          Save Report
        </p>
        <div className=" flex  gap-1  ">
          <p>Total</p>
          <p>{data.length}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white border border-gray-500 overflow-y-auto custom-scrollbar">
        <div className="h-96">
          <div ref={tableContainerRef} style={{ direction: table.options.columnResizeDirection }}>
            <div className="">
              <table
                {...{
                  style: {
                    width: table.getCenterTotalSize()
                  }
                }}
                className="bg-[#f8f6f6] "
              >
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          {...{
                            colSpan: header.colSpan,
                            style: {
                              width: header.getSize()
                            }
                          }}
                          className="sticky top-[-1px] z-10 "
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          <div
                            {...{
                              onDoubleClick: () => header.column.resetSize(),
                              onMouseDown: header.getResizeHandler(),
                              onTouchStart: header.getResizeHandler(),
                              className: `resizer ${table.options.columnResizeDirection} ${
                                header.column.getIsResizing() ? 'isResizing' : ''
                              }`,
                              style: {
                                transform:
                                  columnResizeMode === 'onEnd' && header.column.getIsResizing()
                                    ? `translateX(${
                                        (table.options.columnResizeDirection === 'rtl' ? -1 : 1) *
                                        (table.getState().columnSizingInfo.deltaOffset ?? 0)
                                      }px)`
                                    : ''
                              }
                            }}
                          />
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-blue-300 ${Math.floor(index / 2) % 2 === 0 ? 'bg-white' : 'bg-gray-200'}`}
                      onClick={() => handleInfoTicket(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          {...{
                            style: {
                              width: cell.column.getSize()
                            }
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="w-[350px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Betting ticket information</DialogTitle>
            <DialogDescription className="text-black text-base ">
              <div className="flex">
                <p className="w-36">Company</p>
                <p>: {ticket?.company}</p>
              </div>
              <div className="flex">
                <p className="w-36">Coverage</p>
                <p>: {ticket?.number == 0 ? 'FullTime' : 'FirstHalf'}</p>
              </div>
              <div className="flex">
                <p className="w-36">League</p>
                <p>: {ticket?.nameLeague}</p>
              </div>
              <div className="flex">
                <p className="w-36">Home</p>
                <p>: {ticket?.nameHome}</p>
              </div>
              <div className="flex">
                <p className="w-36">Away</p>
                <p>: {ticket?.nameAway}</p>
              </div>
              <div className="flex">
                <p className="w-36">TypeBet</p>
                <p>: {ticket?.typeOdd}</p>
              </div>
              <div className="flex">
                <p className="w-36">Bet</p>
                <p>: {ticket?.bet}</p>
              </div>
              <div className="flex">
                <p className="w-36">HDP</p>
                <p>: {ticket?.HDP}</p>
              </div>
              <div className="flex">
                <p className="w-36">Odds</p>
                <p>: {ticket?.odd}</p>
              </div>
              <div className="flex">
                <p className="w-36">AmountRange</p>
                <p>: MYR6 - 988</p>
              </div>
              <div className="flex">
                <p className="w-36">Time</p>
                <p>: {ticket?.time}</p>
              </div>
              <div className="flex">
                <p className="w-36">OddsType</p>
                <p>: Malay</p>
              </div>
              <div className="flex">
                <p className="w-36">Info</p>
                <p>: Success</p>
              </div>
              <div className="flex">
                <p className="w-36">ReceiptId</p>
                <p>: Confirm</p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
