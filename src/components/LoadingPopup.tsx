"use client";
import React from "react";

const LoadingPopup: React.FC = () => {
	return (
		<>
			<div style={overlayStyle}></div>
			<div style={popupStyle}>
				<div style={spinnerStyle}></div>
				<style jsx>{`
					@keyframes spin {
						0% {
							transform: rotate(0deg);
						}
						100% {
							transform: rotate(360deg);
						}
					}
				`}</style>
			</div>
		</>
	);
};

const overlayStyle: React.CSSProperties = {
	position: "fixed",
	top: 0,
	left: 0,
	width: "100%",
	height: "100%",
	backgroundColor: "rgba(0, 0, 0, 0.5)",
	zIndex: 999,
	pointerEvents: "auto",
};

const popupStyle: React.CSSProperties = {
	position: "fixed",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	padding: "20px",
	backgroundColor: "rgba(0, 0, 0, 0.8)",
	borderRadius: "10px",
	zIndex: 1000,
	textAlign: "center",
	pointerEvents: "none",
};

const spinnerStyle: React.CSSProperties = {
	width: "40px",
	height: "40px",
	border: "4px solid white",
	borderTop: "4px solid transparent",
	borderRadius: "50%",
	animation: "spin 1s linear infinite",
};

export default LoadingPopup;
