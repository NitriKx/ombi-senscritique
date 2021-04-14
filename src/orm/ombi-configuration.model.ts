import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity("OMBI_CONFIGURATION")
export class OmbiConfiguration {
    @PrimaryGeneratedColumn({ name: "URL" })
    url!: string;

    @Column({ name: "API_KEY" })
    apiKey?: string;
}