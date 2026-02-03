export interface ValidatorPrediction {
    validator_name: string;
    validator_address: string;
    mean_predicted_apy: number;
    min_predicted_apy: number;
    max_predicted_apy: number;
    last_APY: number;
}

export interface AllValidatorsPredictions {
    results: ValidatorPrediction[];
}

