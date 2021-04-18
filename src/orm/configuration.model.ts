import {Column, Model, Table} from "sequelize-typescript";

@Table
export class Configuration extends Model {
    @Column
    scheduling?: string;

    @Column
    ombiUrl?: string;

    @Column
    ombiApiKey?: string;

    @Column
    sensCritiqueUserEmail?: string;

    @Column
    sensCritiqueUserPassword?: string;
}