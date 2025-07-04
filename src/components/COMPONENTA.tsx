"use client";
import { useEffect } from "react";
import React from "react";

const COMPONENTA = (props: any) => {
    useEffect(() => {
            console.log(props.data)
            console.log(props.dataRes)
        }, [])

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Component A</h1>
        </div>
    );
}
export default COMPONENTA;


