import {SensCritiqueGqlClient} from "senscritique-graphql-api";
import {GetUserInfo} from "./requests/GetUserInfo";
import {Logger} from "@nestjs/common";

export class SensCritiqueClient {
    private readonly logger = new Logger(typeof SensCritiqueClient);

    private senscritiqueGraphQLClient: Promise<SensCritiqueGqlClient>;
    // private userId: number;

    constructor(senscritiqueUserEmail: string, senscritiqueUserPassword: string) {
        this.senscritiqueGraphQLClient = SensCritiqueGqlClient.build(senscritiqueUserEmail, senscritiqueUserPassword);
    }

    public async getUserId() {
        const userInfo = await (await this.senscritiqueGraphQLClient).request(GetUserInfo.doc);
        this.logger.log(`Using Senscritique client for user ${userInfo.me.name} (${userInfo.me.id})`);
        return userInfo;
    }


}