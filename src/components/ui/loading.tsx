export const LoadingContainer = () => {

    return (
        <div className="min-h-screen bg-[#E5E5E5] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C88D00]"></div>
                  <p className="text-[#1A1A1A] tracking-widest text-sm animate-pulse">
                    LOADING...
                  </p>
                </div>
        </div>
    );
};