export interface PoolShareDataPoint {
    epoch: number;
    poolShare: number;
}

export interface PoolShareData {
    address: string;
    data: PoolShareDataPoint[];
}

