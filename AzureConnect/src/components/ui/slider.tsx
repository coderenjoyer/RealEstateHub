import * as React from "react"

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number[]
  onValueChange?: (value: number[]) => void
}

export function Slider({ value, onValueChange, className, ...props }: SliderProps) {
  const [internal, setInternal] = React.useState<number>(value?.[0] ?? 0)

  React.useEffect(() => {
    setInternal(value?.[0] ?? 0)
  }, [value])

  return (
    <input
      type="range"
      className={className}
      value={internal}
      onChange={(e) => {
        const next = Number(e.target.value)
        setInternal(next)
        onValueChange?.([next])
      }}
      {...props}
    />
  )
}

export default Slider


