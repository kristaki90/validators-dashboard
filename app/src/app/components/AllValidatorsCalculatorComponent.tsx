"use client"

import * as React from "react"
import { Spinner } from "./ui/spinner";
import { useMemo, useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useGetLatestSuiSystemState } from "../hooks/useGetLatestSuiSystemState";
import { AllValidatorsRewards, ValidatorRewardsResult } from "../types/AllValidatorsRewards";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    SortingState,
    useReactTable,
    ColumnFiltersState
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table"
import { SlArrowUp, SlArrowDown } from "react-icons/sl";
import Image from "next/image";
import { useRouter } from 'next/navigation'
import { truncateString } from "@/app/helpers/truncateString";

const ValidatorImage = ({ imageUrl, name }: { imageUrl: string; name: string }) => {
    const [imageError, setImageError] = useState(false);

    if (imageError || !imageUrl) {
        return null;
    }

    return (
        <Image
            src={imageUrl}
            alt={name}
            className="rounded-full mr-4 flex-shrink-0"
            width={40}
            height={40}
            onError={() => setImageError(true)}
        />
    );
}

export default function AllValidatorsCalculatorComponent() {
    const router = useRouter();
    const [allValidatorsRewards, setAllValidatorsRewards] = useState<AllValidatorsRewards | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [stakeInput, setStakeInput] = useState<string>("");
    const [epochInput, setEpochInput] = useState<string>("");
    const [suiPrice, setSuiPrice] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const { suiSystemState, validators } = useGetLatestSuiSystemState();

    const normalizedStake = useMemo(() => {
        const numericStake = Number(stakeInput.replace(/,/g, ''));
        return Number.isFinite(numericStake) && numericStake > 0 ? numericStake : null;
    }, [stakeInput]);

    const normalizedEpoch = useMemo(() => {
        const numericEpoch = Number(epochInput.replace(/,/g, ''));
        return Number.isFinite(numericEpoch) && numericEpoch >= 0 && Number.isInteger(numericEpoch) ? numericEpoch : null;
    }, [epochInput]);

    const formattedStakeInput = useMemo(() => {
        if (!stakeInput) return '';
        if (isFocused) {
            return stakeInput;
        }
        const numericValue = stakeInput.replace(/,/g, '');
        if (!numericValue) return '';
        if (numericValue.includes('.')) {
            const parts = numericValue.split('.');
            const integerPart = parts[0] ? Number(parts[0]).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '';
            return integerPart + (parts[1] !== undefined ? '.' + parts[1] : '');
        }
        const num = Number(numericValue);
        if (isNaN(num) || num === 0) return numericValue;
        return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }, [stakeInput, isFocused]);

    useEffect(() => {
        const fetchSuiPrice = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd');
                const data = await response.json();
                if (data.sui?.usd) {
                    setSuiPrice(data.sui.usd);
                }
            } catch (err) {
                console.error("Error fetching SUI price:", err);
            }
        };
        fetchSuiPrice();
    }, []);

    const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');
        if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
            setStakeInput(rawValue);
        }
    };

    const handleEpochChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');
        if (rawValue === '' || /^\d+$/.test(rawValue)) {
            setEpochInput(rawValue);
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const calculateRewards = () => {
        if (!normalizedStake || normalizedEpoch === null) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setAllValidatorsRewards(null);
        fetch(`https://sui-validators-dashboard.onrender.com/api/simulate-staking-rewards_for_all_validators/${normalizedStake}/${normalizedEpoch}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to calculate rewards: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then((data) => {
                setIsLoading(false);
                // Handle both array and object response formats
                // Also handle case where rewards might be directly on the object
                let processedData;
                if (Array.isArray(data)) {
                    processedData = { results: data };
                } else if (data.results && Array.isArray(data.results)) {
                    processedData = data;
                } else {
                    throw new Error('Unexpected response format from API');
                }

                // Normalize the data structure - ensure each result has a rewards object
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                processedData.results = processedData.results.map((item: any) => {
                    // If rewards fields are directly on the item, wrap them in a rewards object
                    if (!item.rewards && (item.gainSui !== undefined || item.finalAmount !== undefined)) {
                        return {
                            ...item,
                            rewards: {
                                gainSui: item.gainSui,
                                finalAmount: item.finalAmount,
                                returnPercent: item.returnPercent,
                                initialStake: item.initialStake,
                                epochStart: item.epochStart,
                                epochNow: item.epochNow,
                            }
                        };
                    }
                    return item;
                });

                console.log('Processed rewards data:', processedData);
                setAllValidatorsRewards(processedData);
                setError(null);
            })
            .catch((err) => {
                setIsLoading(false);
                setError(err.message || 'An error occurred while calculating rewards. Please try again.');
                console.error("Error calculating rewards:", err);
            });
    };

    // Enrich results with validator names and images
    const enrichedResults = useMemo(() => {
        if (!allValidatorsRewards?.results || !validators) {
            return [];
        }

        return allValidatorsRewards.results
            .filter((result) => result && result.address) // Filter out invalid results
            .map((result) => {
                const validator = validators.find((v) => v.address === result.address);
                return {
                    ...result,
                    // Ensure rewards object exists
                    rewards: result.rewards || {},
                    name: validator?.name || result.name || truncateString(result.address),
                    imageUrl: validator?.imageUrl || '',
                };
            });
    }, [allValidatorsRewards, validators]);

    const columns: ColumnDef<ValidatorRewardsResult & { name: string; imageUrl: string }>[] = React.useMemo(() => [
        {
            accessorKey: "name",
            header: "Validator",
            cell: ({ row }) => {
                const validator = row.original;
                return (
                    <div className="p-2 flex flex-row w-full justify-left items-start min-w-0">
                        <ValidatorImage imageUrl={validator.imageUrl} name={validator.name} />
                        <div className="p-2 flex flex-col w-full justify-left items-start min-w-0">
                            <div className="font-bold truncate w-full">{validator.name}</div>
                            <div className="lowercase truncate w-full text-sm text-gray-500">{truncateString(validator.address)}</div>
                        </div>
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            id: "gainSui",
            accessorKey: "rewards.gainSui",
            header: "SUI Gain",
            accessorFn: (row) => {
                const rewards = row.rewards;
                if (!rewards || rewards.gainSui === undefined) return 0;
                return Number(rewards.gainSui);
            },
            cell: ({ row }) => {
                const rewards = row.original.rewards;
                if (!rewards || rewards.gainSui === undefined) {
                    return <div className="p-2 text-gray-400">-</div>;
                }
                const gainSui = Number(rewards.gainSui);
                return (
                    <div className="p-2">
                        <div className="font-bold">{gainSui.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SUI</div>
                        {suiPrice && (
                            <div className="text-sm text-indigo-600">${(gainSui * suiPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        )}
                    </div>
                );
            },
            enableSorting: true,
        },
        {
            accessorKey: "rewards.returnPercent",
            header: "Reward %",
            accessorFn: (row) => {
                const rewards = row.rewards;
                if (!rewards || rewards.returnPercent === undefined) return 0;
                return Number(rewards.returnPercent);
            },
            cell: ({ row }) => {
                const rewards = row.original.rewards;
                if (!rewards || rewards.returnPercent === undefined) {
                    return <div className="p-2 text-gray-400">-</div>;
                }
                const returnPercent = Number(rewards.returnPercent);
                return (
                    <div className="p-2 font-bold">{returnPercent.toFixed(2)}%</div>
                );
            },
            enableSorting: true,
        },
        {
            accessorKey: "rewards.finalAmount",
            header: "Final Amount",
            accessorFn: (row) => {
                const rewards = row.rewards;
                if (!rewards || rewards.finalAmount === undefined) return 0;
                return Number(rewards.finalAmount);
            },
            cell: ({ row }) => {
                const rewards = row.original.rewards;
                if (!rewards || rewards.finalAmount === undefined) {
                    return <div className="p-2 text-gray-400">-</div>;
                }
                const finalAmount = Number(rewards.finalAmount);
                return (
                    <div className="p-2">
                        <div className="font-bold">{finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SUI</div>
                        {suiPrice && (
                            <div className="text-sm text-indigo-600">${(finalAmount * suiPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        )}
                    </div>
                );
            },
            enableSorting: true,
        },
    ], [suiPrice]);

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 50,
    });

    const [sorting, setSorting] = React.useState<SortingState>([
        {
            id: "gainSui",
            desc: true,
        },
    ]);

    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data: enrichedResults,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            pagination,
            sorting,
            columnFilters,
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleRowClick = (row: any) => {
        router.push(`validator/${row.original.address}`);
    };

    return (
        <section className="my-10">
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
                <div className="p-6 md:p-10 space-y-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Rewards Calculator</p>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight">Compare Rewards Across All Validators</h2>
                        <p className="mt-2 text-sm text-white/80 max-w-2xl">
                            Enter a stake amount and start epoch to compare projected rewards across all validators.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white/15 p-5 backdrop-blur">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <label htmlFor="stake" className="text-xs font-semibold uppercase tracking-wide text-white/80">
                                    Stake Amount (SUI)
                                </label>
                                <div className="relative mt-1">
                                    <Input
                                        id="stake"
                                        type="text"
                                        inputMode="numeric"
                                        value={formattedStakeInput}
                                        onChange={handleStakeChange}
                                        onFocus={handleFocus}
                                        onBlur={handleBlur}
                                        placeholder="e.g. 10,000"
                                        className="text-base bg-white/95 text-slate-900 pr-12"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">
                                        SUI
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <label htmlFor="epoch" className="text-xs font-semibold uppercase tracking-wide text-white/80">
                                    Start Epoch
                                </label>
                                <div className="relative mt-1">
                                    <Input
                                        id="epoch"
                                        type="text"
                                        inputMode="numeric"
                                        value={epochInput}
                                        onChange={handleEpochChange}
                                        placeholder={suiSystemState?.epoch ? `Current: ${suiSystemState.epoch}` : "e.g. 100"}
                                        className="text-base bg-white/95 text-slate-900"
                                    />
                                </div>
                            </div>
                            <Button
                                size="lg"
                                className="md:w-auto bg-white text-slate-900 hover:bg-slate-100"
                                onClick={calculateRewards}
                                disabled={isLoading || !normalizedStake || normalizedEpoch === null}
                            >
                                {isLoading ? "Calculating..." : "Calculate rewards"}
                            </Button>
                        </div>

                        <div className="mt-6 min-h-[120px]">
                            {isLoading && (
                                <div className="flex justify-center py-6">
                                    <Spinner />
                                </div>
                            )}

                            {!isLoading && error && (
                                <div className="rounded-xl border-2 border-red-400 bg-red-50 p-6">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-red-900 mb-1">Error</h3>
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isLoading && !error && allValidatorsRewards && enrichedResults.length > 0 && (
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                                        <p className="text-sm text-white/90">
                                            Showing results for <span className="font-bold">{enrichedResults.length}</span> validators
                                            {allValidatorsRewards.results[0]?.rewards?.epochStart && (
                                                <span className="ml-2">
                                                    (Start: Epoch #{allValidatorsRewards.results[0].rewards.epochStart}, Current: Epoch #{allValidatorsRewards.results[0].rewards.epochNow})
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white shadow-inner overflow-hidden">
                                        <div className="max-h-[600px] overflow-y-auto">
                                            <Table>
                                                <TableHeader className="sticky top-0 z-10 bg-slate-50">
                                                    {table.getHeaderGroups().map((headerGroup) => (
                                                        <TableRow key={headerGroup.id} className="bg-slate-50">
                                                            {headerGroup.headers.map((header) => {
                                                                return (
                                                                    <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50">
                                                                        {header.isPlaceholder ? null : (
                                                                            <div
                                                                                className={
                                                                                    header.column.getCanSort()
                                                                                        ? 'cursor-pointer select-none flex items-center gap-2'
                                                                                        : 'flex items-center gap-2'
                                                                                }
                                                                                onClick={header.column.getToggleSortingHandler()}
                                                                                title={
                                                                                    header.column.getCanSort()
                                                                                        ? header.column.getNextSortingOrder() === 'asc'
                                                                                            ? 'Sort ascending'
                                                                                            : header.column.getNextSortingOrder() === 'desc'
                                                                                                ? 'Sort descending'
                                                                                                : 'Clear sort'
                                                                                        : undefined
                                                                                }
                                                                            >
                                                                                {flexRender(
                                                                                    header.column.columnDef.header,
                                                                                    header.getContext()
                                                                                )}
                                                                                {{
                                                                                    asc: <SlArrowUp />,
                                                                                    desc: <SlArrowDown />,
                                                                                }[header.column.getIsSorted() as string] ?? null}
                                                                            </div>
                                                                        )}
                                                                    </TableHead>
                                                                )
                                                            })}
                                                        </TableRow>
                                                    ))}
                                                </TableHeader>
                                                <TableBody>
                                                    {table.getRowModel().rows?.length ? (
                                                        table.getRowModel().rows.map((row) => (
                                                            <TableRow
                                                                key={row.id}
                                                                onClick={() => handleRowClick(row)}
                                                                className="cursor-pointer bg-white transition hover:bg-indigo-50/60"
                                                            >
                                                                {row.getAllCells().map((cell) => (
                                                                    <TableCell key={cell.id} className="text-sm text-slate-700">
                                                                        {flexRender(
                                                                            cell.column.columnDef.cell,
                                                                            cell.getContext()
                                                                        )}
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={columns.length}
                                                                className="h-24 text-center text-sm text-slate-500"
                                                            >
                                                                No results.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-slate-600 bg-white rounded-lg p-3">
                                        <span>
                                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount().toLocaleString()}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant={"outline"}
                                                onClick={() => table.previousPage()}
                                                disabled={!table.getCanPreviousPage()}
                                                className="rounded-full px-4"
                                            >
                                                Prev
                                            </Button>
                                            <Button
                                                variant={"outline"}
                                                onClick={() => { table.nextPage(); }}
                                                disabled={!table.getCanNextPage()}
                                                className="rounded-full px-4"
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isLoading && !error && !allValidatorsRewards && (
                                <div className="rounded-xl bg-white/20 p-6 text-center text-white/80">
                                    Enter a stake amount and start epoch to see projected rewards for all validators.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

