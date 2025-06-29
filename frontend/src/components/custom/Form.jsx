import React from 'react';
import { cn } from '../../lib/utils';

const Form = React.forwardRef(({
    onSubmit,
    children,
    className,
    ...props
}, ref) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(e);
        }
    };

    return (
        <form
            ref={ref}
            onSubmit={handleSubmit}
            className={cn("space-y-6", className)}
            {...props}
        >
            {children}
        </form>
    );
});

Form.displayName = 'Form';

export default Form;
