import * as React from "react"

export interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
}

export const Select: React.FC<SelectProps & { children?: React.ReactNode }> = ({ children, ...props }) => {
  return <div {...props}>{children}</div>
}

export const SelectTrigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
)

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => (
  <span>{placeholder}</span>
)

export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
)

export const SelectItem: React.FC<{ value: string } & React.LiHTMLAttributes<HTMLLIElement>> = ({ children, ...props }) => (
  <li {...props}>{children}</li>
)

export default Select


