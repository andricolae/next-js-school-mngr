import dynamic from "next/dynamic";
const LoadingPopup = dynamic(() => import("@/components/LoadingPopup"));

const Loading = () => {
    return (
        <LoadingPopup/>
    );
};

export default Loading;
