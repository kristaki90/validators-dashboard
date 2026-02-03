export interface StakeDataPoint {
    epoch: number;
    stake: number;
}

export interface StakeData {
    address: string;
    data: StakeDataPoint[];
}

