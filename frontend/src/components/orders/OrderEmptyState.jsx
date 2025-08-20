import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderEmptyState = ({ message }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-10">
            <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-10 max-w-md w-full">
                <Package size={80} strokeWidth={2.5} className="mb-4" style={{ color: '#FFC107', filter: 'drop-shadow(0 0 8px #FFC10788)' }} />
                <div className="text-2xl font-extrabold text-[#232323] mb-2 text-center">No Orders Found</div>
                <div className="text-gray-500 mb-6 text-center">{message}</div>
                <Button
                    variant="yellow"
                    className="w-full text-lg font-bold py-3"
                    onClick={() => navigate('/menus')}
                >
                    Browse Menu
                </Button>
            </div>
        </div>
    );
};

OrderEmptyState.propTypes = {
  message: PropTypes.string,
};

export default OrderEmptyState;
