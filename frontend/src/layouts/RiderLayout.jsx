import PropTypes from 'prop-types';
import RiderHeader from '../components/RiderHeader';
import RiderMobileNavBar from '../components/RiderMobileNavBar';

function RiderLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#232323] flex flex-col">
            {/* Desktop Header */}
            <div className="hidden md:block sticky top-0 z-50">
                <RiderHeader />
            </div>
            {/* Main content: white bg only on md+; scrollable on mobile */}
            <div className="flex-1 w-full overflow-y-auto md:overflow-visible">
                <main className="pt-4 md:pt-0 pb-16 md:pb-0 bg-transparent md:bg-white min-h-0">
                    {children}
                </main>
            </div>
            {/* Mobile Bottom Nav (sticky) */}
            <div className="md:hidden sticky bottom-0 z-40">
                <RiderMobileNavBar />
            </div>
        </div>
    );
}

RiderLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default RiderLayout;
