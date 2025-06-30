"use client"
import React, { useEffect } from 'react'

const COMPONENTA = (props: any) => {
	useEffect(() => {
		console.log(props?.sessionClaims);
	}, []);

	return (
		<div>COMPONENTA</div>
	)
}

export default COMPONENTA