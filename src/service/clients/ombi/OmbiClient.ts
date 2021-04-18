import axios, {AxiosInstance} from "axios";
import * as querystring from "querystring";

export class OmbiClient {
    private client: AxiosInstance;

    constructor(private ombiUrl: string, private apiKey: string) {
        this.client = axios.create({
            baseURL: ombiUrl,
            headers: {"ApiKey": apiKey}
        })
    }

    public async searchMovies(searchTerms: string) {
        const response = await this.client.get(`/api/v1/Search/movie/${querystring.escape(searchTerms)}`)
        return response.data
    }

}