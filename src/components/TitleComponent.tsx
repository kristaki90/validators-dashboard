"use client"

import * as React from "react"

export default function TitleComponent(props: { title: string} ) {
    return (
        <div className="w-full">
            <div className="mx-auto p-7 text-3xl text-white font-bold"> {props.title} </div>
        </div>
    );
}