import {gql} from "graphql-request";
import {SensCritiqueUniverse} from "../SensCritiqueUniverse";

export interface ListWishesParams {
    /**
     * The senscritique user id we want the wishes
     */
    userId: number;
    /**
     * The universe we want the wishes.
     *
     * Default: all the universes
     */
    universe?: SensCritiqueUniverse;
    /**
     * The sorting criterion.
     *
     * Default: user_last_action
     */
    sortBy?: string;
    /**
     * The maximum number of entries we want.
     *
     * Default: 30
     */
    limit?: number;
    /**
     * The offset in the query.
     *
     * Default: 0
     */
    offset?: number;
}

export interface Wish {
    id: number;
    title: string;
}

export class ListWishes {
    
    public static readonly doc = gql`
    query UserWishes($userId: Int!, $universe: String = "", $sortBy: String = "user_last_action", $limit: Int = 30, $offset: Int = 0) {
      user(id: $userId) {
        wishes(universe: $universe, sortBy: $sortBy, limit: $limit, offset: $offset) {
          id
          title
        }
      }
    }
    `
    
}