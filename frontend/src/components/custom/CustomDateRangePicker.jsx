import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import dayjs from 'dayjs';

/**
 * CustomDateRangePicker component
 * @param {string} label - The label for the date range picker
 * @param {object} value - The current value { from: Date, to: Date }
 * @param {function} onChange - Callback for value change
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Disabled state
 * @param {string} name - Name attribute
 * @param {string} className - Additional className
 */
export default function CustomDateRangePicker({
    label,
    value,
    onChange,
    placeholder = 'Select date range',
    disabled = false,
    name,
    className
}) {
    const [open, setOpen] = useState(false);

    const formatDateRange = () => {
        if (!value?.from) return placeholder;
        if (!value?.to) return dayjs(value.from).format('MMM D, YYYY');
        return `${dayjs(value.from).format('MMM D, YYYY')} - ${dayjs(value.to).format('MMM D, YYYY')}`;
    };

    return (
        <div className={className}>
            {label && <Label className="px-1 text-yellow-400 font-bold mb-2" htmlFor={name}>{label}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id={name}
                        className="w-full bg-[#232323] hover:bg-[#232323] hover:text-white border border-[#444] focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 text-white placeholder:text-[#BDBDBD] rounded-md h-11 px-3 py-2 flex justify-between items-center font-normal transition-colors disabled:opacity-60"
                        type="button"
                        disabled={disabled}
                    >
                        <span className={!value?.from ? "text-[#BDBDBD]" : ""}>
                            {formatDateRange()}
                        </span>
                        <ChevronDownIcon className="ml-2 text-yellow-400" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0 bg-[#232323] border border-[#444] text-white rounded-md shadow-lg" align="start">
                    <Calendar
                        mode="range"
                        selected={value}
                        onSelect={(range) => {
                            onChange(range);
                            if (range?.from && range?.to) {
                                setOpen(false);
                            }
                        }}
                        numberOfMonths={2}
                        className="bg-[#232323] text-white border-none [&_.rdp-day_selected]:bg-yellow-400 [&_.rdp-day_selected]:text-black [&_.rdp-day]:rounded-md [&_.rdp-day:hover]:bg-yellow-400 [&_.rdp-day:hover]:text-black [&_.rdp-day_outside]:text-[#555] [&_.rdp-day_disabled]:bg-[#232323] [&_.rdp-day_disabled]:text-[#555] [&_.rdp-day_range_start]:bg-yellow-400 [&_.rdp-day_range_end]:bg-yellow-400 [&_.rdp-day_range_middle]:bg-yellow-400/20"
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
} 