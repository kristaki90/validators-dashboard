export interface ApyDataPoint {
    epoch: number;
    apy: number;
}

export interface ApyData {
    address: string;
    data: ApyDataPoint[];
}

