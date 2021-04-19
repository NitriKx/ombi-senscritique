import {SensCritiqueGqlClient} from "senscritique-graphql-api";
import {GetUserInfo} from "./requests/GetUserInfo";
import {Logger} from "@nestjs/common";
import {SensCritiqueUniverse} from "./SensCritiqueUniverse";
import {ListWishes, ListWishesParams, Wish} from "./requests/ListWishes";

export class SensCritiqueClient {
    private static readonly logger = new Logger(typeof SensCritiqueClient);

    private constructor(private sensCritiqueGraphQlClient: SensCritiqueGqlClient, private userId: number) {}

    public static async build(email: string, password: string): Promise<SensCritiqueClient> {
        const client = await SensCritiqueGqlClient.build(email, password);
        const userInfo = await client.request(GetUserInfo.doc);
        SensCritiqueClient.logger.log(`Using Senscritique client for user ${userInfo.me.name} (${userInfo.me.id})`);
        return new SensCritiqueClient(client, userInfo.me?.id);
    }

    public async listWishes(universe: SensCritiqueUniverse) {
        const parameters: ListWishesParams = {
            userId: this.userId,
            universe,
            limit: 1000,
            offset: 0
        }
        const response = await this.sensCritiqueGraphQlClient.request(ListWishes.doc, parameters);
        return response.user.wishes as Wish[];
    }

}