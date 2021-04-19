import axios, {AxiosInstance} from "axios";
import * as querystring from "querystring";
import {Logger} from "@nestjs/common";

export class OmbiClient {
    private client: AxiosInstance;
    private readonly logger = new Logger(typeof OmbiClient);

    constructor(private ombiUrl: string, private apiKey: string) {
        this.client = axios.create({
            baseURL: `${ombiUrl}/api/v1/`,
            headers: {"ApiKey": apiKey}
        })
    }

    public async searchMovies(searchTerm: string, year?: number) {
        this.logger.debug(`Searching movie ${searchTerm} released in year ${year}...`);
        const response = await this.client.post(`Search/movie`, {
            searchTerm,
            year,
            // As SensCritique movie always have the French names, we perform the search using french language
            "languageCode": "fr"
        });
        return response.data
    }

    public async requestMovie(theMovieDbId: string) {
        this.logger.debug(`Requesting movie ${theMovieDbId}...`);
        const response = await this.client.post(`Request/movie`, {
            theMovieDbId,
            "languageCode": "fr"
        })
        return response.data
    }
}