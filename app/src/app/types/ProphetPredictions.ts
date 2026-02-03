export interface ProphetPredictionPoint {
    epoch: number;
    prediction: number;
    lowerBound?: number;
    upperBound?: number;
}

export interface ProphetPredictions {
    address: string;
    data: ProphetPredictionPoint[];
}

