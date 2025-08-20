import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import dayjs from 'dayjs';

/**
 * CustomDatePicker component
 * @param {string} label - The label for the date picker
 * @param {string} value - The current value (ISO string)
 * @param {function} onChange - Callback for value change (ISO string)
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Disabled state
 * @param {string} name - Name attribute
 * @param {string} className - Additional className
 */
export default function CustomDatePicker({
    label,
    value,
    onChange,
    placeholder = 'Select date',
    disabled = false,
    name,
    className
}) {
    const [open, setOpen] = useState(false);
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
                        {value ? dayjs(value).format('MMMM D, YYYY') : <span className="text-[#BDBDBD]">{placeholder}</span>}
                        <ChevronDownIcon className="ml-2 text-yellow-400" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0 bg-[#232323] border border-[#444] text-white rounded-md shadow-lg" align="start">
                    <Calendar
                        mode="single"
                        selected={value ? new Date(value) : undefined}
                        captionLayout="dropdown"
                        onSelect={date => {
                            onChange(date ? date.toISOString() : '');
                            setOpen(false);
                        }}
                        fromYear={2000}
                        toYear={2100}
                        className="bg-[#232323] text-white border-none [&_.rdp-day_selected]:bg-yellow-400 [&_.rdp-day_selected]:text-black [&_.rdp-day]:rounded-md [&_.rdp-day:hover]:bg-yellow-400 [&_.rdp-day:hover]:text-black [&_.rdp-day_outside]:text-[#555] [&_.rdp-day_disabled]:bg-[#232323] [&_.rdp-day_disabled]:text-[#555]"
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

CustomDatePicker.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    name: PropTypes.string,
    className: PropTypes.string,
};
