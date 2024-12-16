export default function BoxLabel({ label, children, className, classNameLabel = '' }) {
  return (
    <div className="relative h-full">
      <div className={`absolute top-[-10px] left-2 bg-layout-color ${classNameLabel} `}>
        {label}
      </div>
      <div className={` w-1/2 h-full ${className} border border-zinc-300`}>{children}</div>
    </div>
  )
}
