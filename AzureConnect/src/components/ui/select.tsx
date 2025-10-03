import * as React from "react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = ({ children, ...props }: React.PropsWithChildren<SelectProps>) => {
  return <select {...props}>{children}</select>
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


