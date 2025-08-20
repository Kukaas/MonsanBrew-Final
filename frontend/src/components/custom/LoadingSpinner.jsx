import PropTypes from 'prop-types';

export default function LoadingSpinner({ message = 'Loading...' }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen min-w-full bg-[#232323]">
            <svg className="animate-spin mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#FFC107" strokeWidth="4" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
            <div className="text-[#BDBDBD] text-lg font-semibold">{message}</div>
        </div>
    );
}

LoadingSpinner.propTypes = {
    message: PropTypes.string,
};
