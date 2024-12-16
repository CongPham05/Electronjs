import React from 'react'
import { useRef, useState } from 'react'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { DataPlaceBet, SettingPerMatchLimitType } from '@shared/types'
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

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
    setHasError: (hasError: boolean) => void // Add this line
  }
}

const defaultColumns = [
  {
    accessorKey: 'sport',
    header: () => <span>Sport</span>,
    footer: (props) => props.column.id,
    size: 50
  },
  {
    accessorKey: 'coverage',
    header: () => <span>Coverage</span>,
    footer: (props) => props.column.id,
    size: 70
  },
  {
    accessorKey: 'gameStatus',
    header: () => <span>Game Status</span>,
    footer: (props) => props.column.id,
    size: 100
  },
  {
    accessorKey: 'score',
    header: () => <span>Score</span>,
    footer: (props) => props.column.id,
    size: 70
  },
  {
    accessorKey: 'league',
    header: () => <span>League</span>,
    footer: (props) => props.column.id,
    size: 70
  },
  {
    accessorKey: 'home',
    header: () => <span>Home</span>,
    footer: (props) => props.column.id,
    size: 70
  },
  {
    accessorKey: 'away',
    header: () => <span>Away</span>,
    footer: (props) => props.column.id,
    size: 70
  },
  {
    accessorKey: 'bet',
    header: () => <span>Bet</span>,
    footer: (props) => props.column.id,
    size: 70
  },
  {
    accessorKey: 'hdp',
    header: () => <span>HDP</span>,
    footer: (props) => props.column.id,
    size: 70
  },
  {
    accessorKey: 'amount',
    header: () => <span>Amount</span>,
    footer: (props) => props.column.id,
    size: 70
  },
  {
    accessorKey: 'success',
    header: () => <span>Success</span>,
    footer: (props) => props.column.id,
    size: 70
  }
]

const BottomSportsBookPerMatchLimitSettingWindow = ({
  selectedPlatform
}: {
  selectedPlatform: SettingPerMatchLimitType
}) => {
  const [data, setData] = useState<DataPlaceBet[]>([])

  const [columns] = useState<typeof defaultColumns>(() => [...defaultColumns])
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange')
  const [columnResizeDirection] = useState<ColumnResizeDirection>('ltr')
  const [openDialog, setOpenDialog] = useState(false)
  const [ticket, setTicket] = useState<DataPlaceBet>()

  const [isScrollChecked, setIsScrollChecked] = useState(() => {
    const storedValue = sessionStorage.getItem('isScrollChecked_BetList')
    return storedValue !== null ? JSON.parse(storedValue) : true
  })

  const tableContainerRef = useRef<HTMLDivElement | null>(null)

  const handleScrollChange = (value: boolean) => {
    setIsScrollChecked(value)
    sessionStorage.setItem('isScrollChecked_BetList', JSON.stringify(value))
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
    link.download = `BetListReport${Date.now()}.html`
    link.click()

    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="flex-1 px-2 flex flex-col ">
      <div className="flex justify-between gap-2">
        <p className="text-base font-bold text-[#0000FF]">{selectedPlatform.namePlatform}</p>
        <div className="flex">
          <div className="flex items-center mr-1 mb-1 cursor-pointer">
            <Checkbox
              id={'scroll'}
              checked={isScrollChecked}
              onCheckedChange={handleScrollChange}
              className="bg-white data-[state=checked]:bg-white data-[state=checked]:text-zinc-900 mr-2 cursor-pointer"
            />
            <label htmlFor="scroll">Scroll</label>
          </div>
          <p
            className="underline text-blue-600 text-sm p-1 cursor-pointer mx-2 hover:text-blue-800"
            onClick={handleSaveReport}
          >
            Save Report
          </p>
          <div className=" flex  gap-1  ">
            <p>Total</p>
            <p>{data.length}</p>
          </div>
        </div>
      </div>

      <div className=" flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden ">
          <div className=" h-full w-full border border-zinc-500 overflow-hidden">
            <div
              ref={tableContainerRef}
              style={{ direction: table.options.columnResizeDirection }}
              className="h-full w-full overflow-auto custom-scrollbar"
            >
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
                          style={{
                            width: cell.column.getSize()
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
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default React.memo(BottomSportsBookPerMatchLimitSettingWindow)
