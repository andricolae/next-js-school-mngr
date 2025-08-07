const LoadingPopup = () => {
    return (
        <>
            <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-[999] pointer-events-auto"></div>
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 bg-black/80 rounded-lg z-[1000] text-center pointer-events-none">
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        </>
    );
};

export default LoadingPopup;
