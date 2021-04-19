import axios, {AxiosInstance} from "axios";
import * as querystring from "querystring";

export class OmbiClient {
    private client: AxiosInstance;

    constructor(private ombiUrl: string, private apiKey: string) {
        this.client = axios.create({
            baseURL: `${ombiUrl}/api/v1/`,
            headers: {"ApiKey": apiKey}
        })
    }

    public async searchMovies(searchTerms: string) {
        const response = await this.client.get(`Search/movie/${querystring.escape(searchTerms)}`)
        return response.data
    }

    public async requestMovie(theMovieDbId: string) {
        const response = await this.client.post(`Request/movie`, {
            theMovieDbId,
            "languageCode": "FR"
        })
        return response.data
    }
}