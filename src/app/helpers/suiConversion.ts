import { MIST_PER_SUI } from "@mysten/sui/utils";
export function mistToSui(mist: number): number {
    const sui = mist / Number(MIST_PER_SUI)
    return sui
    // .toLocaleString('en-US', {
//     minimumFractionDigits: 2,
//         maximumFractionDigits: 2
// });
}