import dynamic from "next/dynamic";
const LoadingPopup = dynamic(() => import("@/components/LoadingPopup"), { ssr: false });

const Loading = () => {
    return (
        <LoadingPopup/>
    );
};

export default Loading;
