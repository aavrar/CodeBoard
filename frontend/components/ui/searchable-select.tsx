"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface SelectOption {
  value: string
  label: string
  code?: string
  description?: string
}

interface SearchableSelectProps {
  options: SelectOption[]
  value?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  multiple?: boolean
  maxSelections?: number
  className?: string
  disabled?: boolean
}

export function SearchableSelect({
  options,
  value = [],
  onValueChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found",
  multiple = true,
  maxSelections,
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options
    
    const query = searchQuery.toLowerCase().trim()
    return options.filter(option => 
      option.label.toLowerCase().includes(query) ||
      option.code?.toLowerCase().includes(query) ||
      option.description?.toLowerCase().includes(query)
    )
  }, [options, searchQuery])

  // Get selected options for display
  const selectedOptions = React.useMemo(() => {
    return options.filter(option => value.includes(option.value))
  }, [options, value])

  const handleSelect = (optionValue: string) => {
    if (disabled) return

    let newValue: string[]
    
    if (multiple) {
      if (value.includes(optionValue)) {
        // Remove if already selected
        newValue = value.filter(v => v !== optionValue)
      } else {
        // Add if not selected (check max selections)
        if (maxSelections && value.length >= maxSelections) {
          return // Don't add if at max
        }
        newValue = [...value, optionValue]
      }
    } else {
      // Single selection
      newValue = value.includes(optionValue) ? [] : [optionValue]
      setOpen(false) // Close dropdown for single selection
    }
    
    onValueChange?.(newValue)
  }

  const handleRemove = (optionValue: string) => {
    if (disabled) return
    const newValue = value.filter(v => v !== optionValue)
    onValueChange?.(newValue)
  }

  const clearAll = () => {
    if (disabled) return
    onValueChange?.([])
  }

  const getDisplayText = () => {
    if (value.length === 0) {
      return placeholder
    }
    
    if (!multiple) {
      const selected = selectedOptions[0]
      return selected ? selected.label : placeholder
    }
    
    if (value.length === 1) {
      return selectedOptions[0]?.label || placeholder
    }
    
    return `${value.length} selected`
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between text-left font-normal",
              !value.length && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder={searchPlaceholder}
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="flex-1"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="h-auto p-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <CommandList className="max-h-60">
              {filteredOptions.length === 0 ? (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value.includes(option.value) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{option.label}</span>
                          {option.code && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {option.code}
                            </span>
                          )}
                        </div>
                        {option.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
            
            {multiple && value.length > 0 && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="w-full"
                >
                  Clear all ({value.length})
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Display selected items as badges for multiple selection */}
      {multiple && value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedOptions.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="text-xs"
            >
              <span className="mr-1">{option.label}</span>
              {!disabled && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleRemove(option.value)
                  }}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
      
      {/* Show selection count and limit */}
      {multiple && maxSelections && (
        <div className="text-xs text-muted-foreground mt-1">
          {value.length} of {maxSelections} selected
        </div>
      )}
    </div>
  )
}