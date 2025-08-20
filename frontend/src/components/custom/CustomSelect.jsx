import PropTypes from 'prop-types';
import {
    Select as ShadcnSelect,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function CustomSelect({
    label,
    value,
    onChange,
    options,
    placeholder = 'Select',
    disabled = false,
    name,
    className
}) {
    return (
        <div className={className}>
            {label && <Label className="px-1 text-yellow-400 font-bold  mb-2" htmlFor={name}>{label}</Label>}
            <ShadcnSelect value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger
                    id={name}
                    className="w-full bg-[#232323] border border-[#444] focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 text-white placeholder:text-[#BDBDBD] rounded-md py-5 px-5 text-lg font-medium transition-colors disabled:opacity-60"
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="bg-[#232323] border border-[#444] text-white rounded-md shadow-lg">
                    {options.map(opt => (
                        <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="hover:bg-yellow-400 hover:text-black focus:bg-yellow-400 focus:text-black px-3 py-2 cursor-pointer rounded"
                        >
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </ShadcnSelect>
        </div>
    );
}

CustomSelect.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    })).isRequired,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    name: PropTypes.string,
    className: PropTypes.string,
};
