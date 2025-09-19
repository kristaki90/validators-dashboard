"use client"

import * as React from "react"

export default function InfoComponent() {
    return (
        <div className="my-7">
            <div className="w-full">
                <div className="flex flex-row w-full justify-between space-x-4">
                    <div className="w-full overflow-hidden rounded-md border p-7 bg-white shadow-lg">
                        <div className="p-2 text-gray-500 text-sm font-bold">  Epoch </div>
                        <div className="p-2 text-2xl font-bold">  61 </div>
                    </div>
                    <div className="w-full overflow-hidden rounded-md border p-7 bg-white shadow-lg">
                        <div className="p-2  text-gray-500 text-sm font-bold">  Avg. APY </div>
                        <div className="p-2 text-2xl font-bold">  0% </div>
                    </div>
                </div>
                <div className="flex flex-row w-full justify-between space-x-4 pt-4">
                    <div className="w-full overflow-hidden rounded-md border p-7 bg-white shadow-lg">
                        <div className="p-2 text-gray-500 text-sm font-bold">  Total Staked </div>

                        <div className="p-2 flex flex-row w-full justify-left items-end">
                            <div className=" text-2xl font-bold">  126,858,891 </div>
                            <div className=" text-gray-500 text-sm font-bold">  .93 SUI </div>
                        </div>
                    </div>
                    <div className="w-full overflow-hidden rounded-md border p-7 bg-white shadow-lg text-align-left">
                        <div className="p-2 text-gray-500 text-sm font-bold">  Next Epoch Reference Gas Price </div>

                        <div className="p-2 flex flex-row w-full justify-left items-end">
                            <div className="text-2xl font-bold ">  1,000 </div>
                            <div className="pl-1 text-gray-500 text-sm font-bold">  MIST </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}