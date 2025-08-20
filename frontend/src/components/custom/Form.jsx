import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

const Form = forwardRef(({
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

Form.propTypes = {
    onSubmit: PropTypes.func,
    children: PropTypes.node,
    className: PropTypes.string,
};

export default Form;
