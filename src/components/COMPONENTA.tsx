"use client";
import { useEffect } from "react";
import React from "react";

const COMPONENTA = (props: any) => {
    useEffect(() => {
            console.log(props.data)
            console.log(props.dataRes)
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Component A</h1>
        </div>
    );
}
export default COMPONENTA;


