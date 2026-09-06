'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  leftIcon?: React.ReactNode;
  placeholder?: string;
  searchable?: boolean;
  value?: string | number | readonly string[];
  onChange?: (e: any) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      children,
      leftIcon,
      className = '',
      id,
      disabled = false,
      placeholder = 'પસંદ કરો / Select option...',
      searchable,
      value,
      defaultValue,
      onChange,
      name,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const containerRef = useRef<HTMLDivElement>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [internalValue, setInternalValue] = useState<string | number>(
      value !== undefined ? (value as any) : defaultValue !== undefined ? (defaultValue as any) : ''
    );

    // Sync controlled value
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value as any);
      }
    }, [value]);

    // Parse options from either `options` prop or `<option>` children
    const parsedOptions: SelectOption[] = useMemo(() => {
      if (options && options.length > 0) {
        return options;
      }
      if (children) {
        const list: SelectOption[] = [];
        React.Children.forEach(children, (child) => {
          if (React.isValidElement(child)) {
            const childProps = child.props as any;
            const val = childProps.value !== undefined ? childProps.value : childProps.children;
            let lbl = '';
            if (typeof childProps.children === 'string' || typeof childProps.children === 'number') {
              lbl = String(childProps.children);
            } else if (Array.isArray(childProps.children)) {
              lbl = childProps.children.map((c: any) => (typeof c === 'string' ? c : '')).join('');
            } else {
              lbl = String(val);
            }
            list.push({ value: val, label: lbl || String(val) });
          }
        });
        return list;
      }
      return [];
    }, [options, children]);

    // Currently selected option
    const selectedOption = useMemo(() => {
      return parsedOptions.find((opt) => String(opt.value) === String(internalValue));
    }, [parsedOptions, internalValue]);

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
      if (!searchQuery.trim()) return parsedOptions;
      const q = searchQuery.toLowerCase();
      return parsedOptions.filter(
        (opt) =>
          opt.label.toLowerCase().includes(q) ||
          String(opt.value).toLowerCase().includes(q) ||
          (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
      );
    }, [parsedOptions, searchQuery]);

    // Enable search bar if explicitly requested or if items > 5
    const showSearch = searchable !== undefined ? searchable : parsedOptions.length > 5;

    // Handle outside click to close dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Handle Escape key to close
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };
      if (isOpen) {
        window.addEventListener('keydown', handleKeyDown);
      }
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [isOpen]);

    // Handle option selection
    const handleSelectOption = (opt: SelectOption) => {
      setInternalValue(opt.value);
      setIsOpen(false);
      setSearchQuery('');

      // Update hidden select element
      if (hiddenSelectRef.current) {
        hiddenSelectRef.current.value = String(opt.value);
      }

      // Dispatch change event to parent
      if (onChange) {
        const syntheticEvent = {
          target: {
            value: opt.value,
            name: name || '',
          },
          currentTarget: {
            value: opt.value,
            name: name || '',
          },
          persist: () => {},
          stopPropagation: () => {},
          preventDefault: () => {},
        };
        onChange(syntheticEvent as any);
      }
    };

    return (
      <div className="w-full space-y-1.5" ref={containerRef}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
          >
            {label}
          </label>
        )}

        {/* Hidden native select for form libraries & refs */}
        <select
          ref={(node) => {
            hiddenSelectRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              (ref as any).current = node;
            }
          }}
          id={selectId}
          name={name}
          value={internalValue}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          {...props}
        >
          {parsedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom Luxury Dropdown Trigger Button */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                setIsOpen(!isOpen);
                setSearchQuery('');
              }
            }}
            className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border rounded-xl transition-all duration-200 text-left cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${
              isOpen
                ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md shadow-brand-500/10'
                : error
                ? 'border-rose-500 ring-2 ring-rose-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            } ${className}`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1 truncate">
              {leftIcon && (
                <span className="flex-shrink-0 text-slate-400 dark:text-slate-500">
                  {leftIcon}
                </span>
              )}
              {selectedOption?.icon && (
                <span className="flex-shrink-0">{selectedOption.icon}</span>
              )}
              <span
                className={`truncate font-semibold ${
                  selectedOption
                    ? 'text-slate-900 dark:text-slate-100'
                    : 'text-slate-400 dark:text-slate-500 font-normal'
                }`}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>

            <ChevronDown
              className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-brand-600 dark:text-brand-400' : ''
              }`}
            />
          </button>

          {/* Luxury Animated Popup Menu */}
          {isOpen && (
            <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
              {/* Optional Search Box */}
              {showSearch && (
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/40">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="શોધો / Search options..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              )}

              {/* Options List */}
              <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-3 text-center text-xs text-slate-400">
                    કોઈ પરિણામ મળ્યું નથી / No matching options
                  </div>
                ) : (
                  filteredOptions.map((opt) => {
                    const isSelected = String(opt.value) === String(internalValue);

                    return (
                      <div
                        key={opt.value}
                        onClick={() => handleSelectOption(opt)}
                        className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-brand-600 dark:hover:text-brand-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate flex-1">
                          {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                          <div className="truncate">
                            <div className="truncate">{opt.label}</div>
                            {opt.sublabel && (
                              <div className="text-[10px] text-slate-400 font-normal truncate">
                                {opt.sublabel}
                              </div>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 animate-fade-in">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
